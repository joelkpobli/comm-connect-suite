import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/components/weechat/home';
import { pageHead } from '@/lib/weechat/metadata';
import heroPoster from '@/assets/hero/hero-swap-1.jpg.asset.json';
const og = heroPoster.url;
const ld = { '@context': 'https://schema.org', '@graph': [{ '@type': 'Organization', name: 'Weechat', url: 'https://www.weechat.online', logo: 'https://www.weechat.online/icon-512.png' }, { '@type': 'SoftwareApplication', name: 'Weechat', operatingSystem: 'Windows, Web', applicationCategory: 'MultimediaApplication', url: 'https://www.weechat.online', inLanguage: ['fr', 'en'], areaServed: ['Africa', 'CI', 'BJ', 'SN', 'CM', 'NG', 'GH', 'KE', 'ZA'], offers: { '@type': 'Offer', price: '10000', priceCurrency: 'XOF', name: 'Weechat Camera — licence à vie' } }] };
export const Route = createFileRoute('/')({ head: () => ({ meta: [...pageHead('Changez d’apparence, traduisez en direct', 'Weechat : persona vidéo, voix et traduction FR ⇄ EN pour accompagner vos appels, lives et streams.').meta, { property: 'og:image', content: og }, { name: 'twitter:image', content: og }, { property: 'og:url', content: 'https://www.weechat.online/' }], links: [{ rel: 'canonical', href: 'https://www.weechat.online/' }], scripts: [{ type: 'application/ld+json', children: JSON.stringify(ld) }] }), component: HomePage });
