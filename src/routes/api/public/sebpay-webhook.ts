import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { fulfillSebpaySession, verifySebpaySignature } from '@/lib/weechat/sebpay.server';

// SebPay webhook: verify X-SebPay-Signature over the raw body, then re-read the
// checkout session from SebPay (source of truth) before crediting anything.
const payload = z.object({ checkout_session_id: z.string().min(4).max(120).optional().nullable(), status: z.string().max(30).optional() }).passthrough();

export const Route = createFileRoute('/api/public/sebpay-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!process.env['SEBPAY_SECRET_KEY']) return new Response('Not configured', { status: 503 });
        const raw = await request.text();
        if (!(await verifySebpaySignature(raw, request.headers.get('x-sebpay-signature')))) return new Response('Invalid signature', { status: 401 });
        let body: z.infer<typeof payload>;
        try { body = payload.parse(JSON.parse(raw)); } catch { return new Response('Bad request', { status: 400 }); }
        // Only hosted-checkout events carry a session; other events need no action here.
        if (!body.checkout_session_id || body.status !== 'approved') return new Response('ok');
        try { await fulfillSebpaySession(body.checkout_session_id); } catch { return new Response('Retry', { status: 500 }); }
        return new Response('ok');
      },
    },
  },
});
