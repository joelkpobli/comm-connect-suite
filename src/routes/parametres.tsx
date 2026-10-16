import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/components/weechat/settings';
import { pageHead } from '@/lib/weechat/metadata';
export const Route = createFileRoute('/parametres')({ head: () => pageHead('Paramètres du compte', 'Préférences locales de votre compte de démonstration Weechat.'), component: SettingsPage });
