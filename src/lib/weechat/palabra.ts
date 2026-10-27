// Palabra speech-to-speech streaming (docs.palabra.ai, checked 2026-10-27). Browser-safe helpers only:
// the API key stays on the server; the browser receives a short-lived session "publisher" token.

/** Languages offered in Weechat (subset of the Palabra catalogue usable as source and target). */
export const PALABRA_LANGUAGES = {
  fr: 'Français', en: 'English', es: 'Español', de: 'Deutsch', pt: 'Português', it: 'Italiano', nl: 'Nederlands',
  ar: 'العربية', zh: '中文', ja: '日本語', ko: '한국어', ru: 'Русский', tr: 'Türkçe', pl: 'Polski', uk: 'Українська',
  hi: 'हिन्दी', id: 'Bahasa Indonesia', sv: 'Svenska', da: 'Dansk', fi: 'Suomi', cs: 'Čeština', sk: 'Slovenčina',
  ro: 'Română', bg: 'Български', el: 'Ελληνικά', he: 'עברית', hu: 'Magyar', vi: 'Tiếng Việt', ms: 'Bahasa Melayu',
  hr: 'Hrvatski', no: 'Norsk', fil: 'Filipino', ta: 'தமிழ்', cy: 'Cymraeg', ca: 'Català', et: 'Eesti', lv: 'Latviešu', lt: 'Lietuvių',
  sl: 'Slovenščina', sr: 'Српски', mk: 'Македонски', be: 'Беларуская', hy: 'Հայերեն', kk: 'Қазақ', gl: 'Galego', sw: 'Kiswahili',
  th: 'ไทย', ur: 'اردو',
} as const;
export type PalabraLang = keyof typeof PALABRA_LANGUAGES;
export const PALABRA_CODES = Object.keys(PALABRA_LANGUAGES) as PalabraLang[];
export const isPalabraLang = (v: string): v is PalabraLang => v in PALABRA_LANGUAGES;

export const PALABRA_SAMPLE_RATE = 24000; // output is always 24 kHz mono PCM s16le

/** Builds the set_task message for WebSocket audio I/O. Throws on identical or unknown languages. */
export function buildSetTask(source: string, target: string, opts: { voiceCloning?: boolean } = {}) {
  if (!isPalabraLang(source) || !isPalabraLang(target)) throw new Error('unsupported_language');
  if (source === target) throw new Error('same_language');
  return {
    message_type: 'set_task',
    data: {
      input_stream: { content_type: 'audio', source: { type: 'ws', format: 'pcm_s16le', sample_rate: PALABRA_SAMPLE_RATE, channels: 1 } },
      output_stream: { content_type: 'audio', target: { type: 'ws', format: 'pcm_s16le' } },
      pipeline: {
        transcription: { source_language: source },
        translations: [{ target_language: target, speech_generation: { voice_cloning: opts.voiceCloning === true } }],
        allowed_message_types: ['partial_transcription', 'validated_transcription', 'translated_transcription', 'partial_translated_transcription'],
      },
    },
  };
}

/** Float32 [-1,1] samples -> base64 PCM s16le. */
export function floatToPcmBase64(f: Float32Array) {
  const buf = new Uint8Array(f.length * 2); const v = new DataView(buf.buffer);
  for (let i = 0; i < f.length; i++) { const s = Math.max(-1, Math.min(1, f[i]!)); v.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
  let bin = ''; for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]!);
  return btoa(bin);
}

/** base64 PCM s16le -> Float32 samples. */
export function pcmBase64ToFloat(b64: string) {
  const bin = atob(b64); const n = Math.floor(bin.length / 2); const out = new Float32Array(n);
  for (let i = 0; i < n; i++) { let x = bin.charCodeAt(i * 2) | (bin.charCodeAt(i * 2 + 1) << 8); if (x >= 0x8000) x -= 0x10000; out[i] = x / 0x8000; }
  return out;
}

export type PalabraEvent =
  | { kind: 'started' } | { kind: 'audio'; b64: string } | { kind: 'error'; detail: string } | { kind: 'end' }
  | { kind: 'text'; stage: 'partial' | 'final' | 'partial_translation' | 'translation'; text: string; id: string };

/** Parses one server message into a typed event (null when irrelevant). */
export function parsePalabraMessage(raw: string): PalabraEvent | null {
  let m: { message_type?: string; data?: unknown };
  try { m = JSON.parse(raw); } catch { return null; }
  const d = (typeof m.data === 'string' ? safe(m.data) : m.data) as { data?: unknown; task_status?: string; desc?: string; message?: string; transcription?: { text?: unknown; transcription_id?: unknown } } | undefined;
  switch (m.message_type) {
    case 'output_audio_data': return typeof d?.data === 'string' ? { kind: 'audio', b64: d.data } : null;
    case 'task_status': return d?.task_status === 'running' ? { kind: 'started' } : null;
    case 'end_of_stream': return { kind: 'end' };
    case 'error': return { kind: 'error', detail: String(d?.desc ?? d?.message ?? 'error') };
    default: {
      const stage = ({ partial_transcription: 'partial', validated_transcription: 'final', partial_translated_transcription: 'partial_translation', translated_transcription: 'translation' } as const)[m.message_type as 'partial_transcription'];
      const t = d?.transcription;
      return stage && typeof t?.text === 'string' ? { kind: 'text', stage, text: t.text, id: String(t.transcription_id ?? '') } : null;
    }
  }
}
function safe(s: string) { try { return JSON.parse(s); } catch { return undefined; } }
