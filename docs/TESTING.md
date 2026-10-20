# Tests et preuves du lot

## Automatisation réellement exécutée
Résultat final exécuté: **37 tests passent**, six fichiers.
- Routage: 9 tests.
- Simulation locale et langue UI: 3 tests.
- Renvoi e-mail et compte à rebours: 2 tests.
- Isolation réelle de deux comptes: 11 tests.
- Validation profil: 3 tests.
- Registre réel: 8 tests (zéro initial; +100/-30; doublons concurrents; conflit de référence; insuffisance; opération invalide puis reprise; débits concurrents; isolation et écriture refusée; historique non modifiable).

Le neuvième test du registre vérifie l'instantané solde/historique et le refus aux visiteurs; il passe également.

Premier passage registre: 7/8; lecture anonyme non refusée. Droits hérités révoqués, nouveau passage 8/8. Les clients Supabase multiples avertissent dans les tests car chaque compte d'essai a son client isolé; l'application conserve un client navigateur unique.

## Navigateur réel
Compte d'essai confirmé créé uniquement pour tester puis supprimé:
- Connexion par formulaire et accès tableau de bord.
- Deux opérations privilégiées de test +100 et -30; affichage réel du solde **70**, reçus **100**, consommés **30**, et deux motifs dans Historique.
- Nom sauvegardé dans Paramètres puis relu après rechargement.
- UI English et langue vocale Português enregistrées puis relues après rechargement.
- Écran 390×844: menu fermé hors écran, formulaire accessible, aucun débordement horizontal.
- Aucun événement pageerror dans ce parcours. Captures revues.
- Nouveau parcours anglais: nom sauvegardé visible dans la barre latérale, aperçu de conversation clairement fictif, achat simulé sans modification du solde réel (70), historique 70/100/30 et filtre Utilisations (un mouvement).
- Quatre pages privées testées à 390×844 sans débordement; ouverture/fermeture menu vérifiée. Déconnexion, cinq pages publiques et refus d'un mauvais mot de passe en anglais vérifiés.
- Aucun événement pageerror pendant ce dernier parcours. Les nouvelles captures ont été produites mais n'étaient plus disponibles lors de leur relecture; leur validation visuelle finale n'est donc pas revendiquée.

Le test mobile a initialement montré le menu recouvrant la page. Ancrage gauche/haut de la barre fixe corrigé; vérification visuelle et géométrique repassée.

Les tests n'ont pas validé une boîte e-mail réelle, un paiement, une coupure réseau matérielle pendant commit, une caméra externe ou une traduction générale. La reprise après erreur SQL et les requêtes identiques concurrentes sont testées; cela ne remplace pas une panne réseau de bout en bout.

Commande de régression: `bunx vitest run`. Variables de test serveur: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PUBLISHABLE_KEY; ne jamais publier leurs valeurs.

## Lot communication locale
Passage global final: **63/63 tests passent, neuf fichiers**, dont les 37 régressions existantes et 26 nouveaux tests.
- 19 tests contrôle média: consentement séparé, contraintes de capture, arrêt/retrait, réponses tardives et sortie, doublons, refus, déconnexion, erreurs/absence d'API, photo bornée, RMS, gain/mute/nettoyage sans sortie haut-parleur.
- 3 tests panneau: bouton bloqué sans consentement, arrêt à la sortie, photo autorisée et blob révoqué, aucune sauvegarde média/consentement.
- 4 tests paiement: initiation interdite, désactivation inconditionnelle, prérequis manquants, devise incompatible.

Premier passage: quatre tests média ont trouvé que les DOMException n'étaient pas correctement reconnues par `instanceof Error`. Lecture défensive de `name` corrigée. Le contrôle automatique a également trouvé un accès de tableau potentiellement absent dans le test: garde ajoutée. NotSupportedError est désormais classé Indisponible plutôt qu'erreur inconnue.

Navigateur connecté, compte temporaire créé puis supprimé: consentement, capture indisponible, photo, avatar statique, retrait, arrêt après changement d'onglet Paramètres, anglais et mobile 390×844. Graphe Web Audio actif et flux canvas vidéo décodable avec signaux synthétiques injectés uniquement dans le script de test. Zéro pageerror. Captures desktop/mobile/anglais revues; aucun débordement, menu mobile fermé hors écran après fin de sa transition.

**Limite essentielle:** le getUserMedia natif de Chromium dans le sandbox a répondu NotSupportedError malgré les périphériques de test. Les flux synthétiques ne prouvent pas une permission physique ou la qualité d'un micro/caméra. Refus et reprise sont injectés pour le parcours UI. Sélection de périphérique et déconnexion sont testées via doubles, pas avec plusieurs appareils physiques. Tester le vrai micro/caméra et les refus via navigateur sur l'ordinateur cible reste indispensable.

## Poursuite autonome — nouveau contrôle
- `bunx vitest run`: **75/75 tests réussis, dix fichiers**. Les 20 tests en base externe (11 isolation + 9 registre) ont été exécutés, non ignorés. Avertissements GoTrue dus aux clients indépendants des comptes de test, pas à un nouveau client de l'application.
- 12 tests supplémentaires: mute/unmute de capture, callbacks périmés après remplacement, retrait sans ended, flux vide, vidéo 15 fps/nettoyage, rejet sortie sans track, cadrage et quatre étapes d'intégration refusées; reprise du contexte audio et gain conservé via mute dans le panneau. Nettoyage audio répété et gain non fini ajoutés au test existant.
- Navigateur natif sans flags de périphériques fictifs ni injection de flux: contexte sécurisé, getUserMedia audio et vidéo retournent **NotFoundError**. Les erreurs de capture ont donc changé avec l'environnement; ni ce résultat ni le précédent NotSupportedError ne prouvent la capture physique.
- Accueil et redirection de /parametres vers /connexion vérifiés; zéro pageerror. Un panneau monté dans un banc de test isolé sur localhost confirme « Indisponible », raison périphérique absent et « Caméra désactivée », sans initiales simulant la webcam; capture revue. Le flux canvas est une composition locale, pas une webcam.
- Aucun nouveau parcours connecté de bout en bout certifié dans ce lot: session gérée indisponible pour Supabase externe. Les preuves connectées du précédent lot restent historiques. Tests UI multimédias actuels = doubles; capture physique et qualité toujours à valider sur l'ordinateur cible.