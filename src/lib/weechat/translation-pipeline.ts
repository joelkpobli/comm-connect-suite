// Modular bidirectional voice-translation orchestrator. It runs only with explicitly injected adapters;
// no adapter is bundled, so the product cannot claim live translation until a real provider is wired and tested.
import type { SpeechRecognizer, SpeechSynthesizer, TextTranslator } from './communication-contracts';

export const PIPELINE_LANGUAGES = ['fr', 'en', 'es', 'de', 'pt'] as const;
export type PipelineLanguage = (typeof PIPELINE_LANGUAGES)[number];
export type PipelineState = 'idle' | 'recognizing' | 'translating' | 'synthesizing' | 'done' | 'error' | 'cancelled';
export type PipelineSource = 'simulated' | 'provider';

export interface PipelineAdapters { recognizer: SpeechRecognizer; translator: TextTranslator; synthesizer: SpeechSynthesizer; source: PipelineSource }
export interface PipelineResult {
  source: PipelineSource;
  original: string;
  translated: string;
  audio: MediaStream;
  latencyMs: { recognition: number; translation: number; synthesis: number; total: number };
}

export function isPipelineLanguage(v: string): v is PipelineLanguage {
  return (PIPELINE_LANGUAGES as readonly string[]).includes(v);
}

export async function runTranslationTurn(
  adapters: PipelineAdapters,
  input: { audio: MediaStream; from: string; to: string; signal: AbortSignal; onState?: (s: PipelineState) => void; now?: () => number },
): Promise<PipelineResult> {
  const { audio, from, to, signal, onState = () => {}, now = () => performance.now() } = input;
  if (!isPipelineLanguage(from) || !isPipelineLanguage(to)) throw new Error('unsupported_language');
  if (from === to) throw new Error('same_language');
  const guard = () => { if (signal.aborted) { onState('cancelled'); throw new Error('cancelled'); } };
  try {
    guard();
    const t0 = now(); onState('recognizing');
    const rec = await adapters.recognizer.recognize(audio, from, signal); guard();
    const t1 = now(); onState('translating');
    const translated = rec.text.trim() ? await adapters.translator.translate(rec.text, from, to, signal) : '';
    guard();
    const t2 = now(); onState('synthesizing');
    const out = await adapters.synthesizer.synthesize(translated, to, signal); guard();
    const t3 = now(); onState('done');
    return { source: adapters.source, original: rec.text, translated, audio: out, latencyMs: { recognition: t1 - t0, translation: t2 - t1, synthesis: t3 - t2, total: t3 - t0 } };
  } catch (e) {
    if (!signal.aborted) onState('error');
    throw e;
  }
}

/** Return path: the caller's direction is simply reversed for the remote speaker. */
export function reverseDirection(d: { from: PipelineLanguage; to: PipelineLanguage }) {
  return { from: d.to, to: d.from };
}
