import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/components/weechat/home';
import { pageHead } from '@/lib/weechat/metadata';
import globe from '@/assets/globe.asset.json';
export const Route = createFileRoute('/')({ head: () => ({ meta: [...pageHead('Votre voix, un monde de possibilités', 'Découvrez Weechat, un prototype visuel de couche de communication multilingue pour accompagner vos applications d’appel.').meta, { property: 'og:image', content: globe.url }, { name: 'twitter:image', content: globe.url }] }), component: HomePage });
