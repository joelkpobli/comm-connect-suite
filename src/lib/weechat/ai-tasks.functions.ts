import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { mp4DurationSeconds } from './mp4-duration';
import { aiTaskCost, aiTaskWallet, aiTaskReference, IMAGE_MAX_COUNT, CHARACTER_SWAP_MAX_BYTES, CHARACTER_SWAP_MAX_SECONDS, TALKING_PHOTO_MAX_SECONDS, type AiTaskKind } from './ai-pricing';

export type AiTaskResult =
  | { ok: true; taskId: string; providerJobId: string; cost: number }
  | { ok: false; error: 'provider_not_configured' | 'insufficient' | 'provider_failed' | 'provider_billing' | 'maintenance' | 'failed' };

const media = z.string().max(8_000_000).refine((v) => /^https:\/\//.test(v) || /^data:image\/(png|jpeg|webp);base64,/.test(v), 'invalid_image');
const talkingSchema = z.object({ imageUrl: media, script: z.string().trim().min(1).max(1000), voiceId: z.string().max(100).optional(), seconds: z.number().int().min(1).max(TALKING_PHOTO_MAX_SECONDS) });
const swapSchema = z.object({ targetImage: media, faceImage: media });
const characterSchema = z.object({ video: z.string().max(Math.ceil(CHARACTER_SWAP_MAX_BYTES * 1.37) + 100).regex(/^data:video\/(mp4|quicktime);base64,/, 'invalid_video'), characterImage: media });
const imageSchema = z.object({ prompt: z.string().trim().min(3).max(1000), aspectRatio: z.enum(['1:1', '16:9', '9:16']), style: z.enum(['photo', 'studio', 'avatar']), count: z.number().int().min(1).max(IMAGE_MAX_COUNT) });

// Job tickets bind a provider job id to its owner so one user cannot poll another user's results.
async function sign(kind: string, userId: string, jobId: string) {
  const secret = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!secret) throw new Error('missing_signing_secret');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`ai-job|${kind}|${userId}|${jobId}`));
  return Array.from(new Uint8Array(mac), (b) => b.toString(16).padStart(2, '0')).join('');
}
async function makeJobTicket(kind: string, userId: string, jobId: string) { return `${jobId}.${await sign(kind, userId, jobId)}`; }
async function readJobTicket(kind: string, userId: string, ticket: string) {
  const i = ticket.lastIndexOf('.');
  if (i <= 0) return null;
  const jobId = ticket.slice(0, i), sig = ticket.slice(i + 1);
  return sig === await sign(kind, userId, jobId) ? jobId : null;
}

async function run(kind: AiTaskKind, userId: string, units: number, submit: (a: import('./ai-adapters.server').AsyncAiAdapter) => Promise<{ providerJobId: string } | undefined> | undefined): Promise<AiTaskResult> {
  const { getAdapter, AdapterUnavailable } = await import('./ai-adapters.server');
  const usage = await import('./provider-usage.server');
  if (await usage.isModulePaused('ai_generation')) return { ok: false, error: 'maintenance' };
  let adapter;
  try { adapter = getAdapter(kind); } catch (e) { if (e instanceof AdapterUnavailable) return { ok: false, error: 'provider_not_configured' }; throw e; }
  const cost = aiTaskCost(kind, units);
  const taskId = crypto.randomUUID();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const label = kind === 'talking_photo' ? 'Photo parlante' : kind === 'face_swap' ? 'Swap Photo' : kind === 'character_swap' ? 'Transformation totale' : "Génération d'image";
  const postOperation = (amount: number, refund = false) => {
    const common = { p_user_id: userId, p_kind: refund ? 'refund' : 'usage', p_reason: refund ? `Remboursement — ${label}` : label, p_reference: aiTaskReference(kind, userId, taskId, refund) };
    return aiTaskWallet(kind) === 'points'
      ? supabaseAdmin.rpc('post_credit_operation', { ...common, p_amount: amount })
      : supabaseAdmin.rpc('post_ai_token_operation', { ...common, p_tokens: amount });
  };
  const debit = await postOperation(-cost);
  if (debit.error) return { ok: false, error: /insufficient/i.test(debit.error.message) ? 'insufficient' : 'failed' };
  try {
    const job = await submit(adapter);
    if (!job) throw new Error('unsupported');
    await usage.recordProviderEvent(adapter.name, kind, 'ok', 'ai_generation');
    return { ok: true, taskId, providerJobId: await makeJobTicket(kind, userId, job.providerJobId), cost };
  } catch (e) {
    const billing = e instanceof Error && e.message === 'provider_billing';
    console.error(`ai task ${kind} submit failed`, e instanceof Error ? e.message : e);
    await usage.recordProviderEvent(adapter.name, kind, billing ? 'billing' : 'failed', 'ai_generation', e instanceof Error ? e.message : String(e));
    await postOperation(cost, true);
    return { ok: false, error: billing ? 'provider_billing' : 'provider_failed' };
  }
}

export const startTalkingPhotoTask = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => talkingSchema.parse(d))
  .handler(({ data, context }) => run('talking_photo', context.userId, data.seconds, (a) => a.submitTalkingPhoto?.(data)));

export const startImageGenerationTask = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => imageSchema.parse(d))
  .handler(({ data, context }) => run('image_generation', context.userId, data.count, (a) => a.submitImage?.(data)));

export const startFaceSwapTask = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => swapSchema.parse(d))
  .handler(({ data, context }) => run('face_swap', context.userId, 1, (a) => a.submitFaceSwap?.(data)));

export const startCharacterSwapTask = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => characterSchema.parse(d))
  .handler(async ({ data, context }): Promise<AiTaskResult | { ok: false; error: 'video_too_long' | 'video_unreadable' }> => {
    const raw = Uint8Array.from(atob(data.video.slice(data.video.indexOf(',') + 1)), (c) => c.charCodeAt(0));
    if (raw.byteLength > CHARACTER_SWAP_MAX_BYTES) return { ok: false, error: 'video_too_long' };
    const dur = mp4DurationSeconds(raw);
    if (!dur || dur <= 0) return { ok: false, error: 'video_unreadable' };
    const seconds = Math.ceil(dur);
    if (seconds > CHARACTER_SWAP_MAX_SECONDS) return { ok: false, error: 'video_too_long' };
    return run('character_swap', context.userId, seconds, async (a) => {
      if (!a.uploadVideo || !a.submitCharacterSwap) return undefined;
      const videoUrl = await a.uploadVideo(raw);
      return a.submitCharacterSwap({ videoUrl, characterImage: data.characterImage });
    });
  });

export const getAiTaskStatus = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ kind: z.enum(['talking_photo', 'image_generation', 'face_swap', 'character_swap']), providerJobId: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    const jobId = await readJobTicket(data.kind, context.userId, data.providerJobId);
    if (!jobId) return { state: 'failed' as const, error: 'not_found' };
    const { getAdapter, AdapterUnavailable } = await import('./ai-adapters.server');
    try { return await getAdapter(data.kind).status(jobId); }
    catch (e) { if (e instanceof AdapterUnavailable) return { state: 'failed' as const, error: 'provider_not_configured' }; throw e; }
  });
