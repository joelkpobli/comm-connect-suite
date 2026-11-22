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

export function LegalFooter() {
  const { locale } = useDemo(); const c = copy[locale === 'en' ? 'en' : 'fr'];
  const links = [['/conditions-utilisation', c.cols[0][0]], ['/confidentialite', c.cols[1][0]], ['/usages-interdits', c.cols[2][0]], ['/contact', locale === 'en' ? 'Contact & suggestions' : 'Contact et suggestions']] as const;
  return <footer className="legal-footer">
    <nav className="legal-links flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label={c.cols[0][0]}>{links.map(([to, label]) => <Link key={to} to={to} className="underline-offset-4 hover:underline">{label}</Link>)}</nav>
    <div className="legal-bottom"><span>{c.rights}</span></div>
  </footer>;
}
