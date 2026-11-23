import { createFileRoute } from '@tanstack/react-router';
import { fulfillWhopPayment, verifyWhopSignature } from '@/lib/weechat/whop.server';

// Whop webhook: signature verified, then the payment is re-read from Whop before crediting.
export const Route = createFileRoute('/api/public/whop-webhook')({
  server: { handlers: { POST: async ({ request }) => {
    const secret = process.env['WHOP_WEBHOOK_SECRET'];
    if (!secret) return new Response('Not configured', { status: 503 });
    const body = await request.text();
    const h = request.headers;
    if (!(await verifyWhopSignature(secret, h.get('webhook-id') ?? '', h.get('webhook-timestamp') ?? '', h.get('webhook-signature') ?? '', body))) return new Response('Invalid signature', { status: 401 });
    let evt: { type?: string; data?: { id?: string } };
    try { evt = JSON.parse(body); } catch { return new Response('Bad request', { status: 400 }); }
    if (evt.type !== 'payment.succeeded' || !evt.data?.id) return new Response('ok');
    try { await fulfillWhopPayment(evt.data.id); } catch { return new Response('Retry', { status: 500 }); }
    return new Response('ok');
  } } },
});
