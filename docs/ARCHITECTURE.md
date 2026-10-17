# Architecture actuelle

TanStack Start, React, TanStack Query, Tailwind et composants UI existants. Les huit écrans sont conservés, ainsi que la page supplémentaire de réinitialisation. Le design existant est préservé.

Supabase externe **weechat-production** est l'unique stockage. Lovable Cloud reste désactivé. Le client navigateur généré est unique. L'authentification e-mail/mot de passe conserve confirmation obligatoire et absence de Google.

Les pages privées sont sous `_authenticated`, sans rendu serveur. Les chargements profil/crédits utilisent des fonctions serveur authentifiées, des loaders et TanStack Query. `src/start.ts` conserve la protection CSRF et ajoute la transmission du jeton de session. Les fonctions limitent leurs requêtes au compte vérifié, jamais à un identifiant choisi par le navigateur.

`DemoProvider` conserve séparément les achats et échanges fictifs. Une simulation ne crédite jamais le registre réel. Langue UI et préférence vocale restent indépendantes. La langue UI est conservée localement et le formulaire Paramètres enregistre les préférences dans le profil.

Les traductions sont dans `src/lib/weechat/i18n.ts`, `ui-copy.ts`, `auth-copy.ts`, `settings-copy.ts` et `error-copy.ts`. Historique possède encore son petit ensemble de libellés local; à consolider sans changer le comportement. Le shell affiche le nom du profil et hydrate sa langue sauvegardée. Les messages généraux d'erreur/404 disposent d'un repli local sans dépendre du provider normal.