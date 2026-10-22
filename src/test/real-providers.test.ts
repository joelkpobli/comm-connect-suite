import { describe, expect, it, vi } from 'vitest';
import { deepgramTranscribe, deeplTranslate, deepgramSynthesize, relayTurn, ProviderError } from '@/lib/weechat/real-providers.server';

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
const code = async (p: Promise<unknown>) => { try { await p; return 'none'; } catch (e) { return (e as ProviderError).code; } };

describe('real provider adapters (no network)', () => {
  it('fail closed without keys and never call the provider', async () => {
    const f = vi.fn();
    expect(await code(deeplTranslate('bonjour', 'fr', 'en', undefined, f))).toBe('missing_provider_key');
    expect(await code(deepgramTranscribe(new Uint8Array([1]), 'audio/webm', 'fr', '', f))).toBe('missing_provider_key');
    expect(await code(deepgramSynthesize('hi', 'en', undefined, f))).toBe('missing_provider_key');
    expect(f).not.toHaveBeenCalled();
  });
  it('DeepL Free key uses the free host and fr -> EN-US', async () => {
    const f = vi.fn().mockResolvedValue(json({ translations: [{ text: 'hello' }] }));
    expect(await deeplTranslate('bonjour', 'fr', 'en', 'k:fx', f)).toBe('hello');
    expect(f.mock.calls[0]![0]).toBe('https://api-free.deepl.com/v2/translate');
    expect(JSON.parse(f.mock.calls[0]![1].body)).toEqual({ text: ['bonjour'], source_lang: 'FR', target_lang: 'EN-US' });
  });
  it('return path en -> fr', async () => {
    const f = vi.fn().mockResolvedValue(json({ translations: [{ text: 'bonjour' }] }));
    await deeplTranslate('hello', 'en', 'fr', 'k:fx', f);
    expect(JSON.parse(f.mock.calls[0]![1].body).target_lang).toBe('FR');
  });
  it('rejects unsupported language, empty and oversized input', async () => {
    const f = vi.fn();
    expect(await code(deeplTranslate('x', 'fr', 'ja', 'k', f))).toBe('unsupported_language');
    expect(await code(deeplTranslate('  ', 'fr', 'en', 'k', f))).toBe('empty_input');
    expect(await code(deepgramSynthesize('a'.repeat(2001), 'en', 'k', f))).toBe('input_too_large');
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
    expect(f.mock.calls[0]![0]).toContain('language=fr');
  });
  it('Aura-2 TTS uses official voice per language and refuses Portuguese', async () => {
    const f = vi.fn().mockResolvedValue(new Response(new Uint8Array([7, 8])));
    expect(Array.from(await deepgramSynthesize('hello', 'en', 'k', f))).toEqual([7, 8]);
    expect(f.mock.calls[0]![0]).toContain('model=aura-2-thalia-en');
    await deepgramSynthesize('bonjour', 'fr', 'k', f);
    expect(f.mock.calls[1]![0]).toContain('model=aura-2-agathe-fr');
    expect(await code(deepgramSynthesize('olá', 'pt', 'k', f))).toBe('unsupported_language');
  });
  it('relay fr -> en chains STT, DeepL and Aura (simulated responses, test only)', async () => {
    const f = vi.fn()
      .mockResolvedValueOnce(json({ results: { channels: [{ alternatives: [{ transcript: 'bonjour' }] }] } }))
      .mockResolvedValueOnce(json({ translations: [{ text: 'hello' }] }))
      .mockResolvedValueOnce(new Response(new Uint8Array([1])));
    const r = await relayTurn(new Uint8Array([1]), 'audio/webm', 'fr', 'en', { deepgram: 'k', deepl: 'k:fx' }, f);
    expect(r).toMatchObject({ transcript: 'bonjour', translation: 'hello' });
    expect(f.mock.calls[2]![0]).toContain('aura-2-thalia-en');
  });
  it('relay en -> fr return path speaks French', async () => {
    const f = vi.fn()
      .mockResolvedValueOnce(json({ results: { channels: [{ alternatives: [{ transcript: 'hello' }] }] } }))
      .mockResolvedValueOnce(json({ translations: [{ text: 'bonjour' }] }))
      .mockResolvedValueOnce(new Response(new Uint8Array([1])));
    await relayTurn(new Uint8Array([1]), 'audio/webm', 'en', 'fr', { deepgram: 'k', deepl: 'k:fx' }, f);
    expect(f.mock.calls[0]![0]).toContain('language=en');
    expect(f.mock.calls[2]![0]).toContain('aura-2-agathe-fr');
  });
  it('relay without Deepgram key fails explicitly before any call', async () => {
    const f = vi.fn();
    expect(await code(relayTurn(new Uint8Array([1]), 'audio/webm', 'fr', 'en', { deepl: 'k' }, f))).toBe('missing_provider_key');
    expect(f).not.toHaveBeenCalled();
  });
});
