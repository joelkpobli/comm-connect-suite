// Provider audit registry. Statuses reflect what was verified in this project, not vendor claims.
// No provider is integrated: every entry is blocked until credentials, licence and budget are approved.
export type ProviderCategory = 'avatar' | 'recognition' | 'translation' | 'synthesis' | 'transport' | 'windows-device';
export type ProviderBlocker = 'api_key_required' | 'paid_usage' | 'gpu_required' | 'licence_review' | 'native_driver' | 'code_signing' | 'not_tested';
export interface ProviderAudit {
  id: string;
  name: string;
  category: ProviderCategory;
  streaming: 'yes' | 'partial' | 'unverified';
  selfHostable: boolean;
  blockers: ProviderBlocker[];
  integrated: false;
  note: string;
}

export const PROVIDER_AUDIT: readonly ProviderAudit[] = [
  { id: 'simli', name: 'Simli', category: 'avatar', streaming: 'yes', selfHostable: false, blockers: ['api_key_required', 'paid_usage', 'not_tested'], integrated: false, note: 'WebRTC avatar API; trial terms to be confirmed by owner.' },
  { id: 'liveportrait', name: 'LivePortrait', category: 'avatar', streaming: 'partial', selfHostable: true, blockers: ['gpu_required', 'licence_review', 'not_tested'], integrated: false, note: 'Open code; bundled model weights have separate licences (InsightFace non-commercial).' },
  { id: 'musetalk', name: 'MuseTalk', category: 'avatar', streaming: 'partial', selfHostable: true, blockers: ['gpu_required', 'licence_review', 'not_tested'], integrated: false, note: 'Lip-sync model; needs GPU server; dependency licences to review.' },
  { id: 'heygen', name: 'HeyGen LiveAvatar', category: 'avatar', streaming: 'yes', selfHostable: false, blockers: ['api_key_required', 'paid_usage', 'not_tested'], integrated: false, note: 'Hosted streaming avatar; credit-based billing.' },
  { id: 'tavus', name: 'Tavus CVI', category: 'avatar', streaming: 'yes', selfHostable: false, blockers: ['api_key_required', 'paid_usage', 'not_tested'], integrated: false, note: 'Conversational video interface; full agent, broader than needed.' },
  { id: 'deepgram', name: 'Deepgram', category: 'recognition', streaming: 'yes', selfHostable: false, blockers: ['api_key_required', 'paid_usage', 'not_tested'], integrated: false, note: 'Streaming WebSocket STT; key must stay server-side.' },
  { id: 'whisper', name: 'Whisper (local)', category: 'recognition', streaming: 'partial', selfHostable: true, blockers: ['gpu_required', 'not_tested'], integrated: false, note: 'MIT licence; real-time needs chunking and adequate hardware.' },
  { id: 'deepl', name: 'DeepL', category: 'translation', streaming: 'unverified', selfHostable: false, blockers: ['api_key_required', 'not_tested'], integrated: false, note: 'Text API with free tier quota; no audio streaming.' },
  { id: 'elevenlabs', name: 'ElevenLabs', category: 'synthesis', streaming: 'yes', selfHostable: false, blockers: ['api_key_required', 'paid_usage', 'not_tested'], integrated: false, note: 'Replaced by Deepgram Aura-2 (single provider for STT+TTS); kept for reference only.' },
  { id: 'cartesia', name: 'Cartesia', category: 'synthesis', streaming: 'yes', selfHostable: false, blockers: ['api_key_required', 'paid_usage', 'not_tested'], integrated: false, note: 'Low-latency streaming TTS.' },
  { id: 'webrtc', name: 'WebRTC', category: 'transport', streaming: 'yes', selfHostable: true, blockers: ['not_tested'], integrated: false, note: 'Browser native; signalling and TURN server still required.' },
  { id: 'win-vcam', name: 'Windows virtual camera (MFCreateVirtualCamera)', category: 'windows-device', streaming: 'yes', selfHostable: true, blockers: ['native_driver', 'code_signing', 'not_tested'], integrated: false, note: 'Windows 11 API; native companion app required, cannot run from a browser.' },
  { id: 'win-vaudio', name: 'Windows virtual audio device', category: 'windows-device', streaming: 'yes', selfHostable: true, blockers: ['native_driver', 'code_signing', 'not_tested'], integrated: false, note: 'Needs a signed kernel/APO driver or licensed third-party driver.' },
];

export function providersFor(category: ProviderCategory) {
  return PROVIDER_AUDIT.filter((p) => p.category === category);
}
