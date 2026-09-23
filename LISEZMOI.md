# Catalogue en ligne : vente en gros et en détail

Site vitrine à partager aux clients (par WhatsApp, SMS ou réseaux sociaux). Le client voit tous les
articles, classés par catégorie, avec le **prix de détail** et le **prix de gros** de chacun. Il peut
commander un article directement sur WhatsApp.

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | Le site que voient les clients |
| `admin.html` | La page de gestion pour ajouter ou modifier les articles, les prix et les catégories |
| `data/catalogue.js` | **Toutes les données** : boutique, catégories, articles, prix |
| `images/` | Les photos des articles (facultatif) |
| `assets/` | Le style (CSS) et les scripts (JS) : pas besoin d'y toucher |

Il n'y a rien à installer : pas de base de données, pas de serveur ni de compilation. Le site
s'ouvre même en double-cliquant sur `index.html`.

## Liens à envoyer aux clients

- Tout le catalogue : `https://votre-site/`
- Une seule catégorie : `https://votre-site/?cat=ciment`
  (`electromenager`, `ciment`, `electricite`, `plomberie`, `fer`, `peinture`, `quincaillerie`)
- Un article précis : bouton 🔗 sur la fiche de l'article (le lien est copié automatiquement)
- Une recherche : `https://votre-site/?q=cable`

## Mettre à jour les articles et les prix

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

> ⚠️ La page `admin.html` ne publie rien toute seule : elle produit seulement un fichier. Seule une
> personne qui a accès au dépôt GitHub peut modifier le site en ligne.

## À personnaliser avant la mise en ligne

Les données actuelles sont **des exemples**. Dans `admin.html`, remplacer :
- le nom de la boutique, le **numéro WhatsApp** (format international sans `+`, ex. `22997000000`), le téléphone et l'adresse ;
- les articles et les prix.

Les couleurs du site se changent en haut de `assets/css/style.css` (variables `--primaire`, etc.).
