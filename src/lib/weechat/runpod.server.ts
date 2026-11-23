// RunPod on-demand control (server only): the GPU pod runs only while calls need it.
// The idle guard on the pod stops it after calls end; this wakes it when a call starts.
export const DEFAULT_POD_ID = 'xq7gbs0setvvxg';
export const podUrl = (podId: string, port = 8888) => `https://${podId}-${port}.proxy.runpod.net`;

type PodState = { desiredStatus?: string; runtime?: { uptimeInSeconds?: number } | null } | null;

async function gql(key: string, query: string) {
  const r = await fetch('https://api.runpod.io/graphql', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify({ query }),
  });
  return (await r.json().catch(() => null)) as { data?: Record<string, unknown>; errors?: { message: string }[] } | null;
}

/** Decides what to do from the pod state: already running, booting, or must be resumed. */
export function podAction(p: PodState): 'ready' | 'starting' | 'resume' {
  if (p?.desiredStatus === 'RUNNING') return p.runtime ? 'ready' : 'starting';
  return 'resume';
}

export async function wakePod(key: string, podId: string): Promise<'ready' | 'starting' | 'error'> {
  if (!/^[a-z0-9]{6,40}$/.test(podId)) return 'error';
  const s = await gql(key, `query { pod(input: { podId: "${podId}" }) { desiredStatus runtime { uptimeInSeconds } } }`);
  const action = podAction((s?.data?.['pod'] ?? null) as PodState);
  if (action !== 'resume') return action;
  const r = await gql(key, `mutation { podResume(input: { podId: "${podId}", gpuCount: 1 }) { id desiredStatus } }`);
  if (r?.errors?.length) { console.error('podResume', r.errors[0]?.message); return 'error'; }
  return 'starting';
}
