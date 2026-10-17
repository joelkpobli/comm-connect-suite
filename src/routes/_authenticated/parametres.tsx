import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/components/weechat/settings';
import { pageHead } from '@/lib/weechat/metadata';
import { profileQuery } from '@/lib/weechat/profile-query';
export const Route = createFileRoute('/_authenticated/parametres')({ head: () => pageHead('Paramètres du compte', 'Profil et préférences personnelles Weechat.'), loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery), component: SettingsPage });
