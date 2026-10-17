import { createFileRoute } from '@tanstack/react-router';
import { HistoryPage } from '@/components/weechat/history';
import { pageHead } from '@/lib/weechat/metadata';
import { creditsQuery } from '@/lib/weechat/credits-query';
export const Route = createFileRoute('/_authenticated/historique')({ head: () => pageHead('Historique des crédits', 'Consultez vos mouvements de crédits personnels Weechat.'), loader: ({ context }) => context.queryClient.ensureQueryData(creditsQuery), component: HistoryPage });
