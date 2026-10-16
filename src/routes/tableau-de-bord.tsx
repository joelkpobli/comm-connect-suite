import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@/components/weechat/dashboard';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/tableau-de-bord')({ head: () => pageHead('Tableau de bord', 'Votre espace Weechat de démonstration avec solde de crédits fictif.'), component: DashboardPage });
