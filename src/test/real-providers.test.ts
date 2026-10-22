import { describe, expect, it, vi } from 'vitest';
import { deepgramTranscribe, deeplTranslate, elevenlabsSynthesize, ProviderError } from '@/lib/weechat/real-providers.server';

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
const code = async (p: Promise<unknown>) => { try { await p; return 'none'; } catch (e) { return (e as ProviderError).code; } };

describe('real provider adapters (no network)', () => {
  it('fail closed without keys and never call the provider', async () => {
    const f = vi.fn();
    expect(await code(deeplTranslate('bonjour', 'fr', 'en', undefined, f))).toBe('missing_provider_key');
    expect(await code(deepgramTranscribe(new Uint8Array([1]), 'audio/webm', 'fr', '', f))).toBe('missing_provider_key');
    expect(await code(elevenlabsSynthesize('hi', 'en', undefined, f))).toBe('missing_provider_key');
    expect(f).not.toHaveBeenCalled();
  });
  it('DeepL Free key uses the free host and fr -> EN-US', async () => {
    const f = vi.fn().mockResolvedValue(json({ translations: [{ text: 'hello' }] }));
    expect(await deeplTranslate('bonjour', 'fr', 'en', 'k:fx', f)).toBe('hello');
    expect(f.mock.calls[0][0]).toBe('https://api-free.deepl.com/v2/translate');
    expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({ text: ['bonjour'], source_lang: 'FR', target_lang: 'EN-US' });
  });
  it('return path en -> fr', async () => {
    const f = vi.fn().mockResolvedValue(json({ translations: [{ text: 'bonjour' }] }));
    await deeplTranslate('hello', 'en', 'fr', 'k:fx', f);
    expect(JSON.parse(f.mock.calls[0][1].body).target_lang).toBe('FR');
  });
  it('rejects unsupported language, empty and oversized input', async () => {
    const f = vi.fn();
    expect(await code(deeplTranslate('x', 'fr', 'ja', 'k', f))).toBe('unsupported_language');
    expect(await code(deeplTranslate('  ', 'fr', 'en', 'k', f))).toBe('empty_input');
    expect(await code(elevenlabsSynthesize('a'.repeat(2001), 'en', 'k', f))).toBe('input_too_large');
    expect(f).not.toHaveBeenCalled();
  });
  it('surfaces provider rejection with status', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = vi.fn().mockResolvedValue(new Response('quota', { status: 456 }));
    await expect(deeplTranslate('a', 'fr', 'en', 'k', f)).rejects.toMatchObject({ code: 'provider_rejected', status: 456 });
  });
  it('parses Deepgram transcript with language parameter', async () => {
    const f = vi.fn().mockResolvedValue(json({ results: { channels: [{ alternatives: [{ transcript: 'bonjour' }] }] } }));
    expect(await deepgramTranscribe(new Uint8Array([1, 2]), 'audio/webm', 'fr', 'k', f)).toBe('bonjour');
    expect(f.mock.calls[0][0]).toContain('language=fr');
  });
});
