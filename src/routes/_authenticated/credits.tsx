import { createFileRoute } from '@tanstack/react-router';
import { CreditsPage } from '@/components/weechat/credits';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/_authenticated/credits')({ head: () => pageHead('Packs de crédits', 'Découvrez les packs de crédits fictifs Weechat. Aucun paiement réel.'), component: CreditsPage });
