import { useDemo } from './provider';
import { Link } from '@tanstack/react-router';

const copy = {
  fr: {
    warnTitle: 'Avertissement : usurpation d’identité interdite',
    warn: 'Utiliser Weechat pour se faire passer pour une autre personne, escroquer, harceler, faire chanter ou diffuser un deepfake sans le consentement de la personne représentée est strictement interdit. Ces actes constituent des infractions pénales dans la plupart des pays (usurpation d’identité, escroquerie, atteinte à la vie privée et à l’image) et peuvent entraîner des amendes et des peines de prison.',
    sanction: 'Tout manquement entraîne la suspension immédiate et définitive du compte, sans remboursement des points restants, et la transmission des informations disponibles aux autorités compétentes sur réquisition.',
    cols: [
      ['Conditions d’utilisation', ['Service réservé aux personnes de 18 ans et plus.', 'Vous êtes seul responsable des contenus créés et diffusés.', 'Les contenus générés doivent être signalés comme tels.', 'Points prépayés, sans abonnement, valables selon le pack.']],
      ['Confidentialité', ['Weechat n’enregistre ni vos appels ni vos vidéos.', 'Vos photos importées restent sur votre appareil.', 'Seules les données de compte et de paiement sont conservées.', 'Vous pouvez demander la suppression de votre compte.']],
      ['Usages interdits', ['Se faire passer pour une personne réelle sans son accord.', 'Fraude, arnaque sentimentale ou financière.', 'Contenus sexuels non consentis ou impliquant des mineurs.', 'Harcèlement, menaces, chantage ou désinformation.']],
    ],
    more: 'Lire la page complète', rights: '© 2026 Weechat. Tous droits réservés.',
  },
  en: {
    warnTitle: 'Warning: impersonation is forbidden',
    warn: 'Using Weechat to pass yourself off as someone else, defraud, harass, blackmail or share a deepfake without the depicted person’s consent is strictly forbidden. These acts are criminal offences in most countries (identity theft, fraud, invasion of privacy and image rights) and may lead to fines and prison sentences.',
    sanction: 'Any breach leads to immediate and permanent account suspension, without refund of remaining points, and available information is handed to the competent authorities upon lawful request.',
    cols: [
      ['Terms of use', ['Service for people aged 18 and over.', 'You alone are responsible for content you create and share.', 'Generated content must be disclosed as such.', 'Prepaid points, no subscription, valid per pack.']],
      ['Privacy', ['Weechat does not record your calls or videos.', 'Uploaded photos stay on your device.', 'Only account and payment data is kept.', 'You can request deletion of your account.']],
      ['Forbidden uses', ['Posing as a real person without consent.', 'Fraud, romance or financial scams.', 'Non-consensual sexual content or content involving minors.', 'Harassment, threats, blackmail or disinformation.']],
    ],
    more: 'Read the full page', rights: '© 2026 Weechat. All rights reserved.',
  },
} as const;

const partners = [
  ['Grey', 'https://greyapp.page.link/jixhVD5wH6mdykEY7', 'Comptes USD, EUR, GBP depuis l’Afrique', 'USD, EUR, GBP accounts from Africa', 'Recommandé', 'Recommended'],
  ['Wise', 'https://wise.com/invite/ahpc/joelk1130', 'Transferts internationaux au taux réel', 'International transfers at the real rate', 'Taux réel', 'Real rate'],
  ['Volet (ex-Advcash)', 'https://volet.onelink.me/jJs2?pid=User_invite&deep_link_value=G3KwBb8R', 'Portefeuille multidevise et crypto', 'Multi-currency and crypto wallet', 'Multidevise', 'Multi-currency'],
] as const;

export function LegalFooter() {
  const { locale } = useDemo(); const c = copy[locale === 'en' ? 'en' : 'fr'];
  const links = [['/conditions-utilisation', c.cols[0][0]], ['/confidentialite', c.cols[1][0]], ['/usages-interdits', c.cols[2][0]], ['/contact', locale === 'en' ? 'Contact & suggestions' : 'Contact et suggestions']] as const;
  return <footer className="legal-footer">
    <nav className="legal-links flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label={c.cols[0][0]}>{links.map(([to, label]) => <Link key={to} to={to} className="underline-offset-4 hover:underline">{label}</Link>)}</nav>
    <section aria-label={locale === 'en' ? 'Useful services' : 'Services utiles'} className="grid gap-3 text-center">
      <p className="font-semibold">{locale === 'en' ? 'Useful services: receive money from abroad' : 'Services utiles : recevoir de l’argent de l’étranger'}</p>
      <ul className="mx-auto grid w-full max-w-4xl gap-3 sm:grid-cols-3">{partners.map(([n, u, fr, en, bFr, bEn]) => <li key={n}><a href={u} target="_blank" rel="sponsored noopener noreferrer" className="flex h-full flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-ring"><span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">{locale === 'en' ? bEn : bFr}</span><strong className="text-base text-foreground">{n}</strong><span className="text-sm text-muted-foreground">{locale === 'en' ? en : fr}</span><span className="mt-auto text-sm font-medium text-primary">{locale === 'en' ? 'Open an account →' : 'Ouvrir un compte →'}</span></a></li>)}</ul>
      <p className="text-xs text-muted-foreground">{locale === 'en' ? 'Independent services, not operated by Weechat. Links may be partner links.' : 'Services indépendants, non opérés par Weechat. Certains liens peuvent être des liens partenaires.'}</p>
    </section>
    <div className="legal-bottom"><span>{c.rights}</span></div>
  </footer>;
}
