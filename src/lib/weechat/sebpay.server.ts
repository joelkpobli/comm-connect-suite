// SebPay hosted checkout (server only) for Mobile Money across Africa. The amount comes
// from the server catalogue; fulfillment always re-reads the session from SebPay and
// checks status, owner, item, amount and currency before crediting with sebpay:<session id>.
import { findItem } from './catalog';
import { grantItem } from './fulfillment.server';

function config() {
  const pub = process.env['SEBPAY_PUBLIC_KEY'], secret = process.env['SEBPAY_SECRET_KEY'];
  if (!pub || !secret) throw new Error('SebPay not configured');
  // pk_test_ keys belong to the separate sandbox server.
  const api = pub.startsWith('pk_test_') ? 'https://api.sandbox.sebpay.bj/api/v1' : 'https://newapi.sebpay.bj/api/v1';
  return { api, secret, headers: { 'X-Public-Key': pub, 'X-Secret-Key': secret, 'Content-Type': 'application/json', Accept: 'application/json' } };
}

type Session = {
  id?: string; status?: string; transaction_status?: string; checkout_url?: string;
  amount?: number | string; currency?: string; metadata?: { user_id?: string; item_id?: string } | null;
};
const unwrap = (json: unknown): Session | null => {
  if (!json || typeof json !== 'object') return null;
  const o = json as { data?: unknown };
  return (o.data && typeof o.data === 'object' ? o.data : json) as Session;
};

export async function createSebpayCheckout(itemId: string, userId: string, origin: string) {
  const item = findItem(itemId); if (!item || !(item.amountXOF > 0)) throw new Error('Unknown item');
  const { api, headers } = config();
  const res = await fetch(`${api}/checkout/sessions`, { method: 'POST', headers, body: JSON.stringify({
    amount: item.amountXOF,
    currency: 'XOF',
    description: `Weechat — ${item.label}`.slice(0, 255),
    redirect_url: `${origin}/paiement-retour?provider=sebpay`,
    cancel_url: `${origin}/credits`,
    callback_url: `${origin}/api/public/sebpay-webhook`,
    metadata: { user_id: userId, item_id: item.id },
  }) });
  const json = await res.json().catch(() => null) as { errors?: { code?: unknown } } | null;
  const session = unwrap(json);
  if (!res.ok || !session?.checkout_url || !session.id) {
    // Only the stable provider error code is logged, never keys, bodies or customer data.
    const code = typeof json?.errors?.code === 'string' && /^[A-Z_]{3,40}$/.test(json.errors.code) ? json.errors.code : 'provider_rejected';
    console.error('SebPay checkout failed', res.status, code);
    throw new Error('Checkout unavailable');
  }
  return { url: session.checkout_url, sessionId: session.id };
}

export type FulfillResult = { status: 'completed' | 'pending' | 'cancelled' | 'failed'; itemId?: string | undefined; userId?: string | undefined };

export async function fulfillSebpaySession(sessionId: string, expectedUserId?: string): Promise<FulfillResult> {
  if (!/^[A-Za-z0-9_-]{4,120}$/.test(sessionId)) return { status: 'failed' };
  const { api, headers } = config();
  const res = await fetch(`${api}/checkout/sessions/${encodeURIComponent(sessionId)}`, { headers });
  const s = unwrap(await res.json().catch(() => null));
  if (!res.ok || !s || s.id !== sessionId) return { status: 'failed' };
  const userId = s.metadata?.user_id, itemId = s.metadata?.item_id;
  // A caller may only learn about their own sessions.
  if (expectedUserId !== undefined && expectedUserId !== userId) return { status: 'failed' };
  if (s.transaction_status !== 'approved') return { status: s.status === 'expired' || s.transaction_status === 'rejected' ? 'cancelled' : 'pending', itemId, userId };
  const item = itemId ? findItem(itemId) : undefined;
  if (!item || !userId || Number(s.amount) !== item.amountXOF || (s.currency ?? 'XOF') !== 'XOF') { console.error('SebPay mismatch'); return { status: 'failed' }; }
  await grantItem(item, userId, `sebpay:${sessionId}`, 'SebPay');
  return { status: 'completed', itemId: item.id, userId };
}

/** HMAC-SHA256 (hex) of the raw body with the secret key, compared in constant time. */
export async function verifySebpaySignature(rawBody: string, signature: string | null) {
  const secret = process.env['SEBPAY_SECRET_KEY'];
  if (!secret || !signature || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody)));
  const expected = Array.from(mac).map(b => b.toString(16).padStart(2, '0')).join('');
  const got = signature.toLowerCase();
  let diff = 0; for (let i = 0; i < 64; i++) diff |= expected.charCodeAt(i) ^ got.charCodeAt(i);
  return diff === 0;
}
