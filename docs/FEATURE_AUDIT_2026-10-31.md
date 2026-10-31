# Weechat — fonctions et limites vérifiées

## Résultat du nettoyage
- Tableau de bord : quatre fonctions, statuts explicites, vrais soldes et derniers mouvements ; aucun aperçu de conversation fictif.
- Navigation : communication, compte et ressources, aide et réglages.
- Retrait des achats fictifs, compteurs simulés, animation MediaPipe présentée comme Swap Live et ancien studio composite de la page Traduction. Le fournisseur partagé ne conserve que la langue de l’interface.
- Tutoriel : un guide par fonction, appareils, points, dépannage ; aucune détection d’installation ni pourcentage de réussite inventé.
- Accueil : descriptions des quatre fonctions et prérequis matériels corrigés. Prix existants conservés ; aucune activation de paiement.

## Fonction / outils / validation
| Fonction | Outils présents | Limite actuelle |
|---|---|---|
| Compte, profil, points | Supabase externe, fonctions authentifiées, registre propriétaire | Pages privées non vérifiées en session réelle dans ce lot : Supabase externe non géré, aucune session disponible |
| Swap Live | Python Windows, InsightFace / inswapper, ONNX Runtime, pyvirtualcam ; installateur PyInstaller/Inno Setup et Unity Capture | Le chemin `weechat_app.py` → `weechat_swap.run()` ne fait aucune authentification ni requête de points. Qualité, caméra physique et version téléchargée non validées ici. Licence commerciale des modèles à établir. Remplace le visage, pas le corps complet |
| Traduction | Palabra streaming, jeton serveur, micro navigateur, sous-titres et sortie audio | Une session micro → langue cible ; pas de capture automatique de l’interlocuteur. 48 langues configurées, pas 60 langues testées. Appels bidirectionnels, routage VB-Cable et qualité physique à valider |
| Restyle | Canvas, filtres, consentement caméra | Filtres gratuits locaux ; aucun moteur IA de prompt, de décor ou de corps. Le pont vidéo Tauri distinct ne prouve pas un lien avec le binaire Python |
| Swap Photo | Page informative | Aucun moteur/export. Aucun import demandé ni faux résultat |
| Paiements | Contrats désactivés et tarifs statiques | Aucun paiement, bonus de pack ou expiration activé |

## Points et logiciel Windows
Le site dispose de `chargeUsageBlock` authentifié, de références idempotentes et d’un tarif serveur de **2 points/s**, soit **20 points/10 s**. Cela ne protège pas un moteur local indépendant. Les affirmations antérieures selon lesquelles le téléchargement débiterait déjà les points ou serait impossible à contourner étaient incorrectes.

Pour intégrer le compagnon : établir un protocole de connexion/autorisation, autoriser chaque tranche côté serveur, renouveler avant échéance et fermer la diffusion quand l’autorisation manque. L’arrêt ne doit pas révéler automatiquement le vrai visage. Tester refus, coupure réseau, reconnexion, double requête et crash sur Windows. Un exécutable local reste modifiable : il ne faut pas promettre une protection absolue. La validation commerciale du modèle est préalable à une diffusion commerciale.

La traduction consomme le **solde audio distinct**, en tranches de 10 secondes. Le code commence le débit avant la permission micro et la connexion au fournisseur ; la tranche est donc perdue si le démarrage échoue. Ce comportement est signalé dans les guides, **non corrigé dans ce lot de présentation**. Le détail de l’historique audio manque aussi. Ne pas ouvrir la commercialisation avant correction et validation.

## Référence concurrente
Pages publiques consultées : https://www.facevo.live/ ; https://www.facevo.live/download ; https://www.facevo.live/support.
Leur présentation distingue quatre fonctions et un parcours téléchargement → installation → choix de caméra. Cela ne prouve pas leurs modèles propriétaires, hébergement ni performances. Aucune attribution de DeepFaceLive/inswapper/DirectML aux concurrents n’est validée. Weechat reprend l’organisation compréhensible, pas des promesses non testées.

## Vérifications de ce lot
- 59 tests ciblés réussis : navigation, locale, règles tarifaires, capacités, Palabra, paiements désactivés et capture locale.
- Navigateur : tutoriel FR/EN, ancres, sélection d’appli, question dépliable et absence de débordement horizontal sur petit écran ; aucune erreur JavaScript observée.
- Aucun flux payant déclenché. Aucun test Windows physique, appel externe, installation, débit desktop ou parcours membre authentifié effectué dans ce lot.

## Restant
1. Licence commerciale des modèles et validation Windows physique / caméra / appels.
2. Protocole sécurisé compte et autorisations de points du moteur Windows, puis recompilation et validation de l’installateur.
3. Correction des débits audio de démarrage et validation de sessions/routage/appels bidirectionnels.
4. Moteurs Restyle IA et Swap Photo autorisés, testés et liés au résultat facturable.
5. Paiement marchand et fulfillment vérifié avant activation ; budget zéro maintenu.