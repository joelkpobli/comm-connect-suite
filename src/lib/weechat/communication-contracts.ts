// Integration seams only. No adapter is instantiated and no media can leave the tab.
export type CommunicationStage = 'recognition' | 'translation' | 'synthesis' | 'avatar-animation';
export type IntegrationBlocker = 'adapter_missing' | 'license_unverified' | 'zero_budget_unverified' | 'consent_not_verified';
export interface SpeechRecognizer {
  recognize(audio: MediaStream, language: string, signal: AbortSignal): Promise<{ text: string; language: string }>;
}
export interface TextTranslator {
  translate(text: string, source: string, target: string, signal: AbortSignal): Promise<string>;
}
export interface SpeechSynthesizer {
  synthesize(text: string, language: string, signal: AbortSignal): Promise<MediaStream>;
}
export interface AvatarAnimator {
  animate(audio: MediaStream, authorizedImage: ImageBitmap, signal: AbortSignal): Promise<MediaStream>;
}
export function communicationAvailability(stage: CommunicationStage): { stage: CommunicationStage; available: false; blockers: IntegrationBlocker[] } {
  return { stage, available: false, blockers: ['adapter_missing', 'license_unverified', 'zero_budget_unverified', 'consent_not_verified'] };
}
export function startCommunicationStage(stage: CommunicationStage): never {
  throw new Error(`${stage}: integration unavailable; no media transmitted`);
}