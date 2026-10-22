// Authenticated real-mode endpoints. Simulated adapters stay in tests only; these never simulate.
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { PIPELINE_LANGUAGES } from './translation-pipeline';

const Lang = z.enum(PIPELINE_LANGUAGES);
type Outcome<T> = { ok: true; value: T; ms: number } | { ok: false; error: string; provider: string };

async function run<T>(fn: () => Promise<T>): Promise<Outcome<T>> {
  const { ProviderError } = await import('./real-providers.server');
  const t = Date.now();
  try { return { ok: true, value: await fn(), ms: Date.now() - t }; }
  catch (e) { if (e instanceof ProviderError) return { ok: false, error: e.code, provider: e.provider }; throw e; }
}

export const providerStatus = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async () => ({
  recognition: Boolean(process.env['DEEPGRAM_API_KEY']),
  translation: Boolean(process.env['DEEPL_API_KEY']),
  synthesis: Boolean(process.env['ELEVENLABS_API_KEY']),
  avatar: false as const,
}));

export const realTranscribe = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ audioBase64: z.string().min(1).max(2_800_000), mime: z.string().regex(/^audio\/[\w.+-]+(;.*)?$/), language: Lang }).parse(d))
  .handler(async ({ data }) => {
    const { deepgramTranscribe } = await import('./real-providers.server');
    const bytes = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
    return run(() => deepgramTranscribe(bytes, data.mime, data.language, process.env['DEEPGRAM_API_KEY']));
  });

export const realTranslate = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ text: z.string().min(1).max(2000), source: Lang, target: Lang }).parse(d))
  .handler(async ({ data }) => {
    const { deeplTranslate } = await import('./real-providers.server');
    return run(() => deeplTranslate(data.text, data.source, data.target, process.env['DEEPL_API_KEY']));
  });

export const realSynthesize = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ text: z.string().min(1).max(2000), language: Lang }).parse(d))
  .handler(async ({ data }) => {
    const { elevenlabsSynthesize } = await import('./real-providers.server');
    const r = await run(() => elevenlabsSynthesize(data.text, data.language, process.env['ELEVENLABS_API_KEY']));
    if (!r.ok) return r;
    let s = ''; for (const b of r.value) s += String.fromCharCode(b);
    return { ok: true as const, value: btoa(s), ms: r.ms };
  });
