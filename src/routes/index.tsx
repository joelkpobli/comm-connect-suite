import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/components/weechat/home';
import { pageHead } from '@/lib/weechat/metadata';
import globe from '@/assets/globe.asset.json';
export const Route = createFileRoute('/')({ head: () => ({ meta: [...pageHead('Changez d’apparence, traduisez en direct', 'Weechat : persona vidéo, voix et traduction FR ⇄ EN pour accompagner vos appels, lives et streams.').meta, { property: 'og:image', content: globe.url }, { name: 'twitter:image', content: globe.url }] }), component: HomePage });
