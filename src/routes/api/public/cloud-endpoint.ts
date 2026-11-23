import { createFileRoute } from '@tanstack/react-router';
import { DEFAULT_POD_ID, podUrl, wakePod } from '@/lib/weechat/runpod.server';

// GET (public, read-only): GPU gateway address for the Windows app, no user data.
// POST (signed-in Weechat users only): wakes the GPU pod on demand before a call.
const gatewayUrl = () => {
  const pod = process.env['RUNPOD_POD_ID'] || DEFAULT_POD_ID;
  return (process.env['WEECHAT_CLOUD_URL'] || podUrl(pod)).replace(/\/+$/, '');
};
const noStore = { 'Cache-Control': 'no-store' };

export const Route = createFileRoute('/api/public/cloud-endpoint')({
  server: {
    handlers: {
      GET: async () => Response.json({ url: gatewayUrl() }, { headers: noStore }),
      POST: async ({ request }) => {
        const token = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
        if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !data.user) return Response.json({ error: 'unauthorized' }, { status: 401 });
        const key = process.env['RUNPOD_API_KEY'];
        const status = key ? await wakePod(key, process.env['RUNPOD_POD_ID'] || DEFAULT_POD_ID) : 'ready';
        return Response.json({ url: gatewayUrl(), status }, { headers: noStore });
      },
    },
  },
});
