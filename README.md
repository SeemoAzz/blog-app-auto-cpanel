# Blog AdSense Builder

Application de blog flexible construite avec **Next.js 16**, un **editeur visuel drag-and-drop** (Puck), un systeme **multi-themes**, la **generation d'articles par IA** (OpenRouter) et tout ce qu'il faut pour l'**acceptation Google AdSense**.

## Fonctionnalites

- **Tableau de bord admin** protege par mot de passe.
- **Editeur visuel drag-and-drop** pour les articles ET les pages (accueil, pages secondaires, pages legales).
  - Blocs : Hero, Titre, Texte enrichi (HTML), Image, Bouton, Publicite (AdSense), Section, Colonnes, Carte, Liste d'articles, Espace, Separateur, et un bloc **Code/Embed HTML** pour ajouter n'importe quelle fonctionnalite.
- **Multi-themes** : 10 palettes de couleurs, 10 navbars, 10 footers, 10 styles de hero, 10 paires de polices, arrondis configurables, couleur principale personnalisable, avec **apercu en direct**.
- **Generation IA (OpenRouter)** : article complet (texte + images), **regeneration** de chaque section ou de chaque image, edition manuelle avant creation.
- **Mediatheque** : import manuel, images generees par IA, reutilisables partout, texte alternatif (SEO).
- **AdSense** : injection du script, blocs publicitaires placables n'importe ou, `ads.txt`, `sitemap.xml`, `robots.txt`, pages legales, banniere de consentement cookies, metadonnees SEO et donnees structurees JSON-LD.
- **Tout est aussi faisable manuellement** : l'IA est optionnelle.

## Prerequis

- Node.js 20+ (teste avec Node 24)
- npm

## Installation

```bash
npm install
cp .env.example .env   # puis edite .env
npm run db:migrate     # cree la base SQLite
npm run db:seed        # cree l'admin + du contenu de demo
npm run dev            # http://localhost:3000
```

Tableau de bord : http://localhost:3000/admin
Identifiants par defaut (definis dans `.env`) : `admin@monblog.com` / `admin1234`.

> Change `ADMIN_EMAIL`, `ADMIN_PASSWORD` et surtout `AUTH_SECRET` avant toute mise en production.

## Variables d'environnement (.env)

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Base de donnees. `file:./dev.db` (SQLite) par defaut. Pour Postgres : `postgresql://...` (change aussi `provider` dans `prisma/schema.prisma`). |
| `AUTH_SECRET` | Secret de session (min 32 caracteres). Genere : `openssl rand -base64 48`. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Compte admin cree par le seed. |
| `NEXT_PUBLIC_SITE_URL` | URL publique (SEO, sitemap, canonical). |

## Google AdSense

1. Renseigne ton identifiant editeur (`ca-pub-...`) dans **Admin > Reglages** et active AdSense.
2. Place des blocs **Publicite (AdSense)** dans tes pages/articles via l'editeur.
3. Verifie `https://ton-domaine/ads.txt`, `sitemap.xml` et `robots.txt`.
4. Assure-toi d'avoir du contenu original de qualite et les pages legales (fournies : A propos, Contact, Politique de confidentialite, Mentions legales).

## Intelligence artificielle (OpenRouter)

1. Cree une cle sur https://openrouter.ai et renseigne-la dans **Admin > Reglages**.
2. Choisis les modeles texte et image dans la meme page.
3. Utilise **Admin > Generateur IA** pour creer un article complet, puis regenere/edite chaque partie.

## Scripts

| Commande | Role |
| --- | --- |
| `npm run dev` | Serveur de developpement |
| `npm run build` | Build de production |
| `npm run start` | Demarre le serveur de production |
| `npm run db:migrate` | Applique les migrations Prisma |
| `npm run db:seed` | Remplit la base (admin + demo) |
| `npm run db:reset` | Reinitialise la base |
| `npm run db:studio` | Interface Prisma Studio |

## Deploiement sur un VPS

```bash
# Sur le serveur
git clone <ton-repo> && cd <projet>
npm ci
cp .env.example .env   # configure DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_SITE_URL...
npx prisma migrate deploy
npm run db:seed        # une seule fois
npm run build
npm run start          # ecoute sur le port 3000
```

Recommandations :

- Lance avec un gestionnaire de process, par ex. **PM2** : `pm2 start "npm run start" --name blog`.
- Place **Nginx** en reverse proxy devant le port 3000 et active HTTPS (Let's Encrypt).
- Les images uploadees sont stockees dans `public/uploads` (persistant sur le disque du serveur). Pense a les sauvegarder.
- Pour de forts volumes, migre vers PostgreSQL (change `provider` + `DATABASE_URL`, puis `prisma migrate deploy`).

Exemple de bloc Nginx :

```nginx
server {
  server_name ton-domaine.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Deploiement Namecheap + cPanel + GitHub

Pour heberger sur un hebergement Namecheap avec cPanel et synchroniser via GitHub, suivez le guide detaille :

**[DEPLOY-CPANEL.md](./DEPLOY-CPANEL.md)**

Fichiers cles deja inclus : `server.js`, `.cpanel.yml`, `scripts/cpanel-deploy.sh`.

## Stack technique

- Next.js 16 (App Router) + React 19 + TypeScript
- Prisma 6 + SQLite (portable vers PostgreSQL)
- Puck (`@puckeditor/core`) pour l'editeur visuel
- Authentification maison par cookie de session signe (JWT via `jose`) + `bcryptjs`
- `sharp` pour les dimensions d'images
- OpenRouter pour la generation de texte et d'images
