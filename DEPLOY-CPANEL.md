# Deploiement Namecheap + cPanel + GitHub

Guide complet pour heberger ce blog Next.js sur un hebergement Namecheap (cPanel) en important le code depuis GitHub.

## Prerequis

- Hebergement Namecheap avec **cPanel** et **Node.js** (Stellar Plus / Stellar Business ou VPS)
- Un compte **GitHub**
- Node.js **20+** disponible dans cPanel (Setup Node.js App)
- Acces **SSH** ou **Terminal** cPanel (recommande)

> **Important** : ce projet necessite Node.js (API routes, Prisma, authentification). Un hebergement PHP seul ne suffit pas. Verifie que ton offre Namecheap inclut **Setup Node.js App** dans cPanel.

---

## Etape 1 — Pousser le projet sur GitHub

Sur votre machine locale :

```bash
cd "Blog - Cpanel git"
git init
git add .
git commit -m "Prepare deployment cPanel"
git branch -M main
git remote add origin https://github.com/VOTRE_USER/VOTRE_REPO.git
git push -u origin main
```

Fichiers deja configures pour cPanel :
- `server.js` — point d'entree de l'application Node.js
- `.cpanel.yml` — deploiement automatique apres pull GitHub
- `scripts/cpanel-deploy.sh` — install, migrations, build
- `.node-version` — Node 20

---

## Etape 2 — Cloner le depot dans cPanel

1. Connectez-vous a **cPanel** (Namecheap > Manage > cPanel)
2. Ouvrez **Git Version Control** (ou **Git™ Version Control**)
3. Cliquez **Create**
4. Renseignez :
   - **Clone URL** : `https://github.com/VOTRE_USER/VOTRE_REPO.git`
   - **Repository Path** : `/home/VOTRE_USER/blog` (hors `public_html`)
   - Cochez **Clone a Repository** si disponible
5. Pour un depot **prive**, generez une **Deploy Key** ou un **Personal Access Token** GitHub

> Gardez le depot **en dehors de `public_html`**. Seul le proxy Node.js exposera l'application.

---

## Etape 3 — Creer la base de donnees

### Option A — SQLite (simple, ideal pour demarrer)

Dans le **Terminal cPanel** :

```bash
mkdir -p ~/blogdata
chmod 750 ~/blogdata
```

Vous utiliserez :
```
DATABASE_URL="file:/home/VOTRE_USER/blogdata/prod.db"
```

### Option B — MySQL (recommande pour la production)

1. cPanel > **MySQL Databases**
2. Creez une base (ex. `VOTRE_USER_blog`)
3. Creez un utilisateur avec tous les privileges sur cette base
4. Notez : hote `localhost`, port `3306`
5. Dans `prisma/schema.prisma`, changez `provider = "sqlite"` en `provider = "mysql"`
6. Poussez sur GitHub, puis sur le serveur : `npx prisma migrate deploy`

---

## Etape 4 — Configurer l'application Node.js

1. cPanel > **Setup Node.js App** (ou **Application Manager**)
2. Cliquez **Create Application**
3. Parametres :

| Parametre | Valeur |
|-----------|--------|
| Node.js version | **20.x** |
| Application mode | **Production** |
| Application root | `/home/VOTRE_USER/blog` |
| Application URL | votre domaine (ex. `mondomaine.com`) |
| Application startup file | `server.js` |

4. Dans **Environment variables**, ajoutez :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `file:/home/VOTRE_USER/blogdata/prod.db` (ou URL MySQL) |
| `AUTH_SECRET` | une valeur aleatoire de 48+ caracteres |
| `NEXT_PUBLIC_SITE_URL` | `https://votre-domaine.com` |
| `ADMIN_EMAIL` | email admin |
| `ADMIN_PASSWORD` | mot de passe admin (pour le seed) |

> Generez `AUTH_SECRET` : `openssl rand -base64 48`

5. Cliquez **Create**

---

## Etape 5 — Premier deploiement

Dans le **Terminal cPanel** :

```bash
cd ~/blog
npm run cpanel:deploy
```

Ou etape par etape :

```bash
cd ~/blog
npm ci --omit=dev
npx prisma generate
npx prisma migrate deploy
npm run db:seed          # une seule fois : cree l'admin + contenu demo
npm run build
mkdir -p public/uploads
chmod 755 public/uploads
```

Puis dans **Setup Node.js App** : cliquez **Restart** sur votre application.

---

## Etape 6 — Verifier le site

- Site public : `https://votre-domaine.com`
- Admin : `https://votre-domaine.com/admin`
- Identifiants : ceux definis dans `ADMIN_EMAIL` / `ADMIN_PASSWORD` (seed)

Verifiez aussi :
- `https://votre-domaine.com/sitemap.xml`
- `https://votre-domaine.com/robots.txt`
- `https://votre-domaine.com/ads.txt`

---

## Mises a jour depuis GitHub

### Methode automatique (.cpanel.yml)

1. cPanel > **Git Version Control** > votre depot
2. Cliquez **Pull or Deploy** (ou **Update from Remote**)
3. Le fichier `.cpanel.yml` execute automatiquement :
   - `npm ci --omit=dev`
   - `prisma generate` + `migrate deploy`
   - `npm run build`
4. **Setup Node.js App** > **Restart**

### Methode manuelle

```bash
cd ~/blog
git pull origin main
npm run cpanel:deploy
# Puis Restart dans cPanel
```

---

## Structure des fichiers cPanel

```
/home/VOTRE_USER/
├── blog/                    ← depot Git + application Node.js
│   ├── server.js            ← demarre Next.js (cPanel pointe ici)
│   ├── .cpanel.yml          ← taches auto apres deploy Git
│   ├── scripts/cpanel-deploy.sh
│   ├── prisma/
│   ├── public/uploads/      ← images uploadees (sauvegarder !)
│   └── .next/               ← genere par npm run build
├── blogdata/
│   └── prod.db              ← base SQLite (si option A)
└── public_html/             ← gere par le proxy Node.js (ne pas y copier le code)
```

---

## Depannage

### Erreur 503 / Application ne demarre pas

- Verifiez les logs dans **Setup Node.js App** > votre app > **Open logs**
- Confirmez que `npm run build` s'est termine sans erreur
- Verifiez que `server.js` est bien le fichier de demarrage
- Redemarrez l'application

### Erreur Prisma / base de donnees

- Verifiez `DATABASE_URL` dans les variables d'environnement cPanel
- Pour SQLite : le dossier parent doit etre inscriptible (`chmod 750 ~/blogdata`)
- Relancez : `npx prisma migrate deploy`

### Images / uploads

- Le dossier `public/uploads` doit exister et etre inscriptible
- Sauvegardez ce dossier regulierement (non versionne dans Git)

### Build echoue (memoire insuffisante)

Sur certains hebergements mutualises, le build peut manquer de RAM. Solutions :
- Builder localement et pousser uniquement les artefacts (VPS)
- Passer a un VPS Namecheap
- Utiliser SSH avec : `NODE_OPTIONS="--max-old-space-size=512" npm run build`

### HTTPS

Activez **SSL/TLS** dans cPanel (Let's Encrypt gratuit) pour votre domaine.

---

## Checklist production

- [ ] `AUTH_SECRET` unique et long (48+ caracteres)
- [ ] `ADMIN_PASSWORD` change apres le premier login
- [ ] `NEXT_PUBLIC_SITE_URL` = URL HTTPS reelle
- [ ] SSL active dans cPanel
- [ ] Base de donnees sauvegardee regulierement
- [ ] Dossier `public/uploads` sauvegarde
- [ ] AdSense configure dans Admin > Reglages

---

## Scripts utiles

| Commande | Role |
|----------|------|
| `npm run cpanel:deploy` | Deploiement complet (install + migrate + build) |
| `npm run db:deploy` | Migrations Prisma uniquement |
| `npm run db:seed` | Admin + contenu demo (une fois) |
| `npm run start` | Demarre Next.js (alternative a server.js) |
