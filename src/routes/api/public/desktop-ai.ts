import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { CHARACTER_SWAP_MAX_BYTES } from '@/lib/weechat/ai-pricing';

// Windows app access to the full character transformation. The caller proves its identity
// with its own Supabase access token; duration and price are computed server-side only.
const Start = z.object({
  action: z.literal('start'),
  video: z.string().max(Math.ceil(CHARACTER_SWAP_MAX_BYTES * 1.37) + 100),
  characterImage: z.string().max(8_000_000).regex(/^data:image\/(png|jpeg|webp);base64,/),
});
const Status = z.object({ action: z.literal('status'), ticket: z.string().min(1).max(200) });
const Body = z.discriminatedUnion('action', [Start, Status]);

const json = (d: unknown, status = 200) => Response.json(d, { status });

export const Route = createFileRoute('/api/public/desktop-ai')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
        if (!token) return json({ ok: false, error: 'unauthorized' }, 401);
        let input: z.infer<typeof Body>;
        try { input = Body.parse(await request.json()); } catch { return json({ ok: false, error: 'bad_request' }, 400); }
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { data: u, error: ue } = await supabaseAdmin.auth.getUser(token);
        if (ue || !u.user) return json({ ok: false, error: 'unauthorized' }, 401);
        const core = await import('@/lib/weechat/ai-tasks.server');
        if (input.action === 'status') return json(await core.taskStatus(u.user.id, 'character_swap', input.ticket));
        let raw: Uint8Array;
        try { raw = Uint8Array.from(atob(input.video), (c) => c.charCodeAt(0)); } catch { return json({ ok: false, error: 'video_unreadable' }, 400); }
        const r = await core.startCharacterSwap(u.user.id, raw, input.characterImage);
        return json(r, r.ok ? 200 : r.error === 'insufficient' ? 402 : 400);
      },
    },
  },
});
