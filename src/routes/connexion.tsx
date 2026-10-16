import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/weechat/auth';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/connexion')({ head: () => pageHead('Connexion', 'Connexion fictive à l’espace de démonstration Weechat. Aucun compte réel.'), component: Page });
function Page() { return <AuthPage mode="login" />; }
