import { createFileRoute } from '@tanstack/react-router';
import { LegalPage } from '@/components/weechat/legal-page';

export const Route = createFileRoute('/conditions-utilisation')({
  head: () => ({ meta: [
    { title: 'Conditions d’utilisation · Weechat' }, { name: 'description', content: 'Règles d’accès, packs prépayés et responsabilités des utilisateurs de Weechat.' },
    { property: 'og:title', content: 'Conditions d’utilisation · Weechat' }, { property: 'og:description', content: 'Règles d’accès, packs prépayés et responsabilités des utilisateurs de Weechat.' },
    { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <LegalPage slug="conditions" />,
});
