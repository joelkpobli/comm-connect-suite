# Comm Connect Suite

Crée uniquement le frontend visuel de mon application SaaS Weechat UI Prototype.
CONTRAINTES ABSOLUES
Ne crée aucune base de données.
N’active pas Lovable Cloud.
Ne connecte aucun service Supabase, Stripe, API ou backend.
N’ajoute aucune authentification réelle.
Ne génère aucune Edge Function.
Ne publie pas l’application.
N’ajoute aucune clé API ni aucun secret.
Ne crée pas de fonctionnalités backend. Tous les éléments interactifs doivent utiliser des données fictives locales.
TECHNOLOGIE
Utilise la stack frontend proposée par Lovable pour ce nouveau projet. Organise le code en composants réutilisables et garde les données de démonstration séparées des composants visuels.
IDENTITÉ VISUELLE
Application SaaS premium, moderne et professionnelle.
Fond bleu nuit très sombre : #070B12.
Bleu électrique : #19B5FE.
Typographie Inter ou une police système proche.
Interface responsive, propre et accessible.
Logo Weechat avec un monogramme W.
Textes courts, interface principalement en français, structure préparée pour une future version anglaise.
ÉCRANS À CONSTRUIRE
Page d’accueil présentant Weechat.
Connexion.
Inscription.
Récupération du mot de passe.
Tableau de bord utilisateur avec solde de crédits.
Achat de crédits avec plusieurs packs fictifs.
Historique des crédits.
Paramètres du compte.
RÈGLES PRODUIT
Le système utilise des crédits/points, jamais une tarification en minutes d’appel.
Les tarifs et soldes affichés sont des exemples visuels uniquement.
Les formulaires et boutons doivent permettre une démonstration visuelle, sans créer de compte ni effectuer de paiement.
Ne prétends pas que la traduction en direct, la caméra virtuelle ou les appels fonctionnent déjà.
Présente Weechat comme une couche de communication multilingue destinée à accompagner les applications d’appel existantes, pas à les remplacer.
LIVRABLE
Construis les écrans avec une navigation de démonstration cohérente. Garde les composants faciles à transférer ultérieurement dans le dépôt GitHub existant joelkpobli/weechat. Ne modifie aucun dépôt externe et ne configure aucune intégration.
Commence par construire l’interface. Si une action exige un backend ou l’activation de Cloud, ne l’effectue pas.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://comm-connect-suite.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bb7dacc9-4318-4cf0-a3d2-21ed45c5ce4d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
