#!/usr/bin/env node
/**
 * Guarda-rails de convenções do flux (AGENTS.md + .cursor/rules).
 * Falha com exit 1 se alguma regra for violada.
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
let falhas = 0;

function erro(mensagem) {
  console.error(`❌ ${mensagem}`);
  falhas += 1;
}

function ok(mensagem) {
  console.log(`✓ ${mensagem}`);
}

// --- arquivos obrigatórios de build ---
const obrigatorios = [
  "babel.config.js",
  "metro.config.js",
  "tailwind.config.js",
  "src/global.css",
  "nativewind-env.d.ts",
];

for (const arquivo of obrigatorios) {
  if (!existsSync(join(ROOT, arquivo))) {
    erro(`Arquivo obrigatório ausente: ${arquivo}`);
  }
}
if (falhas === 0) ok("Arquivos de build obrigatórios presentes");

// --- pasta obsoleta ---
if (existsSync(join(ROOT, "src/screens"))) {
  erro("Pasta obsoleta src/screens/ existe — use src/pages/");
}

// --- .env rastreado ---
try {
  const rastreados = execSync("git ls-files .env .env.local 2>/dev/null", {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
  if (rastreados) {
    erro(`Arquivo de ambiente rastreado no git: ${rastreados}`);
  } else {
    ok(".env não está rastreado");
  }
} catch {
  ok(".env não está rastreado");
}

// --- imports proibidos ---
function lerArquivosSrc(extensao) {
  const resultados = [];
  function walk(dir) {
    for (const nome of readdirSync(dir)) {
      const caminho = join(dir, nome);
      if (statSync(caminho).isDirectory()) {
        if (nome !== "node_modules") walk(caminho);
      } else if (caminho.endsWith(extensao)) {
        resultados.push(caminho);
      }
    }
  }
  walk(join(ROOT, "src"));
  return resultados;
}

const padroesProibidos = [
  { regex: /from\s+["']@\/screens/, msg: "Import de @/screens proibido — use @/pages" },
  { regex: /from\s+["'][^"']*\/screens\//, msg: "Import de src/screens/ proibido" },
];

for (const arquivo of [...lerArquivosSrc(".ts"), ...lerArquivosSrc(".tsx")]) {
  const conteudo = readFileSync(arquivo, "utf8");
  for (const { regex, msg } of padroesProibidos) {
    if (regex.test(conteudo)) {
      erro(`${msg} (${arquivo.replace(ROOT + "/", "")})`);
    }
  }
}
if (falhas === 0) ok("Sem imports de src/screens/");

// --- nomenclatura: .map((x) => com variável de 1 letra ---
const mapaUmaLetra = /\.map\(\s*\(\s*([a-z])\s*\)/g;
for (const arquivo of lerArquivosSrc(".ts").concat(lerArquivosSrc(".tsx"))) {
  const conteudo = readFileSync(arquivo, "utf8");
  const linhas = conteudo.split("\n");
  linhas.forEach((linha, indice) => {
    if (mapaUmaLetra.test(linha)) {
      erro(
        `Variável de uma letra em .map() — use nome descritivo (${arquivo.replace(ROOT + "/", "")}:${indice + 1})`
      );
    }
    mapaUmaLetra.lastIndex = 0;
  });
}
if (falhas === 0) ok("Nomenclatura .map() sem variáveis de uma letra");

if (falhas > 0) {
  console.error(`\n${falhas} violação(ões) de convenção.`);
  process.exit(1);
}

console.log("\nTodas as convenções verificadas.");
