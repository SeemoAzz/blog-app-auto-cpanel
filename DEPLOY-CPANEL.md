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

## Etape 3 — Configurer ce projet (cpanel.config)

Chaque instance du blog (blog2, blog3, recettes, sante, etc.) a son propre domaine et sa propre base SQLite.

Dans le **Terminal cPanel**, a la racine du depot :

```bash
cp cpanel.config.example cpanel.config
nano cpanel.config   # ou vi
```

Exemple pour un blog recettes :

```bash
CPANEL_SITE_URL="https://recettes.arasnews.com"
CPANEL_BLOGDATA_DIR="blogdata_recipe"
CPANEL_DB_FILENAME="prod.db"
```

Exemple pour un blog sante :

```bash
CPANEL_SITE_URL="https://sante.arasnews.com"
CPANEL_BLOGDATA_DIR="blogdata_health"
CPANEL_DB_FILENAME="prod.db"
```

Le script `cpanel-install.sh` cree automatiquement le dossier (`~/blogdata_recipe`, etc.) et utilise la bonne base pour les migrations.

---

## Etape 4 — Creer la base de donnees

### Option A — SQLite (simple, ideal pour demarrer)

Le dossier est cree par `cpanel-install.sh` a partir de `cpanel.config`.
Vous pouvez aussi le creer manuellement :

```bash
mkdir -p ~/blogdata_recipe
chmod 750 ~/blogdata_recipe
```

La valeur `DATABASE_URL` correspondante (generee automatiquement) :

```
DATABASE_URL="file:/home/VOTRE_USER/blogdata_recipe/prod.db"
```

### Option B — MySQL (recommande pour la production)

1. cPanel > **MySQL Databases**
2. Creez une base (ex. `VOTRE_USER_blog`)
3. Creez un utilisateur avec tous les privileges sur cette base
4. Notez : hote `localhost`, port `3306`
5. Dans `prisma/schema.prisma`, changez `provider = "sqlite"` en `provider = "mysql"`
6. Poussez sur GitHub, puis sur le serveur : `npx prisma migrate deploy`

---

## Etape 5 — Configurer l'application Node.js

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
| `DATABASE_URL` | Identique a `cpanel.config` (ex. `file:/home/VOTRE_USER/blogdata_recipe/prod.db`) |
| `AUTH_SECRET` | une valeur aleatoire de 48+ caracteres |
| `NEXT_PUBLIC_SITE_URL` | Identique a `CPANEL_SITE_URL` dans `cpanel.config` |
| `ADMIN_EMAIL` | email admin |
| `ADMIN_PASSWORD` | mot de passe admin (pour le seed) |

> Generez `AUTH_SECRET` : `openssl rand -base64 48`

5. Cliquez **Create**

---

## Etape 6 — Premier deploiement

Dans le **Terminal cPanel**, utilisez la commande d'activation affichee en haut de **Setup Node.js App**, puis :

```bash
# Exemple (adaptez selon ce que cPanel affiche) :
source /home/araszfcr/nodevenv/blog2/blog-app-auto-cpanel/20/bin/activate
cd /home/araszfcr/blog2/blog-app-auto-cpanel

bash scripts/cpanel-install.sh
```

Ce script fait tout automatiquement : `npm install`, `prisma generate`, migrations, seed, build.

> **Ne cliquez PAS sur "START APP" avant d'avoir lance ce script.** Sinon vous obtiendrez une erreur Prisma (`prisma/bui...`).

Puis dans **Setup Node.js App** : cliquez **Restart** (pas START si deja configure).

---

## Etape 7 — Verifier le site

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
   - `npm install`
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
├── blogdata_recipe/         ← base SQLite blog recettes (exemple)
│   └── prod.db
├── blogdata_health/         ← base SQLite blog sante (exemple)
│   └── prod.db
└── public_html/             ← gere par le proxy Node.js (ne pas y copier le code)
```

---

## Depannage

### Erreur `node_modules/.bin/prisma: No such file or directory`

cPanel cree souvent un `node_modules` incomplet (symlink nodevenv ou **Run NPM Install** sans devDependencies). `npm install` peut alors afficher *up to date* sans installer Prisma.

Dans le Terminal cPanel (avec le venv active) :

```bash
source /home/araszfcr/nodevenv/blog2/blog-app-auto-cpanel/20/bin/activate
cd /home/araszfcr/blog2/blog-app-auto-cpanel

rm -rf node_modules
NODE_ENV=development npm install --include=dev
ls node_modules/.bin/prisma   # doit exister

bash scripts/cpanel-install.sh
```

> **Ne pas** cliquer sur **Run NPM Install** dans cPanel avant d'avoir lance `cpanel-install.sh` — cela recree un `node_modules` lie au nodevenv.

### Erreur `prisma/bui...` ou Prisma Client introuvable

Cette erreur signifie que l'app demarre **avant** l'installation complete. Solution :

```bash
source /home/araszfcr/nodevenv/blog2/blog-app-auto-cpanel/20/bin/activate
cd /home/araszfcr/blog2/blog-app-auto-cpanel
bash scripts/cpanel-install.sh
```

Puis **Restart** dans Setup Node.js App.

Causes frequentes :
- Clic sur **START APP** ou **Run NPM Install** sans lancer le **build** (`npm run build`)
- Dossier SQLite inexistant → verifiez `CPANEL_BLOGDATA_DIR` dans `cpanel.config`, puis relancez `cpanel-install.sh`
- Client Prisma non genere → `npx prisma generate`

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

### Erreur `EAGAIN` pendant le build (Tailwind / worker threads)

Sur hebergement mutualise (CloudLinux / cPanel), la limite de processus/threads (LVE) peut provoquer :

```
Error: EAGAIN at new Worker (node:internal/worker:...)
@tailwindcss/node/dist/index.js
```

**Cause** : Tailwind CSS v4 (`@tailwindcss/postcss`) utilise `Module.register()` qui cree des worker threads. Next.js est deja limite a 1 worker (`next.config.ts`), mais Tailwind en lance en plus.

**Ce projet** : Tailwind n'est plus utilise au build (styles en CSS custom dans `globals.css` / `admin.css`). Si vous voyez encore cette erreur apres `git pull`, relancez :

```bash
source /home/araszfcr/nodevenv/blog3/blog-app-auto-cpanel/20/bin/activate
cd /home/araszfcr/blog3/blog-app-auto-cpanel
git pull
rm -rf node_modules .next
bash scripts/cpanel-install.sh
```

Puis **Restart** dans Setup Node.js App.

### Erreur `tokio` / Prisma pendant « Collecting page data »

```
OS can't spawn worker thread: Resource temporarily unavailable (os error 11)
⨯ Next.js build worker exited with code: null and signal: SIGABRT
```

**Cause** : pendant le build, Next.js charge plusieurs pages qui importent Prisma. Sans singleton global, chaque import demarre un moteur Rust/tokio supplementaire et depasse la limite LVE cPanel.

**Correction** (deja dans le depot) : instance Prisma unique dans `src/lib/prisma.ts` + variables `UV_THREADPOOL_SIZE=1` et `TOKIO_WORKER_THREADS=1` dans `scripts/cpanel-install.sh`.

Apres `git pull` :

```bash
source /home/araszfcr/nodevenv/blog3/blog-app-auto-cpanel/20/bin/activate
cd /home/araszfcr/blog3/blog-app-auto-cpanel
git pull
rm -rf node_modules .next
bash scripts/cpanel-install.sh
```

Si l'erreur persiste, verifiez la limite : `ulimit -u`. Contactez Namecheap pour augmenter le plafond de processus LVE, ou builder en local et copier le dossier `.next` sur le serveur.

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
