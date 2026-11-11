import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { aiTaskCost, aiTaskReference, IMAGE_MAX_COUNT, TALKING_PHOTO_MAX_SECONDS, type AiTaskKind } from './ai-pricing';

export type AiTaskResult =
  | { ok: true; taskId: string; providerJobId: string; cost: number }
  | { ok: false; error: 'provider_not_configured' | 'insufficient' | 'provider_failed' | 'provider_billing' | 'failed' };

const media = z.string().max(8_000_000).refine((v) => /^https:\/\//.test(v) || /^data:image\/(png|jpeg|webp);base64,/.test(v), 'invalid_image');
const talkingSchema = z.object({ imageUrl: media, script: z.string().trim().min(1).max(1000), voiceId: z.string().max(100).optional(), seconds: z.number().int().min(1).max(TALKING_PHOTO_MAX_SECONDS) });
const swapSchema = z.object({ targetImage: media, faceImage: media });
const imageSchema = z.object({ prompt: z.string().trim().min(3).max(1000), aspectRatio: z.enum(['1:1', '16:9', '9:16']), style: z.enum(['photo', 'studio', 'avatar']), count: z.number().int().min(1).max(IMAGE_MAX_COUNT) });

async function run(kind: AiTaskKind, userId: string, units: number, submit: (a: import('./ai-adapters.server').AsyncAiAdapter) => Promise<{ providerJobId: string }> | undefined): Promise<AiTaskResult> {
  const { getAdapter, AdapterUnavailable } = await import('./ai-adapters.server');
  let adapter;
  try { adapter = getAdapter(kind); } catch (e) { if (e instanceof AdapterUnavailable) return { ok: false, error: 'provider_not_configured' }; throw e; }
  const cost = aiTaskCost(kind, units);
  const taskId = crypto.randomUUID();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const label = kind === 'talking_photo' ? 'Photo parlante' : kind === 'face_swap' ? 'Swap Photo' : "Génération d'image";
  const debit = await supabaseAdmin.rpc('post_ai_token_operation', { p_user_id: userId, p_tokens: -cost, p_kind: 'usage', p_reason: label, p_reference: aiTaskReference(kind, userId, taskId) });
  if (debit.error) return { ok: false, error: /insufficient/i.test(debit.error.message) ? 'insufficient' : 'failed' };
  try {
    const job = await submit(adapter);
    if (!job) throw new Error('unsupported');
    return { ok: true, taskId, providerJobId: job.providerJobId, cost };
  } catch (e) {
    const billing = e instanceof Error && e.message === 'provider_billing';
    console.error(`ai task ${kind} submit failed`, e instanceof Error ? e.message : e);
    await supabaseAdmin.rpc('post_ai_token_operation', { p_user_id: userId, p_tokens: cost, p_kind: 'refund', p_reason: `Remboursement — ${label}`, p_reference: aiTaskReference(kind, userId, taskId, true) });
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

export const getAiTaskStatus = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ kind: z.enum(['talking_photo', 'image_generation', 'face_swap']), providerJobId: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { getAdapter, AdapterUnavailable } = await import('./ai-adapters.server');
    try { return await getAdapter(data.kind).status(data.providerJobId); }
    catch (e) { if (e instanceof AdapterUnavailable) return { state: 'failed' as const, error: 'provider_not_configured' }; throw e; }
  });
