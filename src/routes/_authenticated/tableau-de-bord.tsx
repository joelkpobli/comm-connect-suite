import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@/components/weechat/dashboard';
import { pageHead } from '@/lib/weechat/metadata';
import { creditsQuery } from '@/lib/weechat/credits-query';
import { profileQuery } from '@/lib/weechat/profile-query';
export const Route = createFileRoute('/_authenticated/tableau-de-bord')({ head: () => pageHead('Tableau de bord', 'Votre profil et votre solde personnel Weechat.'), loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(creditsQuery), context.queryClient.ensureQueryData(profileQuery)]), component: DashboardPage });
