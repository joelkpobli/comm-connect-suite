import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/weechat/auth';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/inscription')({ head: () => pageHead('Inscription', 'Créez votre compte Weechat et confirmez votre adresse e-mail.'), component: Page });
function Page() { return <AuthPage mode="signup" />; }
