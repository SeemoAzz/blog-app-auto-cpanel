/**
 * Point d'entrée pour cPanel / Namecheap (Setup Node.js App).
 * cPanel injecte automatiquement PORT et NODE_ENV=production.
 *
 * IMPORTANT : lancez d'abord `bash scripts/cpanel-install.sh` via Terminal cPanel
 * (npm install + prisma generate + build). Demarrer sans build provoque des erreurs Prisma.
 */
const { createServer } = require("http");
const { parse } = require("url");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Verifie que le build Next.js existe
const nextDir = path.join(__dirname, ".next");
if (!fs.existsSync(nextDir)) {
  console.error(
    "ERREUR: dossier .next introuvable. Lancez via Terminal cPanel :\n" +
      "  source ~/nodevenv/VOTRE_APP/20/bin/activate\n" +
      "  cd ~/VOTRE_APP\n" +
      "  bash scripts/cpanel-install.sh",
  );
  process.exit(1);
}

// Regenere le client Prisma si absent (fix erreur prisma/build sur cPanel)
const prismaClient = path.join(__dirname, "node_modules", ".prisma", "client");
if (!fs.existsSync(prismaClient)) {
  console.log("Client Prisma absent, generation en cours...");
  try {
    const prismaBin = path.join(__dirname, "node_modules", ".bin", "prisma");
    const schema = path.join(__dirname, "prisma", "schema.prisma");
    execSync(`"${prismaBin}" generate --schema="${schema}"`, {
      stdio: "inherit",
      cwd: __dirname,
    });
  } catch (err) {
    console.error("Echec prisma generate:", err.message);
    process.exit(1);
  }
}

const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev, dir: __dirname, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        await handle(req, res, parse(req.url, true));
      } catch (err) {
        console.error("Request error:", req.url, err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    }).listen(port, hostname, () => {
      console.log(`Blog ready on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start Next.js:", err);
    process.exit(1);
  });
