import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/weechat/auth';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/connexion')({ head: () => pageHead('Connexion', 'Connectez-vous à votre compte personnel Weechat.'), component: Page });
function Page() { return <AuthPage mode="login" />; }
