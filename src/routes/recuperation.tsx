import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/weechat/auth';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/recuperation')({ head: () => pageHead('Récupération du mot de passe', 'Recevez un lien personnel pour réinitialiser votre mot de passe Weechat.'), component: Page });
function Page() { return <AuthPage mode="reset" />; }
