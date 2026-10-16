import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/weechat/auth';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/inscription')({ head: () => pageHead('Inscription', 'Découvrez le formulaire d’inscription visuel Weechat, sans création de compte.'), component: Page });
function Page() { return <AuthPage mode="signup" />; }
