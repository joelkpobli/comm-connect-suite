import { createFileRoute } from '@tanstack/react-router';
import { CreditsPage } from '@/components/weechat/credits';
import { pageHead } from '@/lib/weechat/metadata';
import { creditsQuery } from '@/lib/weechat/credits-query';
export const Route = createFileRoute('/_authenticated/credits')({ head: () => pageHead('Soldes et tarifs', 'Vos points et minutes audio Weechat. Catalogue tarifaire et paiements indisponibles.'), loader: ({ context }) => context.queryClient.ensureQueryData(creditsQuery), component: CreditsPage });
