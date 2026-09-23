# Catalogue en ligne : vente en gros et en détail

Site vitrine à partager aux clients (par WhatsApp, SMS ou réseaux sociaux). Le client voit tous les
articles, classés par catégorie, avec le **prix de détail** et le **prix de gros** de chacun. Il peut
commander un article directement sur WhatsApp.

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | Le site que voient les clients |
| `admin.html` | Le **tableau de bord administrateur** : ajouter ou modifier des articles, des prix et des catégories |
| `data/catalogue.js` | Les données du catalogue en mode fichier (et la copie de secours en mode base de données) |
| `assets/js/config.js` | La connexion à la base de données : vide = mode fichier |
| `supabase/` | Le script de création de la base (`schema.sql`) et le catalogue de départ (`seed.sql`) |
| `images/` | Les photos des articles (facultatif) |
| `assets/` | Le style (CSS) et les scripts (JS) : pas besoin d'y toucher |

Le site fonctionne de deux façons :

| | **Mode fichier** (par défaut) | **Mode base de données** (recommandé) |
|---|---|---|
| Où sont les articles | `data/catalogue.js` | Supabase (base de données gratuite) |
| Tableau de bord | Sans mot de passe ; il faut télécharger le fichier puis le déposer sur GitHub | **Avec connexion** ; chaque modification est **en ligne immédiatement** |
| Photos | Déposées dans `images/` | **Envoyées depuis le téléphone** |
| Mise en place | Aucune | Environ 10 minutes (voir plus bas) |

Pour passer d'un mode à l'autre, il suffit de remplir ou de vider `assets/js/config.js`.

## Liens à envoyer aux clients

- Tout le catalogue : `https://votre-site/`
- Une seule catégorie : `https://votre-site/?cat=ciment`
  (`electromenager`, `ciment`, `electricite`, `plomberie`, `fer`, `peinture`, `quincaillerie`)
- Un article précis : bouton 🔗 sur la fiche de l'article (le lien est copié automatiquement)
- Une recherche : `https://votre-site/?q=cable`

## Tableau de bord (`admin.html`)

- **Résumé** : nombre d'articles, de catégories, d'articles en rupture et d'articles sans prix de gros.
- **Onglet Articles** : les prix (détail, gros, quantité minimum) et la disponibilité se modifient directement
  dans le tableau. « + Nouvel article » ouvre la fiche complète : nom, catégorie, description, unité, prix, photo.
  ✏️ pour modifier, ⧉ pour dupliquer, 🗑 pour supprimer.
- **Onglet Catégories** : ajouter (ex. Carrelage), renommer, changer l'icône, changer l'ordre d'affichage.
- **Onglet Boutique** : nom, numéro WhatsApp, téléphone, adresse, devise.

## Tableau de bord en ligne (mode base de données)

Mise en place, une seule fois :

1. Créer un compte et un projet gratuits sur [supabase.com](https://supabase.com).
2. **SQL Editor** : coller le contenu de `supabase/schema.sql` et cliquer sur *Run*. Faire de même avec
   `supabase/seed.sql` pour charger le catalogue de départ.
3. **Authentication → Users → Add user** : créer le compte du propriétaire (e-mail et mot de passe).
   Dans **Authentication → Sign In / Providers**, désactiver *Allow new users to sign up*.
4. Donner les droits administrateur à ce compte. Dans le **SQL Editor** :
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'email-du-proprietaire@exemple.com';
   ```
5. **Project Settings → API** : copier *Project URL* et la clé *anon / publishable* dans `assets/js/config.js`.
6. Publier le site. Le propriétaire ouvre ensuite `https://votre-site/admin.html` et se connecte.

Sécurité : tout le monde peut **lire** le catalogue, mais seuls les comptes listés dans `admins` peuvent le
**modifier**. Ces règles sont appliquées par la base elle-même (RLS), pas seulement par la page. La clé
*anon* peut donc être publique sans risque. Ne jamais mettre la clé *service_role* dans le site.

Si la base est injoignable, la vitrine affiche la copie de `data/catalogue.js` au lieu d'une page vide.
Pour régénérer `seed.sql` à partir de `data/catalogue.js` : `node outils/generer-seed.js`.

## Mettre à jour les articles et les prix (mode fichier)

1. Ouvrir `admin.html` (en local ou sur le site en ligne).
2. Modifier les éléments voulus :
   - **Prix** et **disponibilité** : directement dans le tableau.
   - **Article** : bouton « + Nouvel article », ✏️ pour le modifier, ⧉ pour le dupliquer, 🗑 pour le supprimer.
   - **Catégories** : les ajouter, les renommer, changer l'icône ou l'ordre d'affichage.
   - **Informations de la boutique** : nom, numéro WhatsApp, téléphone, adresse.
3. Cliquer sur **« Télécharger catalogue.js »**.
4. Remplacer le fichier `data/catalogue.js` par celui qui vient d'être téléchargé :
   - **sur GitHub** : ouvrir `data/` → *Add file* → *Upload files* → glisser `catalogue.js` → *Commit* ;
   - le site se met à jour tout seul en 1 à 2 minutes s'il est hébergé sur Vercel, Netlify ou GitHub Pages.

Les modifications en cours sont gardées dans le navigateur jusqu'à la publication. On peut donc
fermer la page et y revenir plus tard. Le bouton « Tout annuler » revient au catalogue publié.

La date « Prix mis à jour le… » en bas du site change toute seule à chaque export.

### Ajouter une photo à un article

Déposer la photo dans `images/` (par exemple `images/frigo-200l.jpg`, idéalement moins de 300 Ko), puis
indiquer `images/frigo-200l.jpg` dans le champ « Photo » de l'article. Un lien internet vers une
image fonctionne aussi. Sans photo, l'icône de la catégorie s'affiche.

## Mettre le site en ligne (gratuit)

- **Vercel** ou **Netlify** : importer ce dépôt GitHub, sans aucun réglage (site statique).
- **GitHub Pages** : *Settings* → *Pages* → *Branch : main* / *root*.

Un nom de domaine personnalisé (ex. `ets-serge.com`) peut ensuite être branché depuis l'hébergeur.

> ⚠️ En mode fichier, `admin.html` ne publie rien toute seule : elle produit seulement un fichier. Seule une
> personne qui a accès au dépôt GitHub peut modifier le site en ligne. En mode base de données,
> un mot de passe administrateur est exigé.

## À personnaliser avant la mise en ligne

Les données actuelles sont **des exemples**. Dans `admin.html`, remplacer :
- le nom de la boutique, le **numéro WhatsApp** (format international sans `+`, ex. `22997000000`), le téléphone et l'adresse ;
- les articles et les prix.

Les couleurs du site se changent en haut de `assets/css/style.css` (variables `--primaire`, etc.).
