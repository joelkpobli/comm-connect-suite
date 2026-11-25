import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { IMAGE_MAX_COUNT, CHARACTER_SWAP_MAX_BYTES, TALKING_PHOTO_MAX_SECONDS } from './ai-pricing';
import type { CharacterSwapResult } from './ai-tasks.server';

const core = () => import('./ai-tasks.server');

export type AiTaskResult =
  | { ok: true; taskId: string; providerJobId: string; cost: number }
  | { ok: false; error: 'provider_not_configured' | 'insufficient' | 'provider_failed' | 'provider_billing' | 'maintenance' | 'failed' };

const media = z.string().max(8_000_000).refine((v) => /^https:\/\//.test(v) || /^data:image\/(png|jpeg|webp);base64,/.test(v), 'invalid_image');
const talkingSchema = z.object({ imageUrl: media, script: z.string().trim().min(1).max(1000), voiceId: z.string().max(100).optional(), seconds: z.number().int().min(1).max(TALKING_PHOTO_MAX_SECONDS) });
const swapSchema = z.object({ targetImage: media, faceImage: media });
const characterSchema = z.object({ video: z.string().max(Math.ceil(CHARACTER_SWAP_MAX_BYTES * 1.37) + 100).regex(/^data:video\/(mp4|quicktime);base64,/, 'invalid_video'), characterImage: media });
const imageSchema = z.object({ prompt: z.string().trim().min(3).max(1000), aspectRatio: z.enum(['1:1', '16:9', '9:16']), style: z.enum(['photo', 'studio', 'avatar']), count: z.number().int().min(1).max(IMAGE_MAX_COUNT) });

export const startTalkingPhotoTask = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => talkingSchema.parse(d))
  .handler(async ({ data, context }) => (await core()).run('talking_photo', context.userId, data.seconds, (a) => a.submitTalkingPhoto?.(data)));

export const startImageGenerationTask = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => imageSchema.parse(d))
  .handler(async ({ data, context }) => (await core()).run('image_generation', context.userId, data.count, (a) => a.submitImage?.(data)));

export const startFaceSwapTask = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => swapSchema.parse(d))
  .handler(async ({ data, context }) => (await core()).run('face_swap', context.userId, 1, (a) => a.submitFaceSwap?.(data)));

export const startCharacterSwapTask = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => characterSchema.parse(d))
  .handler(async ({ data, context }): Promise<CharacterSwapResult> => {
    const raw = Uint8Array.from(atob(data.video.slice(data.video.indexOf(',') + 1)), (c) => c.charCodeAt(0));
    return (await core()).startCharacterSwap(context.userId, raw, data.characterImage);
  });

export const getAiTaskStatus = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ kind: z.enum(['talking_photo', 'image_generation', 'face_swap', 'character_swap']), providerJobId: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data, context }) => (await core()).taskStatus(context.userId, data.kind, data.providerJobId));
