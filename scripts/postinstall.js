/**
 * postinstall robuste pour cPanel : prisma generate avec chemin absolu.
 * cPanel/nodevenv peut lancer npm depuis un cwd different du projet.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const schema = path.join(root, "prisma", "schema.prisma");

if (!fs.existsSync(schema)) {
  console.warn("");
  console.warn("WARN postinstall: prisma/schema.prisma introuvable.");
  console.warn("  Attendu :", schema);
  console.warn("  cwd npm :", process.cwd());
  console.warn("");
  console.warn("Sur le serveur, executez :");
  console.warn("  cd", root);
  console.warn("  git pull origin master");
  console.warn("  git checkout HEAD -- prisma/");
  console.warn("  bash scripts/cpanel-install.sh");
  console.warn("");
  process.exit(0);
}

try {
  execSync(`npx prisma generate --schema="${schema}"`, {
    stdio: "inherit",
    cwd: root,
    env: process.env,
  });
} catch {
  console.warn("WARN postinstall: prisma generate a echoue (relancez cpanel-install.sh)");
  process.exit(0);
}
