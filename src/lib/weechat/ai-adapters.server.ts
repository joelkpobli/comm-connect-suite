// Provider-neutral async AI adapters (server-only). No provider is wired yet: every adapter fails closed.
// To connect one, implement AsyncAiAdapter and return it from getAdapter() when its key is set.
import type { AiTaskKind } from './ai-pricing';

export type TalkingPhotoInput = { imageUrl: string; script: string; voiceId?: string; seconds: number };
export type ImageGenInput = { prompt: string; aspectRatio: '1:1' | '16:9' | '9:16'; style: 'photo' | 'studio' | 'avatar'; count: number };
export type ProviderJob = { providerJobId: string };
export type ProviderStatus = { state: 'pending' | 'processing' | 'completed' | 'failed'; resultUrls?: string[] };

export interface AsyncAiAdapter {
  name: string;
  submitTalkingPhoto?(input: TalkingPhotoInput): Promise<ProviderJob>;
  submitImage?(input: ImageGenInput): Promise<ProviderJob>;
  status(providerJobId: string): Promise<ProviderStatus>;
}

export class AdapterUnavailable extends Error { constructor(public kind: AiTaskKind) { super('provider_not_configured'); } }

/** Returns a configured adapter or throws AdapterUnavailable. Reads env inside the call. */
export function getAdapter(kind: AiTaskKind): AsyncAiAdapter {
  // Example future wiring: if (process.env['FAL_KEY']) return falAdapter(process.env['FAL_KEY']);
  throw new AdapterUnavailable(kind);
}
