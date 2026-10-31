import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/components/weechat/home';
import { pageHead } from '@/lib/weechat/metadata';
import heroPoster from '@/assets/hero/hero-swap-1.jpg.asset.json';
const og = heroPoster.url;
export const Route = createFileRoute('/')({ head: () => ({ meta: [...pageHead('Changez d’apparence, traduisez en direct', 'Weechat : persona vidéo, voix et traduction FR ⇄ EN pour accompagner vos appels, lives et streams.').meta, { property: 'og:image', content: og }, { name: 'twitter:image', content: og }] }), component: HomePage });
