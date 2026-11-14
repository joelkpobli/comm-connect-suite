import { createFileRoute } from '@tanstack/react-router';
import { LegalPage } from '@/components/weechat/legal-page';

export const Route = createFileRoute('/usages-interdits')({
  head: () => ({ meta: [
    { title: 'Usages interdits · Weechat' }, { name: 'description', content: 'Usurpation d’identité, fraude et contenus interdits sur Weechat, et leurs conséquences.' },
    { property: 'og:title', content: 'Usages interdits · Weechat' }, { property: 'og:description', content: 'Usurpation d’identité, fraude et contenus interdits sur Weechat, et leurs conséquences.' },
    { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <LegalPage slug="interdits" />,
});
