// Provider-neutral async AI adapters (server-only). Replicate is wired when REPLICATE_API_TOKEN is set; otherwise fail closed.
import type { AiTaskKind } from './ai-pricing';

export type TalkingPhotoInput = { imageUrl: string; script: string; voiceId?: string | undefined; seconds: number };
export type ImageGenInput = { prompt: string; aspectRatio: '1:1' | '16:9' | '9:16'; style: 'photo' | 'studio' | 'avatar'; count: number };
export type FaceSwapInput = { targetImage: string; faceImage: string };
export type ProviderJob = { providerJobId: string };
export type ProviderStatus = { state: 'pending' | 'processing' | 'completed' | 'failed'; resultUrls?: string[] };

export interface AsyncAiAdapter {
  name: string;
  submitTalkingPhoto?(input: TalkingPhotoInput): Promise<ProviderJob>;
  submitImage?(input: ImageGenInput): Promise<ProviderJob>;
  submitFaceSwap?(input: FaceSwapInput): Promise<ProviderJob>;
  status(providerJobId: string): Promise<ProviderStatus>;
}

export class AdapterUnavailable extends Error { constructor(public kind: AiTaskKind) { super('provider_not_configured'); } }
export class ProviderBilling extends Error { constructor() { super('provider_billing'); } }

const API = 'https://api.replicate.com/v1';
const FACE_SWAP_VERSION = 'd1d6ea8c8be89d664a07a457526f7128109dee7030fdac424788d762c71ed111'; // cdingram/face-swap
const STYLE_PROMPT = { photo: 'photorealistic photograph, natural light', studio: 'professional studio portrait, soft lighting', avatar: 'high quality digital avatar portrait' } as const;

type Prediction = { id: string; status: string; output?: unknown; error?: unknown };

function replicateAdapter(token: string): AsyncAiAdapter {
  const call = async (path: string, body?: unknown, wait = false): Promise<Prediction> => {
    const res = await fetch(`${API}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(wait ? { Prefer: 'wait=60' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (res.status === 402) throw new ProviderBilling();
    if (!res.ok) throw new Error(`Replicate [${res.status}]: ${(await res.text()).slice(0, 300)}`);
    return res.json() as Promise<Prediction>;
  };
  const urls = (o: unknown): string[] => (Array.isArray(o) ? o : [o]).filter((u): u is string => typeof u === 'string');
  return {
    name: 'replicate',
    async submitImage(i) {
      const p = await call('/models/black-forest-labs/flux-schnell/predictions', { input: { prompt: `${i.prompt}, ${STYLE_PROMPT[i.style]}`, aspect_ratio: i.aspectRatio, num_outputs: i.count, output_format: 'webp' } });
      return { providerJobId: p.id };
    },
    async submitFaceSwap(i) {
      const p = await call('/predictions', { version: FACE_SWAP_VERSION, input: { input_image: i.targetImage, swap_image: i.faceImage } });
      return { providerJobId: p.id };
    },
    async submitTalkingPhoto(i) {
      const tts = await call('/models/minimax/speech-02-turbo/predictions', { input: { text: i.script, ...(i.voiceId ? { voice_id: i.voiceId } : {}) } }, true);
      const audio = tts.status === 'succeeded' ? urls(tts.output)[0] : undefined;
      if (!audio) throw new Error(`tts not ready: ${tts.status}`);
      const p = await call('/models/bytedance/omni-human/predictions', { input: { image: i.imageUrl, audio } });
      return { providerJobId: p.id };
    },
    async status(id) {
      const p = await call(`/predictions/${encodeURIComponent(id)}`);
      if (p.status === 'succeeded') return { state: 'completed', resultUrls: urls(p.output) };
      if (p.status === 'failed' || p.status === 'canceled') return { state: 'failed' };
      return { state: p.status === 'processing' ? 'processing' : 'pending' };
    },
  };
}

/** Returns a configured adapter or throws AdapterUnavailable. Reads env inside the call. */
export function getAdapter(kind: AiTaskKind): AsyncAiAdapter {
  const token = process.env['REPLICATE_API_TOKEN'];
  if (token) return replicateAdapter(token);
  throw new AdapterUnavailable(kind);
}
