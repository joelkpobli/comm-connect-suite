# Connexion progressive à un Supabase externe — étape 1 (configuration uniquement)

## Constat
- Stack : TanStack Start v1 (React 19, Vite 8, Tailwind v4), huit écrans Weechat avec données fictives en mémoire.
- `@supabase/supabase-js` n'est **pas** installé.
- Aucune intégration Supabase/Lovable Cloud existante. Lovable Cloud ne sera **pas** activé.

## Ce que cette étape fait (et ne fait pas)
Fait : installe le client Supabase, prépare les variables d'environnement publiques, crée un module client non utilisé pour l'instant.
Ne fait pas : aucune authentification, aucune table, aucune requête, aucune modification des écrans ou des données fictives, aucune clé secrète, aucune publication, aucun accès GitHub.

## Changements proposés

1. **Installer le package** `@supabase/supabase-js` (via `bun add`).

2. **Créer `src/lib/supabase/client.ts`** (nouveau fichier, non importé par les écrans) :
   - Lit `import.meta.env.VITE_SUPABASE_URL` et `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY` (préfixe `VITE_` = valeurs publiques côté navigateur, adapté à la clé anon/publique).
   - Exporte une fonction `getSupabaseClient()` qui crée le client à la demande et renvoie `null` si les variables sont absentes — l'app continue de fonctionner en mode démo sans configuration.
   - Aucune clé secrète (service role) ne sera jamais placée ici.

3. **Créer `.env.example`** (nouveau fichier) :
   ```
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=votre-cle-publique-anon
   ```
   Documente les deux variables sans y mettre de vraies valeurs.

4. **Vérifier `.gitignore`** : confirmer que `.env` / `.env.local` sont ignorés pour que vos vraies clés locales ne soient jamais commitées (ajout des entrées si manquantes).

5. **Mettre à jour `AGENTS.md`** : une règle indiquant que le projet utilise un Supabase externe via variables `VITE_*`, sans Lovable Cloud.

## Ce que vous devrez fournir ensuite (plus tard, à votre rythme)
L'URL du projet et la clé publique (anon/publishable) de votre Supabase externe, à placer dans un fichier `.env.local` local. La clé publique est conçue pour le navigateur ; aucune clé secrète ne sera demandée pour le frontend.

## Vérification
- Build OK et tests existants toujours verts (11 tests).
- Les huit écrans restent identiques et fonctionnels en mode démo.
