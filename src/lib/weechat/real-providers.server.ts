// Real provider adapters (server-only). Keys are read by the caller from process.env and never reach the browser.
// Each adapter fails closed with an explicit error code; nothing falls back to the simulation.
import { isPipelineLanguage } from './translation-pipeline';

export type ProviderErrorCode = 'missing_provider_key' | 'provider_rejected' | 'provider_unreachable' | 'invalid_response' | 'unsupported_language' | 'empty_input' | 'input_too_large';
export class ProviderError extends Error {
  constructor(public code: ProviderErrorCode, public provider: string, public status?: number) { super(`${provider}:${code}`); }
}
type Fetch = typeof fetch;
export const PROVIDER_KEYS = { recognition: 'DEEPGRAM_API_KEY', translation: 'DEEPL_API_KEY', synthesis: 'DEEPGRAM_API_KEY' } as const;
export const MAX_TEXT = 2000;
export const MAX_AUDIO_BYTES = 2_000_000;

function need(key: string | undefined, provider: string): string {
  if (!key) throw new ProviderError('missing_provider_key', provider);
  return key;
}
function lang(v: string, provider: string) {
  if (!isPipelineLanguage(v)) throw new ProviderError('unsupported_language', provider);
  return v;
}
async function ok(p: Promise<Response>, provider: string) {
  let res: Response;
  try { res = await p; } catch { console.error(`${provider}: network error`); throw new ProviderError('provider_unreachable', provider); }
  if (!res.ok) { console.error(`${provider} [${res.status}]`); throw new ProviderError('provider_rejected', provider, res.status); }
  return res;
}
async function body<T>(res: Response, provider: string): Promise<T> {
  try { return (await res.json()) as T; } catch { throw new ProviderError('invalid_response', provider); }
}

/** Deepgram pre-recorded transcription of one short utterance. */
export async function deepgramTranscribe(audio: Uint8Array, mime: string, language: string, key: string | undefined, f: Fetch = fetch) {
  const k = need(key, 'deepgram'); const l = lang(language, 'deepgram');
  if (!audio.byteLength) throw new ProviderError('empty_input', 'deepgram');
  if (audio.byteLength > MAX_AUDIO_BYTES) throw new ProviderError('input_too_large', 'deepgram');
  const res = await ok(f(`https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&language=${l}`, {
    method: 'POST', headers: { Authorization: `Token ${k}`, 'Content-Type': mime }, body: new Blob([audio.slice()]),
  }), 'deepgram');
  const j = await body<{ results?: { channels?: { alternatives?: { transcript?: string }[] }[] } }>(res, 'deepgram');
  const t = j?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
  if (typeof t !== 'string') throw new ProviderError('invalid_response', 'deepgram');
  return t;
}

const DEEPL_TARGET: Record<string, string> = { fr: 'FR', en: 'EN-US', es: 'ES', de: 'DE', pt: 'PT-PT' };
/** DeepL text translation; Free keys end with ":fx" and use the api-free host. */
export async function deeplTranslate(text: string, source: string, target: string, key: string | undefined, f: Fetch = fetch) {
  const k = need(key, 'deepl'); lang(source, 'deepl'); lang(target, 'deepl');
  if (!text.trim()) throw new ProviderError('empty_input', 'deepl');
  if (text.length > MAX_TEXT) throw new ProviderError('input_too_large', 'deepl');
  // Budget 0 EUR: only DeepL API Free keys (":fx") are accepted; a Pro key would bill usage.
  if (!k.endsWith(':fx')) throw new ProviderError('missing_provider_key', 'deepl');
  const host = 'https://api-free.deepl.com';
  const res = await ok(f(`${host}/v2/translate`, {
    method: 'POST', headers: { Authorization: `DeepL-Auth-Key ${k}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: [text], source_lang: source.toUpperCase(), target_lang: DEEPL_TARGET[target] }),
  }), 'deepl');
  const j = await body<{ translations?: { text?: string }[] }>(res, 'deepl');
  const t = j?.translations?.[0]?.text;
  if (typeof t !== 'string' || !t.trim()) throw new ProviderError('invalid_response', 'deepl');
  return t;
}

/** Deepgram Aura-2 voices (official catalogue, checked 2026-10-22). Portuguese has no Aura-2 voice: fail explicitly. */
export const AURA_VOICES: Record<string, string | null> = {
  en: 'aura-2-thalia-en', fr: 'aura-2-agathe-fr', es: 'aura-2-celeste-es', de: 'aura-2-julius-de', pt: null,
};
/** Deepgram Aura-2 TTS; returns MP3 bytes. */
export async function deepgramSynthesize(text: string, language: string, key: string | undefined, f: Fetch = fetch) {
  const l = lang(language, 'deepgram-aura');
  const voice = AURA_VOICES[l];
  if (!voice) throw new ProviderError('unsupported_language', 'deepgram-aura');
  if (!text.trim()) throw new ProviderError('empty_input', 'deepgram-aura');
  if (text.length > MAX_TEXT) throw new ProviderError('input_too_large', 'deepgram-aura');
  const k = need(key, 'deepgram-aura');
  const res = await ok(f(`https://api.deepgram.com/v1/speak?model=${voice}&encoding=mp3`, {
    method: 'POST', headers: { Authorization: `Token ${k}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
  }), 'deepgram-aura');
  const audio = new Uint8Array(await res.arrayBuffer());
  if (!audio.byteLength) throw new ProviderError('invalid_response', 'deepgram-aura');
  return audio;
}

/** One real relay turn: speech (source) -> text -> translated text -> speech (target). No simulated fallback. */
export async function relayTurn(audio: Uint8Array, mime: string, source: string, target: string, keys: { deepgram?: string | undefined; deepl?: string | undefined }, f: Fetch = fetch) {
  need(keys.deepgram, 'deepgram'); need(keys.deepl, 'deepl');
  const transcript = await deepgramTranscribe(audio, mime, source, keys.deepgram, f);
  if (!transcript.trim()) throw new ProviderError('empty_input', 'deepgram');
  const translation = await deeplTranslate(transcript, source, target, keys.deepl, f);
  const speech = await deepgramSynthesize(translation, target, keys.deepgram, f);
  return { transcript, translation, speech };
}
