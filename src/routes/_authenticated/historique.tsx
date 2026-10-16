import { createFileRoute } from '@tanstack/react-router';
import { HistoryPage } from '@/components/weechat/history';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/_authenticated/historique')({ head: () => pageHead('Historique des crédits', 'Consultez et filtrez les mouvements de crédits fictifs dans Weechat.'), component: HistoryPage });
