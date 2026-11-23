import { createFileRoute } from '@tanstack/react-router';

// Public, read-only: tells the Windows app which GPU gateway to use.
// Returns no user data. The address can be changed server-side (WEECHAT_CLOUD_URL)
// without republishing the desktop app.
const DEFAULT_GATEWAY = 'https://xq7gbs0setvvxg-8888.proxy.runpod.net';

export const Route = createFileRoute('/api/public/cloud-endpoint')({
  server: {
    handlers: {
      GET: async () => {
        const url = (process.env['WEECHAT_CLOUD_URL'] || DEFAULT_GATEWAY).replace(/\/+$/, '');
        return Response.json({ url }, { headers: { 'Cache-Control': 'no-store' } });
      },
    },
  },
});
