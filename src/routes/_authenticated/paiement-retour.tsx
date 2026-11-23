import { useEffect, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/weechat/shared';
import { confirmCheckout } from '@/lib/weechat/payments.functions';
import { findItem } from '@/lib/weechat/paydunya-catalog';
import { pageHead } from '@/lib/weechat/metadata';

export const Route = createFileRoute('/_authenticated/paiement-retour')({
  validateSearch: (s: Record<string, unknown>) => ({ token: typeof s['token'] === 'string' ? s['token'] : '', provider: s['provider'] === 'whop' ? 'whop' : '' }),
  head: () => pageHead('Confirmation de paiement', 'Vérification de votre paiement PayDunya Weechat.'),
  component: PaymentReturn,
});

function PaymentReturn() {
  const { token, provider } = Route.useSearch();
  const confirm = useServerFn(confirmCheckout);
  const qc = useQueryClient();
  const [state, setState] = useState<{ status: string; itemId: string | null }>({ status: 'checking', itemId: null });
  useEffect(() => {
    if (provider === 'whop') { setState({ status: 'pending', itemId: null }); const t = setTimeout(() => void qc.invalidateQueries(), 4000); return () => clearTimeout(t); }
    if (!token) { setState({ status: 'failed', itemId: null }); return undefined; }
    confirm({ data: { token } }).then(r => { setState(r); if (r.status === 'completed') void qc.invalidateQueries(); }).catch(() => setState({ status: 'failed', itemId: null }));
    return undefined;
  }, [token, provider]);
  const item = state.itemId ? findItem(state.itemId) : undefined;
  const ui = {
    checking: [Clock, 'Vérification du paiement…', 'Merci de patienter quelques secondes.'],
    completed: [CheckCircle2, 'Paiement confirmé', `${item?.label ?? 'Votre achat'} a été ajouté à votre compte.`],
    pending: [Clock, 'Paiement en attente', 'Le paiement n’est pas encore confirmé. Votre solde sera crédité automatiquement dès confirmation.'],
    cancelled: [XCircle, 'Paiement annulé', 'Aucun montant n’a été débité.'],
    failed: [XCircle, 'Paiement non confirmé', 'Nous n’avons pas pu confirmer ce paiement. Contactez le support WhatsApp si vous avez été débité.'],
  } as const;
  const [Icon, title, text] = ui[state.status as keyof typeof ui] ?? ui.failed;
  return <>
    <PageTitle title={title} subtitle={text} />
    <div className="flex items-center gap-4"><Icon size={40} className="text-primary" />
      <Button asChild><Link to="/credits">Voir mes soldes</Link></Button>
      {state.status === 'pending' && <Button variant="outline" onClick={() => location.reload()}>Revérifier</Button>}
    </div>
  </>;
}
