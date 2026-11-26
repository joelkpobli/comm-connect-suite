// Whop card checkout (server only). Amount comes from the server catalogue; fulfillment
// re-reads the payment from Whop and checks status, owner, item and amount before crediting.
import { findItem } from './paydunya-catalog';
import { grantItem } from './paydunya.server';
import { whopVariants } from './whop-variants';

const API = 'https://api.whop.com/api/v1';
function auth() {
  const key = process.env['WHOP_API_KEY'], company = process.env['WHOP_COMPANY_ID'];
  if (!key || !company) throw new Error('Whop not configured');
  return { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, company };
}

export async function createWhopCheckout(itemId: string, userId: string, origin: string) {
  const item = findItem(itemId); if (!item || !(item.amountUSD > 0)) throw new Error('Unknown item');
  const planId = whopVariants[item.id]; if (!planId) throw new Error('No Whop plan');
  const { headers } = auth();
  const res = await fetch(`${API}/checkout_configurations`, { method: 'POST', headers, body: JSON.stringify({
    plan_id: planId,
    mode: 'payment',
    metadata: { user_id: userId, item_id: item.id },
    redirect_url: `${origin}/paiement-retour?provider=whop`,
  }) });
  const json = await res.json().catch(() => null) as { purchase_url?: string; error?: { type?: unknown } } | null;
  if (!res.ok || !json?.purchase_url) {
    // Keep diagnostics useful without logging provider bodies, checkout URLs or customer metadata.
    const type = json?.error?.type;
    const category = typeof type === 'string' && ['invalid_request_error', 'authentication_error', 'permission_error', 'not_found_error', 'rate_limit_error'].includes(type)
      ? type : res.ok ? 'missing_purchase_url' : 'provider_rejected';
    console.error('Whop checkout failed', res.status, category);
    throw new Error('Checkout unavailable');
  }
  return { url: json.purchase_url };
}

export async function fulfillWhopPayment(paymentId: string) {
  if (!/^[A-Za-z0-9_-]{4,100}$/.test(paymentId)) return { status: 'failed' as const };
  const res = await fetch(`${API}/payments/${paymentId}`, { headers: auth().headers });
  const p = await res.json().catch(() => null) as { status?: string; total?: number; subtotal?: number; currency?: string; metadata?: Record<string, unknown> } | null;
  if (!res.ok || !p) return { status: 'failed' as const };
  if (p.status !== 'paid') return { status: 'pending' as const };
  const userId = String(p.metadata?.['user_id'] ?? ''), item = findItem(String(p.metadata?.['item_id'] ?? ''));
  const paid = Number(p.subtotal ?? p.total);
  if (!item || !userId || !(paid + 0.01 >= item.amountUSD)) { console.error('Whop mismatch', paymentId); return { status: 'failed' as const }; }
  await grantItem(item, userId, `whop:${paymentId}`, 'Carte · Whop');
  return { status: 'completed' as const };
}

/** Standard Webhooks signature check (webhook-id.timestamp.body, HMAC-SHA256, base64). */
export async function verifyWhopSignature(secret: string, id: string, ts: string, sigHeader: string, body: string) {
  if (!id || !ts || !sigHeader || Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const raw = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  let keyBytes: Uint8Array; try { keyBytes = Uint8Array.from(atob(raw), c => c.charCodeAt(0)); } catch { keyBytes = new TextEncoder().encode(secret); }
  const tryKey = async (k: Uint8Array) => {
    const key = await crypto.subtle.importKey("raw", k as BufferSource, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${ts}.${body}`)));
    return btoa(String.fromCharCode(...mac));
  };
  const expected = [await tryKey(keyBytes), await tryKey(new TextEncoder().encode(secret))];
  return sigHeader.split(' ').some(s => { const v = s.split(',')[1] ?? ''; return expected.some(e => e.length === v.length && e === v); });
}
