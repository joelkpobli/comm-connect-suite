import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/weechat/auth';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/reinitialisation')({ head: () => pageHead('Nouveau mot de passe', 'Choisissez un nouveau mot de passe pour votre compte Weechat.'), component: Page });
function Page() { return <AuthPage mode="update" />; }
