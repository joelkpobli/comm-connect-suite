# WEECHAT — Poursuite autonome du développement : capture réelle et pipeline audio/vidéo

Continue immédiatement le développement du projet Weechat existant. Ne te limite pas à proposer un plan : inspecte le code actuel, implémente les fonctionnalités réalisables, exécute les tests, corrige les erreurs et poursuis automatiquement avec les étapes suivantes.

## 1. Capture réelle du microphone et de la caméra

- Implémente et vérifie l’accès réel au microphone et à la webcam avec les API du navigateur.
- Gère les autorisations accordées ou refusées, les périphériques absents, les erreurs et les changements de périphériques.
- Affiche un aperçu vidéo réellement capturé par la webcam.
- Affiche le niveau sonore du véritable microphone.
- Permets d’activer et de désactiver chaque périphérique.
- Arrête correctement tous les flux lorsque l’utilisateur quitte l’écran ou désactive un périphérique.
- Ne remplace jamais silencieusement une capture réelle par une simulation. Si la capture est impossible, affiche clairement la raison.

## 2. Pipeline audio et vidéo

Après validation de la capture réelle, poursuis vers les fonctions audio et vidéo réellement réalisables dans l’environnement actuel.

- Prépare une architecture modulaire pour la capture audio, le traitement du son et la sortie audio.
- Prépare le pipeline vidéo pour la représentation de l’utilisateur.
- Vérifie les interruptions, les erreurs, le nettoyage des ressources et les changements d’état.
- Identifie les composants nécessaires à la reconnaissance vocale, à la traduction, à la synthèse vocale et à l’animation de l’avatar.
- Implémente les composants qui peuvent fonctionner sans service externe ni dépense.
- Si une API, une licence ou une clé est indispensable, prépare l’intégration sans inventer de clé ni prétendre que le service fonctionne.

## 3. Tests et qualité

Après chaque lot :
- Exécute les tests automatisés pertinents.
- Ajoute des tests pour les nouveaux comportements et les erreurs.
- Corrige les régressions avant de continuer.
- Distingue les tests simulés des tests réalisés avec un véritable microphone ou une véritable webcam.
- Vérifie que les fonctions déjà existantes, l’authentification, les profils, les crédits et les traductions françaises et anglaises ne sont pas cassés.

## 4. Sécurité et production

- Audite les alertes de sécurité existantes, les politiques RLS et l’isolation des comptes.
- Vérifie la configuration nécessaire à la mise en production et documente les paramètres Supabase encore manquants, notamment l’URL du site, les redirections d’authentification et le service SMTP.
- Ne déclare pas la production prête tant que les vérifications indispensables ne sont pas effectuées.

## 5. Contraintes impératives

- Utilise exclusivement le projet Supabase externe déjà connecté : `weechat-production`.
- N’active jamais Lovable Cloud.
- Ne crée aucune nouvelle base de données et ne connecte aucun autre projet Supabase.
- N’expose aucune clé secrète dans le frontend ou dans la documentation.
- N’active aucun paiement réel.
- N’invente aucun tarif, devise, pays marchand ou identifiant de service.
- Préserve les huit écrans existants et les fonctionnalités déjà construites.
- Ne demande pas ma validation pour les tâches techniques ordinaires. Continue automatiquement tant qu’aucun véritable blocage humain n’est rencontré.

## 6. Continuité du travail

Lorsque la capture réelle est implémentée et vérifiée autant que l’environnement le permet, continue vers les composants audio/vidéo suivants, puis vers les autres fonctionnalités réalisables de Weechat.

Mets à jour la documentation du projet après chaque étape importante. Si tu rencontres une limite nécessitant mon ordinateur, une clé API, une licence, une décision commerciale ou une action externe, documente précisément ce blocage et poursuis les autres tâches indépendantes.

À la fin de chaque lot, fournis un bilan précis : fonctionnalités réellement opérationnelles, fichiers modifiés, tests exécutés et résultats, limitations restantes et actions humaines indispensables.

Commence maintenant par inspecter l’implémentation existante et poursuivre directement le travail.