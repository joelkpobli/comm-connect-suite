import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/components/weechat/home';
import { pageHead } from '@/lib/weechat/metadata';
import { landingFaces } from '@/lib/weechat/landing-copy';
const og = landingFaces[0]!.src;
export const Route = createFileRoute('/')({ head: () => ({ meta: [...pageHead('Changez d’apparence, traduisez en direct', 'Weechat : persona vidéo, voix et traduction FR ⇄ EN pour accompagner vos appels, lives et streams.').meta, { property: 'og:image', content: og }, { name: 'twitter:image', content: og }] }), component: HomePage });
