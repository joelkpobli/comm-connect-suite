import { isLow, lowBalanceKey, type LowService } from './low-balance';

/** Best-effort: never blocks or fails a billing call. */
export async function maybeSendLowBalance(service: LowService, userId: string, balance: number, email?: string | null) {
  if (!isLow(service, balance)) return;
  try {
    let to = email ?? null;
    if (!to) {
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
      to = data.user?.email ?? null;
    }
    if (!to) return;
    const b = Math.max(0, balance);
    const balanceLabel = service === 'audio' ? `${Math.floor(b / 60)} min ${b % 60} s de traduction` : `${b} points`;
    const minutesLeft = Math.floor((service === 'audio' ? b : b / 2) / 60);
    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email');
    await sendTemplateEmail('low-balance', to, { templateData: { service, balanceLabel, minutesLeft }, idempotencyKey: lowBalanceKey(service, userId, new Date()) });
  } catch (e) {
    console.error('low-balance email', e instanceof Error ? e.message : e);
  }
}
