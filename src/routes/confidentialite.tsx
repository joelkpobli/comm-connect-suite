import { createFileRoute } from '@tanstack/react-router';
import { LegalPage } from '@/components/weechat/legal-page';

export const Route = createFileRoute('/confidentialite')({
  head: () => ({ meta: [
    { title: 'Politique de confidentialité · Weechat' }, { name: 'description', content: 'Données conservées par Weechat, prestataires et droits des utilisateurs.' },
    { property: 'og:title', content: 'Politique de confidentialité · Weechat' }, { property: 'og:description', content: 'Données conservées par Weechat, prestataires et droits des utilisateurs.' },
    { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <LegalPage slug="confidentialite" />,
});
