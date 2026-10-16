export const copy = {
  fr: {
    home: 'Accueil', dashboard: 'Tableau de bord', credits: 'Acheter des crédits', history: 'Historique', settings: 'Paramètres', login: 'Se connecter', signup: 'Commencer', demo: 'Prototype visuel', account: 'Espace personnel', logout: 'Quitter la démo',
    homeTag: 'LA COMMUNICATION, SANS FRONTIÈRES', homeTitle: 'Votre voix. Un monde de possibilités.', homeDescription: 'Une couche de communication multilingue pensée pour accompagner vos applications d’appel. Votre voix, vos échanges, de nouveaux horizons.', explore: 'Explorer la démo', create: 'Créer un compte', note: 'Démonstration visuelle · Aucun compte ni paiement réel',
    welcome: 'Bon retour !', signupTitle: 'Un monde vous attend.', resetTitle: 'Un nouveau départ.', loginSub: 'Retrouvez votre espace Weechat.', signupSub: 'Votre prochaine conversation commence ici.', resetSub: 'Saisissez votre e-mail pour simuler la récupération.', name: 'Nom complet', email: 'Adresse e-mail', password: 'Mot de passe', confirm: 'Confirmer le mot de passe', forgot: 'Mot de passe oublié ?', remember: 'Se souvenir de moi', noAccount: 'Pas encore de compte ?', hasAccount: 'Déjà un compte ?', register: 'S’inscrire', send: 'Envoyer le lien', backLogin: 'Retour à la connexion',
    greeting: 'Bonjour, Jean', dashboardSub: 'Votre prochain échange commence ici.', balance: 'Votre solde de crédits', creditUnit: 'crédits disponibles', add: 'Ajouter des crédits', preview: 'Aperçu d’une conversation', session: 'Préparer un échange', recent: 'Activité récente', viewAll: 'Tout voir', demoData: 'Données fictives · Aucun appel réel',
  },
  en: {
    home: 'Home', dashboard: 'Dashboard', credits: 'Buy credits', history: 'History', settings: 'Settings', login: 'Sign in', signup: 'Get started', demo: 'Visual prototype', account: 'Your workspace', logout: 'Leave demo',
    homeTag: 'COMMUNICATION, WITHOUT BORDERS', homeTitle: 'Your voice. A world of possibilities.', homeDescription: 'A multilingual communication layer designed to accompany your calling apps. Your voice, your conversations, new horizons.', explore: 'Explore the demo', create: 'Create an account', note: 'Visual demo · No real account or payment',
    welcome: 'Welcome back!', signupTitle: 'A world awaits you.', resetTitle: 'A fresh start.', loginSub: 'Welcome to your Weechat workspace.', signupSub: 'Your next conversation starts here.', resetSub: 'Enter your email to simulate password recovery.', name: 'Full name', email: 'Email address', password: 'Password', confirm: 'Confirm password', forgot: 'Forgot password?', remember: 'Remember me', noAccount: 'No account yet?', hasAccount: 'Already have an account?', register: 'Sign up', send: 'Send link', backLogin: 'Back to sign in',
    greeting: 'Hello, Jean', dashboardSub: 'Your next conversation starts here.', balance: 'Your credit balance', creditUnit: 'credits available', add: 'Add credits', preview: 'Conversation preview', session: 'Prepare a conversation', recent: 'Recent activity', viewAll: 'View all', demoData: 'Fictional data · No real calls',
  },
};
export type Locale = keyof typeof copy;
export type CopyKey = keyof typeof copy.fr;
