// Shared purchase fulfillment (server only): every provider verifies the payment first,
// then credits through here with a unique provider reference so writes stay idempotent.
import type { CatalogueItem } from './catalog';
import { CAMERA_STUDIO_BONUS_SECONDS, studioClient, studioReady } from './studio-hours';

/** Credits a verified purchase; the unique reference makes every write idempotent. */
export async function grantItem(item: CatalogueItem, userId: string, ref: string, provider: string) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const reason = `Achat ${item.label} (${provider})`;
  const ready = await studioReady(supabaseAdmin);
  if (item.id.startsWith('studio-') && !ready) throw new Error('Studio fulfillment unavailable');
  if (ready && (item.studioSeconds ?? 0) > 0) {
    const r = await studioClient(supabaseAdmin).rpc('post_studio_operation', { p_user_id: userId, p_seconds: item.studioSeconds, p_reference: `studio:${ref}`, p_reason: reason, p_days: item.validityDays });
    if (r.error) throw new Error('Studio fulfillment failed');
  }
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
    if (ready) {
      const r = await studioClient(supabaseAdmin).rpc('post_studio_operation', { p_user_id: userId, p_seconds: CAMERA_STUDIO_BONUS_SECONDS, p_reference: `camera-welcome:${userId}`, p_reason: 'Bonus caméra : 72 heures', p_days: 365 });
      if (r.error) throw new Error('Studio welcome fulfillment failed');
    }
    if (!data.user.app_metadata?.['camera_license']) {
      const r = await supabaseAdmin.auth.admin.updateUserById(userId, { app_metadata: { ...data.user.app_metadata, camera_license: true, camera_license_ref: ref } });
      if (r.error) throw new Error('Fulfillment failed');
    }
  }
  await sendReceipt(item, userId, ref, provider);
}

/** Best-effort receipt: a mail failure never undoes or blocks a verified credit. */
async function sendReceipt(item: CatalogueItem, userId: string, ref: string, provider: string) {
  try {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
    const email = data.user?.email;
    if (!email) return;
    const lines: string[] = [];
    if ((item.studioSeconds ?? 0) > 0) lines.push(`${(item.studioSeconds ?? 0) / 3600} heures de diffusion Studio`);
    if (item.points > 0) lines.push(`${item.points.toLocaleString('fr-FR')} points`);
    if (item.audioSeconds > 0) lines.push(`${Math.round(item.audioSeconds / 60)} minutes de traduction`);
    if (item.aiTokens > 0) lines.push(`${item.aiTokens} jetons IA`);
    if (item.cameraLicense) lines.push('Licence Weechat Camera à vie');
    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email');
    await sendTemplateEmail('payment-receipt', email, { templateData: { packLabel: item.label, provider, lines, reference: ref }, idempotencyKey: `payment-receipt-${ref}` });
  } catch (e) { console.error('receipt email failed', e instanceof Error ? e.message : e); }
}
