// Legal page texts (templates to be reviewed by a lawyer before production).
export type LegalSlug = 'conditions' | 'confidentialite' | 'interdits';
type Page = { title: string; intro: string; sections: [string, string[]][] };
export const legalPages: Record<'fr' | 'en', Record<LegalSlug, Page>> = {
  fr: {
    conditions: { title: 'Conditions d’utilisation', intro: 'En créant un compte Weechat, vous acceptez les conditions ci-dessous.', sections: [
      ['Accès au service', ['Weechat est réservé aux personnes âgées de 18 ans et plus.', 'Un compte est personnel : ne partagez pas vos identifiants.']],
      ['Points, jetons et packs', ['Les points, minutes et jetons IA sont prépayés, sans abonnement.', 'Ils sont valables pendant la durée indiquée sur chaque pack, puis expirent.', 'La licence Weechat Camera est un paiement unique valable à vie pour votre compte.', 'Les achats consommés ne sont pas remboursables, sauf panne de notre service.']],
      ['Vos responsabilités', ['Vous êtes seul responsable des contenus que vous créez et diffusez.', 'Vous devez avoir l’accord de toute personne dont vous utilisez le visage ou la voix.', 'Les contenus générés doivent être signalés comme tels à vos interlocuteurs et à votre public.']],
      ['Suspension', ['Toute violation entraîne la suspension immédiate et définitive du compte, sans remboursement des soldes restants.']],
    ] },
    confidentialite: { title: 'Politique de confidentialité', intro: 'Cette page explique quelles données Weechat conserve et pourquoi.', sections: [
      ['Ce que nous ne conservons pas', ['Weechat n’enregistre ni vos appels, ni vos vidéos, ni votre voix.', 'Les photos importées pour le Swap restent sur votre appareil.']],
      ['Ce que nous conservons', ['Votre adresse e-mail, votre nom d’affichage et votre langue.', 'L’historique de vos achats et de vos consommations de points, minutes et jetons.']],
      ['Prestataires', ['Les paiements sont traités par PayDunya ; nous ne voyons pas vos données de carte.', 'La traduction vocale et les fonctions IA passent par des prestataires spécialisés, uniquement le temps du traitement.']],
      ['Vos droits', ['Vous pouvez demander la consultation, la correction ou la suppression de votre compte en nous écrivant sur WhatsApp.']],
    ] },
    interdits: { title: 'Usages interdits', intro: 'Les usages suivants sont strictement interdits et peuvent constituer des infractions pénales.', sections: [
      ['Usurpation d’identité', ['Se faire passer pour une personne réelle sans son accord écrit.', 'Utiliser le visage d’une célébrité, d’un proche ou d’un inconnu pour tromper.']],
      ['Fraude', ['Arnaque sentimentale, financière ou au faux support.', 'Chantage, extorsion ou faux témoignages.']],
      ['Contenus illégaux', ['Contenus sexuels non consentis ou impliquant des mineurs.', 'Harcèlement, menaces, incitation à la haine ou désinformation.']],
      ['Conséquences', ['Suspension immédiate et définitive du compte, sans remboursement.', 'Transmission des informations disponibles aux autorités compétentes sur réquisition.', 'Ces actes peuvent entraîner des amendes et des peines de prison.']],
    ] },
  },
  en: {
    conditions: { title: 'Terms of use', intro: 'By creating a Weechat account you accept the terms below.', sections: [
      ['Access', ['Weechat is for people aged 18 and over.', 'Accounts are personal: do not share your credentials.']],
      ['Points, tokens and packs', ['Points, minutes and AI tokens are prepaid, with no subscription.', 'They are valid for the period shown on each pack, then expire.', 'The Weechat Camera licence is a one-time lifetime payment for your account.', 'Used purchases are not refundable, except in case of a failure of our service.']],
      ['Your responsibilities', ['You alone are responsible for content you create and share.', 'You must have the consent of anyone whose face or voice you use.', 'Generated content must be disclosed as such.']],
      ['Suspension', ['Any breach leads to immediate and permanent suspension, without refund of remaining balances.']],
    ] },
    confidentialite: { title: 'Privacy policy', intro: 'This page explains what data Weechat keeps and why.', sections: [
      ['What we do not keep', ['Weechat does not record your calls, videos or voice.', 'Photos imported for Swap stay on your device.']],
      ['What we keep', ['Your email, display name and language.', 'Your purchase history and usage of points, minutes and tokens.']],
      ['Providers', ['Payments are processed by PayDunya; we never see your card data.', 'Voice translation and AI features use specialised providers only during processing.']],
      ['Your rights', ['You can ask to view, correct or delete your account by messaging us on WhatsApp.']],
    ] },
    interdits: { title: 'Forbidden uses', intro: 'The following uses are strictly forbidden and may be criminal offences.', sections: [
      ['Impersonation', ['Posing as a real person without written consent.', 'Using a celebrity’s, relative’s or stranger’s face to deceive.']],
      ['Fraud', ['Romance, financial or fake-support scams.', 'Blackmail, extortion or false testimony.']],
      ['Illegal content', ['Non-consensual sexual content or content involving minors.', 'Harassment, threats, hate speech or disinformation.']],
      ['Consequences', ['Immediate and permanent suspension, without refund.', 'Available information handed to authorities upon lawful request.', 'These acts may lead to fines and prison sentences.']],
    ] },
  },
};
