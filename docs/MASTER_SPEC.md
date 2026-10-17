# WEECHAT — DIRECTIVE MAÎTRESSE D'EXÉCUTION AUTONOME
## Construction complète du produit, validation fonctionnelle et préparation à la production

**Version : 2.0 — Directive principale du projet**

Tu es responsable de l'implémentation technique complète de Weechat dans le projet Lovable actuel. Tu dois poursuivre le travail existant jusqu'à obtenir une application aussi complète, fonctionnelle, sécurisée et prête pour la production que le permettent les outils, les services et les autorisations disponibles.

Tu ne dois pas te limiter à conseiller, planifier, auditer ou proposer des améliorations. Tu dois effectivement réaliser les modifications, créer les éléments nécessaires, tester le résultat, corriger les problèmes et poursuivre le développement.

Le document maître de Weechat et cette directive définissent le périmètre du produit. Toutes les décisions techniques doivent respecter ces instructions.

---

# PARTIE I — MÉMOIRE ET INSTRUCTIONS PERMANENTES DU PROJET

## 1. Enregistrer les instructions durablement

Avant de poursuivre le développement :

1. Consulte toutes les instructions, documentations, fichiers, décisions et fonctionnalités déjà présentes dans le projet.
2. Recherche les mécanismes disponibles dans Lovable pour conserver des instructions persistantes : Project Knowledge, Project Rules, instructions du projet, Skills ou fonctionnalités équivalentes.
3. Enregistre les règles essentielles de cette directive dans les emplacements persistants appropriés, s'ils existent.
4. Enregistre le document maître complet dans les fichiers de documentation du projet.
5. Crée ou actualise une documentation technique qui conserve l'état réel de l'implémentation, les décisions prises, les tests effectués et les limitations connues.
6. Vérifie que les consignes enregistrées sont cohérentes entre elles.

Ne te contente pas d'affirmer que les instructions sont mémorisées. Vérifie qu'elles ont réellement été enregistrées.

Si aucun mécanisme persistant approprié n'est disponible, conserve les consignes dans les fichiers du projet et indique cette limitation dans le rapport final.

Les règles durables doivent rappeler notamment :

- Weechat utilise le projet Supabase externe `weechat-production`.
- Lovable Cloud ne doit jamais être activé.
- Aucune autre base de données ne doit être créée.
- Les fonctionnalités doivent être réellement implémentées et testées.
- Chaque fonctionnalité doit être terminée avant de passer à la suivante.
- Les secrets ne doivent jamais être exposés au frontend.
- Le système commercial repose sur des crédits, et non sur une tarification en minutes d'appel.
- L'interface doit être disponible en français et en anglais au minimum.
- Les fonctionnalités audio, vidéo et de traduction doivent être décrites selon leur niveau réel de validation.

Conserve ces règles pendant toutes les phases du projet et consulte-les avant toute décision technique importante.

## 2. Ne pas repartir de zéro

Le projet contient déjà huit écrans de démonstration, une connexion au projet Supabase externe et une première implémentation de l'authentification.

Ces éléments doivent être inspectés et conservés lorsqu'ils sont corrects.

L'état annoncé précédemment comprend :

- huit écrans initiaux ;
- Supabase externe `weechat-production` ;
- inscription par e-mail avec confirmation obligatoire ;
- connexion par e-mail et mot de passe, sans Google ;
- récupération et réinitialisation du mot de passe ;
- déconnexion ;
- protection des pages privées ;
- tables de profils et de rôles ;
- douze tests annoncés comme réussis.

Ce sont des éléments à vérifier dans le code et la configuration réels, et non des garanties définitives.

Ne réécris pas les fonctionnalités existantes uniquement pour suivre une nouvelle méthode. Corrige-les ou complète-les lorsqu'une amélioration est nécessaire.

---

# PARTIE II — OBJECTIF COMPLET DE WEECHAT

## 3. Vision du produit

Weechat est une solution de communication multilingue conçue pour faciliter les conversations entre des personnes qui ne parlent pas la même langue.

Le produit doit progressivement permettre à un utilisateur de choisir une représentation visuelle autorisée, telle qu'un avatar ou une photo, et d'utiliser des fonctions de traduction vocale, de synthèse vocale et de représentation vidéo lorsque les technologies nécessaires sont réellement intégrées.

Weechat est une couche complémentaire aux applications de communication existantes, et non un remplacement de WhatsApp, Messenger ou d'autres services d'appel.

L'objectif est de construire un véritable produit commercialisable, pas seulement une maquette visuelle.

## 4. Objectifs fonctionnels

Le produit final doit disposer de :

- une interface professionnelle et responsive ;
- une interface française et anglaise complète ;
- une authentification fonctionnelle ;
- des profils utilisateur ;
- des autorisations correctement sécurisées ;
- un tableau de bord personnalisé ;
- un système réel de crédits ;
- un historique fiable des mouvements de crédits ;
- une architecture sécurisée pour les achats ;
- des paramètres utilisateur ;
- une gestion cohérente des langues ;
- les fonctions de communication effectivement implémentées ;
- les intégrations techniques nécessaires aux fonctions audio et vidéo retenues ;
- une gestion des erreurs et des états de chargement ;
- des tests automatisés et des vérifications manuelles pertinentes ;
- une documentation et une procédure de déploiement.

Ne déclare pas le produit complet tant que des fonctions essentielles annoncées restent fictives.

---

# PARTIE III — ARCHITECTURE ET CONTRAINTES ABSOLUES

## 5. Architecture autorisée

### Frontend

Continuer dans le projet Lovable actuel.

Conserver les huit écrans existants, le design et les composants utiles. Créer de nouveaux écrans lorsque les parcours utilisateurs l'exigent.

### Backend

Utiliser exclusivement le projet Supabase externe existant `weechat-production`.

Supabase doit fournir les services nécessaires à l'authentification, aux données persistantes et aux autorisations.

### Interdictions

- Ne jamais activer Lovable Cloud.
- Ne jamais créer un autre projet Supabase.
- Ne jamais créer une base alternative pour contourner un problème.
- Ne jamais connecter un autre projet Supabase.
- Ne pas modifier les autres applications de l'utilisateur.
- Ne pas exposer de clés secrètes dans le frontend.
- Ne pas supprimer des données ou des fonctions existantes sans nécessité démontrée.
- Ne pas effectuer de dépense ou d'opération irréversible sans l'autorisation nécessaire.
- Ne pas inventer de résultats de tests.
- Ne pas masquer les limitations d'une fonctionnalité.
- Ne pas utiliser des données fictives comme si elles étaient des données de production.

Si une intégration nécessite une fonction backend ou un mécanisme serveur, utilise une solution compatible avec le projet Supabase externe, sans activer Lovable Cloud.

---

# PARTIE IV — MÉTHODE DE TRAVAIL OBLIGATOIRE

## 6. Exécuter réellement, ne pas simplement proposer

Tu dois commencer par inspecter l'état actuel du projet, puis poursuivre immédiatement l'implémentation.

Ne t'arrête pas à un plan de travail.

Ne demande pas une nouvelle validation humaine pour chaque petite modification réversible.

Prends les décisions techniques ordinaires qui respectent cette directive. Si plusieurs solutions sont possibles, choisis la plus fiable, maintenable et sécurisée, en tenant compte du code déjà présent.

## 7. Cycle obligatoire pour chaque fonctionnalité

Pour chaque fonctionnalité, applique ce cycle :

**Étape A — Inspecter**

Examine le code, les composants, les dépendances, les données, les règles de sécurité et les tests existants.

**Étape B — Implémenter**

Construis la fonctionnalité réelle, y compris les états de chargement, les erreurs, les validations et les interactions nécessaires.

**Étape C — Tester**

Exécute les tests pertinents et vérifie le fonctionnement réel dans les limites de l'environnement disponible.

**Étape D — Corriger**

Corrige les erreurs de compilation, les erreurs d'exécution, les problèmes de données, les problèmes d'autorisation et les régressions.

**Étape E — Valider**

Vérifie que la fonctionnalité répond aux critères d'acceptation définis pour elle.

**Étape F — Documenter**

Consigne ce qui a été réellement construit, les tests exécutés et les limitations éventuelles.

**Étape G — Continuer**

Passe à la fonctionnalité suivante uniquement après avoir validé la précédente dans les limites des tests possibles.

Si un test dépend d'un service externe indisponible, réalise tous les tests indépendants possibles, documente précisément le blocage et poursuis les autres travaux sans prétendre que la validation complète est acquise.

## 8. Continuité du travail

Continue à travailler de manière autonome tant que des tâches utiles peuvent être exécutées dans l'environnement disponible.

Ne termine pas la session simplement parce que le plan a été présenté, que quelques écrans ont été modifiés ou que le build fonctionne.

Lorsque l'environnement impose une limite de durée, de quota ou de session, termine le lot en cours autant que possible, enregistre l'état du projet et indique clairement la prochaine action nécessaire pour reprendre.

Ne prétends pas pouvoir travailler en arrière-plan après la fin d'une session si l'environnement ne le permet pas.

## 9. Gestion des blocages

Lorsqu'un blocage survient :

1. Identifie sa cause exacte.
2. Vérifie si une solution sûre et compatible existe.
3. Continue les travaux indépendants.
4. Documente ce qui manque.
5. Demande une intervention humaine uniquement lorsque cela est indispensable.

Les blocages légitimes comprennent notamment :

- une clé secrète ou un identifiant de service absent ;
- une configuration nécessitant une action du propriétaire ;
- une dépense ou une souscription ;
- une action irréversible ;
- une validation légale ou commerciale ;
- un service ou un appareil indispensable inaccessible.

Ne bloque pas le développement pour des détails techniques ordinaires pouvant être résolus de manière sûre.

---

# PARTIE V — INTERFACE ET PARCOURS UTILISATEURS

## 10. Identité visuelle

Conserver le design premium existant :

- fond bleu nuit `#070B12` ;
- bleu électrique `#19B5FE` ;
- typographie Inter ou équivalente ;
- logo Weechat avec monogramme W ;
- interface responsive ;
- textes courts ;
- composants cohérents ;
- états de chargement, succès, erreur, absence de données et accès refusé.

Ne refais pas le design sans nécessité. Améliore-le de manière cohérente avec l'identité déjà définie.

## 11. Écrans existants et nouveaux écrans nécessaires

Vérifie et complète les huit écrans :

1. Accueil et présentation du produit.
2. Connexion.
3. Inscription.
4. Récupération et réinitialisation du mot de passe.
5. Tableau de bord.
6. Achat de crédits.
7. Historique des crédits.
8. Paramètres du compte.

Ajoute les écrans complémentaires indispensables au fonctionnement réel : confirmation d'e-mail, onboarding, sélection des langues, réglages de communication, consentement, gestion des permissions, erreurs de paiement et autres parcours nécessaires.

Chaque écran doit disposer d'une navigation fonctionnelle, d'états cohérents et de données appropriées.

Les actions principales ne doivent pas être de simples boutons décoratifs.

---

# PARTIE VI — AUTHENTIFICATION ET SÉCURITÉ

## 12. Authentification

Termine et teste :

- l'inscription ;
- la confirmation obligatoire de l'e-mail ;
- la connexion par e-mail et mot de passe ;
- la déconnexion ;
- la récupération du mot de passe ;
- la définition d'un nouveau mot de passe ;
- la gestion des sessions ;
- les redirections après authentification ;
- la protection des pages privées ;
- les messages d'erreur en français et en anglais.

Configure les URL de redirection de Supabase pour les environnements concernés.

N'ajoute pas la connexion Google.

## 13. Profils et rôles

Vérifie les tables `profils` et `rôles`, leurs relations et leurs politiques RLS.

Un utilisateur ne doit pouvoir lire et modifier que les données qui lui appartiennent.

Un utilisateur ordinaire ne doit jamais pouvoir s'attribuer un rôle privilégié ou contourner une autorisation en manipulant le frontend.

Les décisions de sécurité doivent être appliquées côté serveur ou dans les politiques RLS.

Teste les accès croisés entre deux utilisateurs, les accès non authentifiés et les tentatives de modification non autorisées.

Examine les alertes de sécurité existantes et corrige les problèmes confirmés sans affaiblir les protections.

---

# PARTIE VII — INTERNATIONALISATION

## 14. Interface française et anglaise

L'ensemble de l'interface doit fonctionner en français et en anglais.

Cela inclut :

- les menus ;
- les boutons ;
- les formulaires ;
- les validations ;
- les messages d'erreur ;
- les notifications ;
- les états vides ;
- les pages d'authentification ;
- les crédits et l'historique ;
- les paramètres ;
- les écrans de communication.

Centralise les traductions au lieu de disperser des textes codés en dur dans les composants.

Permets à l'utilisateur de changer de langue et conserve sa préférence.

Teste chaque parcours important dans les deux langues.

## 15. Langues de traduction vocale

Prépare l'architecture pour les langues vocales prévues : français, anglais, espagnol, allemand et portugais.

L'internationalisation de l'interface et la traduction de la parole sont deux fonctions distinctes.

Ne déclare pas une langue vocalement prise en charge avant d'avoir vérifié la compatibilité des services choisis et testé le parcours correspondant.

---

# PARTIE VIII — CRÉDITS ET HISTORIQUE

## 16. Modèle économique

Weechat utilise un système de crédits ou de points.

La facturation commerciale ne doit pas être présentée comme une facturation en minutes d'appel.

Construis un système comprenant :

- le solde réel ;
- les crédits acquis ;
- les crédits consommés ;
- les éventuels ajustements autorisés ;
- un historique consultable ;
- des références de transaction ;
- des dates et des motifs ;
- la gestion des erreurs et des opérations répétées.

## 17. Intégrité du solde

Le navigateur ne doit jamais pouvoir décider seul du montant du solde.

Implémente un registre fiable des mouvements, avec des opérations atomiques ou un mécanisme serveur équivalent, des contrôles contre les doublons et des autorisations strictes.

Le solde et l'historique doivent être cohérents.

Teste notamment :

- un crédit ajouté ;
- une consommation ;
- deux demandes identiques ;
- une opération refusée ;
- un solde insuffisant ;
- un accès depuis un autre compte ;
- une interruption pendant une opération.

Ne remplace pas les données fictives avant que les données réelles et leur gestion soient correctement implémentées.

Les packs et les tarifs restent configurables. N'invente pas les prix définitifs.

---

# PARTIE IX — ACHATS ET PAIEMENTS

## 18. Architecture des achats

Construis une architecture compatible avec un fournisseur de paiement approprié.

Avant de retenir un fournisseur, examine les exigences techniques, les pays pris en charge, les devises, les frais et les moyens de paiement disponibles.

Ne présume pas qu'un service est accessible au compte de l'utilisateur sans vérification.

Les clés secrètes doivent rester côté serveur.

La validation d'un paiement doit reposer sur un mécanisme fiable, tel qu'un webhook signé ou une vérification serveur appropriée.

Prévois :

- les paiements réussis ;
- les paiements refusés ;
- les retours de paiement ;
- les notifications fiables ;
- les demandes répétées ;
- les remboursements ;
- la réconciliation des crédits ;
- la protection contre l'attribution de crédits multiples pour un seul paiement.

N'active pas les paiements réels avec des tarifs fictifs ou sans les identifiants nécessaires.

Si des informations commerciales manquent, prépare tout ce qui peut l'être sans inventer ces informations.

---

# PARTIE X — COMMUNICATION, AUDIO ET VIDÉO

## 19. Traduction vocale

Construis et teste progressivement les modules nécessaires :

- capture du microphone ;
- reconnaissance vocale ;
- traduction ;
- synthèse vocale ;
- gestion des langues source et cible ;
- interruptions et reprise de la parole ;
- erreurs réseau ;
- gestion de la latence ;
- choix de la voix ;
- gestion des périphériques audio.

Ne substitue pas une liste de phrases prédéfinies à une véritable reconnaissance ou traduction générale.

Si un fournisseur externe est nécessaire, vérifie sa compatibilité et prépare son intégration. Ne prétends pas que le service fonctionne sans test.

## 20. Avatar, photo et caméra virtuelle

Construis les fonctions prévues dans la mesure où elles sont techniquement réalisables :

- sélection d'un avatar ou d'une photo autorisée ;
- animation de l'avatar ;
- suivi des mouvements ;
- synchronisation labiale ;
- gestion des expressions ;
- sortie vidéo ;
- caméra virtuelle ;
- intégration aux applications externes compatibles.

Distingue clairement les fonctions opérationnelles, partielles, expérimentales et non disponibles.

Teste les intégrations sur les environnements réellement pris en charge. Un aperçu dans le navigateur ne prouve pas qu'une caméra virtuelle fonctionne dans une application Windows externe.

Respecte le consentement relatif aux images et aux voix et les règles de prévention de l'usurpation d'identité.

---

# PARTIE XI — CONFIGURATION ET ENVIRONNEMENT

## 21. Variables et secrets

Centralise les variables d'environnement.

Les clés publiques explicitement conçues pour le frontend peuvent y être utilisées avec les règles RLS appropriées.

Ne jamais exposer :

- les mots de passe de base ;
- les clés `service_role` ;
- les clés secrètes de paiement ;
- les clés privées des fournisseurs ;
- les secrets SMTP.

Vérifie que les fichiers contenant des secrets ne sont pas ajoutés au dépôt.

Documente les variables nécessaires sans inclure de vraies valeurs secrètes.

## 22. Supabase et migrations

Inspecte le schéma existant avant chaque modification.

Prépare des migrations cohérentes, révisables et compatibles avec le projet externe `weechat-production`.

Vérifie les politiques RLS et les contraintes avant de rendre une nouvelle table accessible à l'application.

N'exécute pas de suppression destructive pour simplifier une migration.

Conserve une trace des modifications de schéma et des procédures de retour arrière appropriées.

---

# PARTIE XII — TESTS ET VALIDATION

## 23. Tests frontend

Vérifie :

- les huit écrans existants ;
- les nouveaux écrans ;
- la navigation ;
- les formulaires ;
- les états de chargement ;
- les messages d'erreur ;
- la version mobile et la version desktop ;
- les deux langues ;
- les données affichées ;
- l'absence de régression.

## 24. Tests backend et sécurité

Vérifie :

- les permissions ;
- les politiques RLS ;
- les accès entre comptes ;
- les fonctions privilégiées ;
- les sessions ;
- les règles relatives aux rôles ;
- les opérations sur les crédits ;
- les paiements ;
- l'absence de secrets dans le frontend.

## 25. Tests de bout en bout

Teste les parcours utilisateur critiques avec des comptes et des données de test appropriés.

Utilise des tests automatisés et, lorsque nécessaire, des vérifications manuelles.

Ne te limite pas aux tests unitaires ou à la compilation.

Lorsqu'un test réel dépend d'une boîte mail, d'un appareil physique, d'une caméra virtuelle ou d'un fournisseur externe inaccessible, identifie précisément ce qui n'a pas été validé.

Ne marque pas une fonctionnalité comme terminée si son test critique échoue.

## 26. Corriger avant de poursuivre

Lorsqu'un test échoue :

1. identifie la cause ;
2. corrige le problème ;
3. relance le test ;
4. vérifie les régressions ;
5. documente le résultat.

Ne laisse pas volontairement des erreurs connues dans les fonctionnalités critiques pour déclarer le lot terminé.

Si un problème externe ne peut pas être corrigé depuis l'environnement actuel, documente-le et poursuis les travaux indépendants.

---

# PARTIE XIII — PRÉPARATION À LA PRODUCTION

## 27. Exigences de production

Prépare et vérifie :

- la configuration de production ;
- les URL d'authentification ;
- le domaine et HTTPS ;
- l'envoi d'e-mails ;
- les variables d'environnement ;
- les règles RLS ;
- la gestion des erreurs ;
- les journaux utiles ;
- les migrations ;
- les sauvegardes ;
- la procédure de déploiement ;
- les tests de régression ;
- la procédure de retour arrière.

Ne publie pas automatiquement si l'action nécessite une autorisation explicite ou risque d'affecter des utilisateurs réels.

## 28. Critères de fin

Le projet ne peut être déclaré prêt pour la production que lorsque :

- les fonctions annoncées sont réellement implémentées ;
- les parcours critiques ont été testés ;
- les erreurs bloquantes sont corrigées ;
- les données sont correctement protégées ;
- les crédits sont gérés côté serveur ;
- les paiements, s'ils sont activés, sont vérifiés de manière fiable ;
- la configuration de production est validée ;
- les limitations restantes sont documentées ;
- les intégrations audio, vidéo et traduction sont décrites honnêtement selon leur niveau de validation.

Si certaines fonctions dépendent d'un service ou d'un appareil inaccessible, indique précisément les tests qui restent à effectuer et les conséquences pour la mise en production.

---

# PARTIE XIV — DOCUMENTATION VIVANTE

## 29. Maintenir la documentation

Crée ou actualise les fichiers documentaires adaptés à la structure du projet, notamment :

- `docs/MASTER_SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/SECURITY.md`
- `docs/TESTING.md`
- `docs/DEPLOYMENT.md`
- `docs/KNOWN_LIMITATIONS.md`

Ne crée pas de doublons inutiles si des documents équivalents existent déjà.

Après chaque lot validé, actualise la documentation correspondante et les instructions persistantes lorsque cela est approprié.

La documentation doit refléter le code réel et non un état souhaité.

---

# PARTIE XV — RAPPORT FINAL ET CONTINUITÉ

## 30. Rapport de chaque lot

À la fin de chaque lot cohérent, consigne brièvement :

- ce qui a été construit ;
- les fichiers et composants concernés ;
- les migrations effectuées ;
- les tests réellement exécutés ;
- les résultats ;
- les problèmes corrigés ;
- les limitations restantes.

Ne demande pas à l'utilisateur de valider chaque lot. Continue automatiquement lorsque les critères sont satisfaits.

## 31. Rapport final du projet

Lorsque tous les travaux réalisables ont été terminés, fournis un rapport comprenant :

1. Les fonctionnalités réellement terminées.
2. Les écrans créés ou modifiés.
3. Les tables et règles de sécurité concernées.
4. Les intégrations externes effectivement validées.
5. Les tests exécutés et leurs résultats.
6. Les défauts corrigés.
7. Les éventuelles alertes de sécurité restantes.
8. Les variables ou identifiants encore nécessaires.
9. Les actions manuelles indispensables.
10. Les limitations connues.
11. La procédure exacte de déploiement.
12. Un verdict argumenté sur l'état réel de préparation à la production.

Ne déclare pas le projet entièrement prêt si des fonctions essentielles sont simulées, si des tests critiques échouent ou si des autorisations indispensables manquent.

---

# ORDRE D'EXÉCUTION IMMÉDIAT

Commence maintenant.

1. Lis cette directive, le document maître et toute la documentation existante.
2. Enregistre les instructions persistantes dans les fonctionnalités disponibles.
3. Inspecte l'état réel du projet.
4. Identifie la première fonctionnalité incomplète ou non validée.
5. Implémente-la, teste-la et corrige ses erreurs.
6. Passe ensuite à la fonctionnalité suivante.
7. Continue selon cette méthode jusqu'à ce que toutes les tâches réalisables soient terminées ou que de véritables blocages externes subsistent.

**Ne t'arrête pas à un plan. Ne recommence pas ce qui fonctionne déjà. Ne demande pas de validation pour chaque petite tâche. Construis, teste, corrige, valide et continue.**

L'objectif final est un Weechat complet, cohérent, sécurisé, documenté et réellement déployable, dans les limites des services, autorisations et capacités disponibles.