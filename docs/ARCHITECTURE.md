# Architecture actuelle

TanStack Start, React, TanStack Query, Tailwind et composants UI existants. Les huit écrans sont conservés, ainsi que la page supplémentaire de réinitialisation. Le design existant est préservé.

Supabase externe **weechat-production** est l'unique stockage. Lovable Cloud reste désactivé. Le client navigateur généré est unique. L'authentification e-mail/mot de passe conserve confirmation obligatoire et absence de Google.

Les pages privées sont sous `_authenticated`, sans rendu serveur. Les chargements profil/crédits utilisent des fonctions serveur authentifiées, des loaders et TanStack Query. `src/start.ts` conserve la protection CSRF et ajoute la transmission du jeton de session. Les fonctions limitent leurs requêtes au compte vérifié, jamais à un identifiant choisi par le navigateur.

`DemoProvider` conserve séparément les achats et échanges fictifs. Une simulation ne crédite jamais le registre réel. Langue UI et préférence vocale restent indépendantes. La langue UI est conservée localement et le formulaire Paramètres enregistre les préférences dans le profil.

Les traductions sont dans `src/lib/weechat/i18n.ts`, `ui-copy.ts`, `auth-copy.ts`, `settings-copy.ts` et `error-copy.ts`. Historique possède encore son petit ensemble de libellés local; à consolider sans changer le comportement. Le shell affiche le nom du profil et hydrate sa langue sauvegardée. Les messages généraux d'erreur/404 disposent d'un repli local sans dépendre du provider normal.

## Communication locale
L'onglet Communication locale dans Paramètres possède son propre `LocalMediaSession`. Aucune nouvelle route ou base. Consentements distincts microphone/caméra/photo/avatar, conservés seulement pendant la présence dans cet écran. Les API navigateur sont appelées après action explicite, jamais au rendu serveur. Un numéro de génération invalide les réponses de permission tardives après arrêt, changement ou démontage.

Le graphe Web Audio relie source → gain → analyseur → destination MediaStream, jamais aux haut-parleurs. Niveau RMS, gain 0–2 et mute sont locaux; réduction du bruit/écho demande les capacités natives du navigateur (efficacité matérielle non certifiée). Le canvas compose initiales, photo, avatar statique ou caméra en 640×360 et fournit un flux local 15 fps lorsqu'il est pris en charge. Aucun enregistreur, stockage ou transport réseau.

La sortie canvas possède maintenant un propriétaire `LocalVideoOutput` dans `video-pipeline.ts`, arrêt idempotent et validation du track vidéo. Le cadrage est une fonction pure testée. Les interruptions mute/unmute ne sont pas assimilées à une permission refusée; ended et retrait d'un périphérique précédemment identifié arrêtent le flux et signalent la cause. Les callbacks anciens ne modifient pas une nouvelle capture. Le contexte audio suit son état réel et possède une reprise explicite après suspension ou refus de démarrage.

`communication-contracts.ts` décrit reconnaissance → texte → traduction → synthèse et animation à partir d'une image autorisée. Les interfaces seules ne constituent pas une intégration: chaque étape reste indisponible et toute initiation est refusée. Aucun moteur, téléchargement de modèle, API, licence ou service n'est supposé disponible. La reconnaissance vocale native potentiellement distante n'est pas activée sous une promesse locale.

## Paiements préparés, non activés
`payment-contracts.ts` définit seulement les exigences et interfaces futures. Aucun fournisseur choisi, compte ouvert, tarif commercial, point de paiement ou webhook créé. `initiatePayment` refuse toujours. Voir PAYMENT_ARCHITECTURE.md pour les frontières serveur et les conditions de déblocage.