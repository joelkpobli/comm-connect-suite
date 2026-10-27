import { describe, expect, it } from 'vitest';
import { PALABRA_CODES, buildSetTask, floatToPcmBase64, parsePalabraMessage, pcmBase64ToFloat } from '@/lib/weechat/palabra';

describe('palabra', () => {
  it('offers more than 25 languages including fr/en/es/de/pt', () => {
    expect(PALABRA_CODES.length).toBeGreaterThan(25);
    for (const l of ['fr', 'en', 'es', 'de', 'pt']) expect(PALABRA_CODES).toContain(l);
  });
  it('refuses identical languages', () => { expect(() => buildSetTask('fr', 'fr')).toThrow('same_language'); });
  it('builds a 24 kHz PCM ws task', () => {
    const t = buildSetTask('fr', 'en', { voiceCloning: true });
    expect(t.data.input_stream.source.sample_rate).toBe(24000);
    expect(t.data.pipeline.translations[0]!.target_language).toBe('en');
    expect(t.data.pipeline.translations[0]!.speech_generation.voice_cloning).toBe(true);
  });
  it('round-trips PCM audio', () => {
    const out = pcmBase64ToFloat(floatToPcmBase64(new Float32Array([0, 0.5, -0.5])));
    expect(out[1]).toBeCloseTo(0.5, 3); expect(out[2]).toBeCloseTo(-0.5, 3);
  });
  it('parses audio, text and running status', () => {
    expect(parsePalabraMessage('{"message_type":"output_audio_data","data":{"data":"AAA="}}')).toEqual({ kind: 'audio', b64: 'AAA=' });
    expect(parsePalabraMessage('{"message_type":"translated_transcription","data":{"transcription":{"text":"Hello","transcription_id":"1"}}}')).toEqual({ kind: 'text', stage: 'translation', text: 'Hello', id: '1' });
    expect(parsePalabraMessage('{"message_type":"task_status","data":{"task_status":"running"}}')).toEqual({ kind: 'started' });
    expect(parsePalabraMessage('nope')).toBeNull();
  });
});
