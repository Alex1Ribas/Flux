/**
 * Moti 0.30 importa SafeAreaView de `react-native`, o que dispara WARN de depreciação
 * ao carregar qualquer export do barrel (`import { MotiView } from "moti"`).
 * Troca para `react-native-safe-area-context` (já usado no app).
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const monorepoRoot = path.resolve(frontendRoot, "..");

function localizarMoti() {
  const candidatos = [
    path.join(frontendRoot, "node_modules/moti"),
    path.join(monorepoRoot, "node_modules/moti"),
  ];
  for (const dir of candidatos) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
  }
  try {
    const require = createRequire(path.join(frontendRoot, "package.json"));
    return path.dirname(require.resolve("moti/package.json"));
  } catch {
    return null;
  }
}

const motiRoot = localizarMoti();
if (!motiRoot) {
  console.warn("[patch-moti] moti não encontrado — pulando.");
  process.exit(0);
}

const alvos = [
  path.join(motiRoot, "build/components/safe-area-view.js"),
  path.join(motiRoot, "src/components/safe-area-view.tsx"),
];

const de = /from ['"]react-native['"]/;
const para = "from 'react-native-safe-area-context'";

let alterados = 0;
for (const arquivo of alvos) {
  if (!fs.existsSync(arquivo)) continue;
  const antes = fs.readFileSync(arquivo, "utf8");
  if (!antes.includes("SafeAreaView")) continue;
  if (antes.includes("react-native-safe-area-context")) continue;
  if (!de.test(antes)) continue;
  const depois = antes.replace(de, para);
  if (depois === antes) continue;
  fs.writeFileSync(arquivo, depois);
  alterados += 1;
  console.log(`[patch-moti] ${path.relative(frontendRoot, arquivo)}`);
}

if (alterados === 0) {
  console.log("[patch-moti] nada a alterar (já aplicado ou estrutura diferente).");
}
