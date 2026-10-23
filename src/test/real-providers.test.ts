import { describe, expect, it, vi } from 'vitest';
import { deepgramTranscribe, deeplTranslate, deepgramSynthesize, relayTurn, ProviderError, prepareSpeechText } from '@/lib/weechat/real-providers.server';

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
    await expect(deeplTranslate('a', 'fr', 'en', 'k:fx', f)).rejects.toMatchObject({ code: 'provider_rejected', status: 456 });
  });
  it('parses Deepgram transcript with language parameter', async () => {
    const f = vi.fn().mockResolvedValue(json({ results: { channels: [{ alternatives: [{ transcript: 'bonjour' }] }] } }));
    expect(await deepgramTranscribe(new Uint8Array([1, 2]), 'audio/webm', 'fr', 'k', f)).toBe('bonjour');
    expect(f.mock.calls[0]![0]).toContain('language=fr');
  });
  it('Aura-2 TTS uses official voice per language and refuses Portuguese', async () => {
    const f = vi.fn().mockImplementation(async () => new Response(new Uint8Array([7, 8])));
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
  it('network failure is reported as provider_unreachable, never simulated', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    expect(await code(deeplTranslate('bonjour', 'fr', 'en', 'k:fx', f))).toBe('provider_unreachable');
    expect(await code(deepgramTranscribe(new Uint8Array([1]), 'audio/webm', 'fr', 'k', f))).toBe('provider_unreachable');
  });
  it('invalid provider responses are rejected', async () => {
    const bad = vi.fn().mockImplementation(async () => new Response('not json'));
    expect(await code(deeplTranslate('bonjour', 'fr', 'en', 'k:fx', bad))).toBe('invalid_response');
    expect(await code(deepgramTranscribe(new Uint8Array([1]), 'audio/webm', 'fr', 'k', bad))).toBe('invalid_response');
    const empty = vi.fn().mockImplementation(async () => new Response(new Uint8Array([])));
    expect(await code(deepgramSynthesize('hello', 'en', 'k', empty))).toBe('invalid_response');
  });
  it('refuses a paid DeepL Pro key (budget 0 EUR)', async () => {
    const f = vi.fn();
    expect(await code(deeplTranslate('bonjour', 'fr', 'en', 'pro-key', f))).toBe('missing_provider_key');
    expect(f).not.toHaveBeenCalled();
  });
});

describe('voice quality settings (no claim about how natural it sounds)', () => {
  const okAudio = () => vi.fn(async () => new Response(new Uint8Array([1, 2, 3])));
  it('requests WAV linear16 at 24 kHz instead of MP3', async () => {
    const f = okAudio();
    await deepgramSynthesize('Hello', 'en', 'k', f as unknown as typeof fetch);
    const url = String((f.mock.calls[0] as unknown[])[0]);
    expect(url).toContain('encoding=linear16'); expect(url).toContain('container=wav'); expect(url).toContain('sample_rate=24000'); expect(url).not.toContain('mp3');
  });
  it('accepts the documented French voice Hector', async () => {
    const f = okAudio();
    await deepgramSynthesize('Bonjour', 'fr', 'k', f as unknown as typeof fetch, 'aura-2-hector-fr');
    expect(String((f.mock.calls[0] as unknown[])[0])).toContain('model=aura-2-hector-fr');
  });
  it('rejects a voice not in the catalogue or of another language, without calling Deepgram', async () => {
    const f = okAudio();
    await expect(deepgramSynthesize('Bonjour', 'fr', 'k', f as unknown as typeof fetch, 'aura-2-thalia-en')).rejects.toMatchObject({ code: 'unsupported_language' });
    await expect(deepgramSynthesize('Hi', 'en', 'k', f as unknown as typeof fetch, 'aura-2-fake-en')).rejects.toMatchObject({ code: 'unsupported_language' });
    expect(f).not.toHaveBeenCalled();
  });
  it('adds only a final full stop, never changing words', () => {
    expect(prepareSpeechText('Hello  how are you')).toBe('Hello how are you.');
    expect(prepareSpeechText('Ça va ?')).toBe('Ça va ?');
  });
});
