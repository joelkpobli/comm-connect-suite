import { createFileRoute } from '@tanstack/react-router';
import { ContactPage } from '@/components/weechat/contact-page';

const title = 'Contact et suggestions · Weechat';
const description = 'Posez une question, signalez un problème ou proposez une idée à l’équipe Weechat.';
export const Route = createFileRoute('/contact')({
  head: () => ({
    meta: [
      { title }, { name: 'description', content: description },
      { property: 'og:title', content: title }, { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' }, { property: 'og:url', content: 'https://www.weechat.online/contact' },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [{ rel: 'canonical', href: 'https://www.weechat.online/contact' }],
  }),
  component: ContactPage,
});
