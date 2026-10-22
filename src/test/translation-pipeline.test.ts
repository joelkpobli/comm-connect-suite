import { describe, expect, it } from 'vitest';
import { runTranslationTurn, reverseDirection, PIPELINE_LANGUAGES, type PipelineAdapters } from '@/lib/weechat/translation-pipeline';
import { PROVIDER_AUDIT } from '@/lib/weechat/provider-audit';

const stream = {} as MediaStream;
const fake = (over: Partial<PipelineAdapters> = {}): PipelineAdapters => ({
  source: 'simulated',
  recognizer: { recognize: async () => ({ text: 'bonjour', language: 'fr' }) },
  translator: { translate: async (t, _s, to) => `${to}:${t}` },
  synthesizer: { synthesize: async () => stream },
  ...over,
});
let clock = 0; const now = () => (clock += 10);

describe('translation pipeline', () => {
  it('supports exactly the five planned languages', () => expect([...PIPELINE_LANGUAGES]).toEqual(['fr', 'en', 'es', 'de', 'pt']));
  it('runs fr -> en with ordered states and measured latency, flagged simulated', async () => {
    const states: string[] = [];
    const r = await runTranslationTurn(fake(), { audio: stream, from: 'fr', to: 'en', signal: new AbortController().signal, onState: (s) => states.push(s), now });
    expect(r.translated).toBe('en:bonjour');
    expect(r.source).toBe('simulated');
    expect(states).toEqual(['recognizing', 'translating', 'synthesizing', 'done']);
    expect(r.latencyMs.total).toBe(30);
  });
  it('rejects unsupported and identical languages', async () => {
    const s = new AbortController().signal;
    await expect(runTranslationTurn(fake(), { audio: stream, from: 'fr', to: 'ja', signal: s })).rejects.toThrow('unsupported_language');
    await expect(runTranslationTurn(fake(), { audio: stream, from: 'fr', to: 'fr', signal: s })).rejects.toThrow('same_language');
  });
  it('stops on cancellation without synthesizing', async () => {
    const c = new AbortController(); let synth = false;
    const a = fake({ translator: { translate: async () => { c.abort(); return 'x'; } }, synthesizer: { synthesize: async () => { synth = true; return stream; } } });
    const states: string[] = [];
    await expect(runTranslationTurn(a, { audio: stream, from: 'fr', to: 'es', signal: c.signal, onState: (s) => states.push(s) })).rejects.toThrow('cancelled');
    expect(synth).toBe(false); expect(states.at(-1)).toBe('cancelled');
  });
  it('reports adapter errors', async () => {
    const states: string[] = [];
    await expect(runTranslationTurn(fake({ recognizer: { recognize: async () => { throw new Error('stt_down'); } } }), { audio: stream, from: 'de', to: 'pt', signal: new AbortController().signal, onState: (s) => states.push(s) })).rejects.toThrow('stt_down');
    expect(states.at(-1)).toBe('error');
  });
  it('reverses direction for the return path', () => expect(reverseDirection({ from: 'fr', to: 'en' })).toEqual({ from: 'en', to: 'fr' }));
  it('marks no provider as integrated', () => expect(PROVIDER_AUDIT.every((p) => p.integrated === false && p.blockers.length > 0)).toBe(true));
});
