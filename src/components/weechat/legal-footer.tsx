import { ShieldAlert } from 'lucide-react';
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
  return <footer className="legal-footer">
    <div className="legal-warn" role="note"><ShieldAlert size={30} /><div><h2>{c.warnTitle}</h2><p>{c.warn}</p><p><strong>{c.sanction}</strong></p></div></div>
    <div className="legal-cols">{c.cols.map(([t, items], n) => { const to = n === 0 ? '/conditions-utilisation' as const : n === 1 ? '/confidentialite' as const : '/usages-interdits' as const; return <section key={t}><h3><Link to={to}>{t}</Link></h3><ul>{items.map(i => <li key={i}>{i}</li>)}</ul><Link to={to} className="legal-more">{c.more} →</Link></section>; })}</div>
    <div className="legal-bottom"><span>{c.rights}</span></div>
  </footer>;
}
