import { createFileRoute } from '@tanstack/react-router';
import { CreditsPage } from '@/components/weechat/credits';
import { pageHead } from '@/lib/weechat/metadata';
import { creditsQuery } from '@/lib/weechat/credits-query';
export const Route = createFileRoute('/_authenticated/credits')({ head: () => pageHead('Packs de crédits', 'Votre solde Weechat et les packs de démonstration. Paiements non activés.'), loader: ({ context }) => context.queryClient.ensureQueryData(creditsQuery), component: CreditsPage });
