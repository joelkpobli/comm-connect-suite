// PayDunya Live API (server only). Fulfillment always re-confirms the invoice with
// PayDunya, checks owner/item/amount, then writes with a unique reference per invoice.
import { findItem } from './paydunya-catalog';

const API = 'https://app.paydunya.com/api/v1';

function headers() {
  const master = process.env['PAYDUNYA_MASTER_KEY'], priv = process.env['PAYDUNYA_PRIVATE_KEY'], token = process.env['PAYDUNYA_TOKEN'];
  if (!master || !priv || !token) throw new Error('PayDunya not configured');
  const h: Record<string, string> = { 'Content-Type': 'application/json', 'PAYDUNYA-MASTER-KEY': master, 'PAYDUNYA-PRIVATE-KEY': priv, 'PAYDUNYA-TOKEN': token };
  const pub = process.env['PAYDUNYA_PUBLIC_KEY']; if (pub) h['PAYDUNYA-PUBLIC-KEY'] = pub;
  return h;
}

export async function createInvoice(itemId: string, userId: string, origin: string) {
  const item = findItem(itemId); if (!item) throw new Error('Unknown item');
  const body = {
    invoice: { total_amount: item.amountXOF, description: item.label, items: { item_0: { name: item.label, quantity: 1, unit_price: String(item.amountXOF), total_price: String(item.amountXOF) } } },
    store: { name: 'Weechat', website_url: origin },
    actions: { cancel_url: `${origin}/credits`, return_url: `${origin}/paiement-retour`, callback_url: `${origin}/api/public/paydunya-ipn` },
    custom_data: { user_id: userId, item_id: item.id },
  };
  const res = await fetch(`${API}/checkout-invoice/create`, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
  const json = await res.json().catch(() => null) as { response_code?: string; response_text?: string; token?: string } | null;
  if (!json || json.response_code !== '00' || !json.response_text || !json.token) {
    console.error('PayDunya create failed', res.status, json?.response_code, json?.response_text);
    throw new Error('Checkout unavailable');
  }
  return { url: json.response_text, token: json.token };
}

export type FulfillResult = { status: 'completed' | 'pending' | 'cancelled' | 'failed'; itemId?: string | undefined; userId?: string | undefined };

export async function fulfillInvoice(token: string, expectedUserId?: string): Promise<FulfillResult> {
  if (!/^[A-Za-z0-9_-]{6,100}$/.test(token)) return { status: 'failed' };
  const res = await fetch(`${API}/checkout-invoice/confirm/${token}`, { headers: headers() });
  const json = await res.json().catch(() => null) as { response_code?: string; status?: string; invoice?: { total_amount?: number | string }; custom_data?: { user_id?: string; item_id?: string } } | null;
  if (!json || json.response_code !== '00') return { status: 'failed' };
  const userId = json.custom_data?.user_id, itemId = json.custom_data?.item_id;
  if (json.status === 'cancelled') return { status: 'cancelled', itemId, userId };
  if (json.status !== 'completed') return { status: 'pending', itemId, userId };
  const item = itemId ? findItem(itemId) : undefined;
  if (!item || !userId || Number(json.invoice?.total_amount) !== item.amountXOF) { console.error('PayDunya mismatch', token); return { status: 'failed' }; }
  if (expectedUserId && expectedUserId !== userId) return { status: 'failed' };

  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const ref = `paydunya:${token}`, reason = `Achat ${item.label} (PayDunya)`;
  if (item.points > 0) {
    const { error } = await supabaseAdmin.rpc('post_credit_operation', { p_user_id: userId, p_amount: item.points, p_kind: 'purchase', p_reason: reason, p_reference: ref });
    if (error) { console.error('credit failed', error.message); throw new Error('Fulfillment failed'); }
  }
  if (item.audioSeconds > 0) {
    const { error } = await supabaseAdmin.rpc('post_audio_operation', { p_user_id: userId, p_seconds: item.audioSeconds, p_kind: 'purchase', p_reason: reason, p_reference: ref });
    if (error) { console.error('audio failed', error.message); throw new Error('Fulfillment failed'); }
  }
  if (item.aiTokens > 0) {
    const { error } = await supabaseAdmin.rpc('post_ai_token_operation', { p_user_id: userId, p_tokens: item.aiTokens, p_kind: 'bonus', p_reason: `Bonus jetons IA — ${item.label}`, p_reference: ref });
    if (error) { console.error('tokens failed', error.message); throw new Error('Fulfillment failed'); }
  }
  if (item.validityDays > 0) {
    const targets = [item.points > 0 && 'credits', item.audioSeconds > 0 && 'audio', item.aiTokens > 0 && 'tokens'].filter(Boolean) as string[];
    for (const t of targets) {
      const { error } = await supabaseAdmin.rpc('extend_validity', { p_user_id: userId, p_target: t, p_days: item.validityDays });
      if (error) console.error('validity failed', t, error.message);
    }
  }
  if (item.cameraLicense) {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error || !data.user) throw new Error('Fulfillment failed');
    if (!data.user.app_metadata?.['camera_license']) {
      const r = await supabaseAdmin.auth.admin.updateUserById(userId, { app_metadata: { ...data.user.app_metadata, camera_license: true, camera_license_ref: ref } });
      if (r.error) throw new Error('Fulfillment failed');
    }
  }
  return { status: 'completed', itemId: item.id, userId };
}
