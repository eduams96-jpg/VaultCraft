// Gera o pacote Windows x64 (ZIP autónomo) e os SHA-256.
// Falha se encontrar dados pessoais, caminhos do programador ou a base de dados real no pacote.
import { execFileSync, execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const BS = String.fromCharCode(92); // barra invertida
const ROOT = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const NAME = `VaultCraft-${pkg.version}-win-x64`;
const RELEASE = path.join(ROOT, "release");
const STAGE = path.join(RELEASE, NAME);
const ZIP = path.join(RELEASE, `${NAME}.zip`);

const log = (m) => console.log(`\n== ${m}`);

// Só Windows x64 vai para o pacote: remove binários de outras plataformas, WebAssembly,
// motores de outras bases de dados e ficheiros temporários de geração.
const NON_WINDOWS_TOKENS = ["linux", "darwin", "freebsd", "openbsd", "sunos", "-aix", "aix-", "android", "musl", "cockroachdb", "mysql", "postgresql", "sqlserver"];
const UNUSED_FILES = ["edge.js", "wasm.js", "query_engine_bg.js", "wasm-edge-light-loader.mjs", "wasm-worker-loader.mjs"];
function pruneUnused(app) {
  let removed = 0;
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      const lower = e.name.toLowerCase();
      const unused =
        NON_WINDOWS_TOKENS.some((t) => lower.includes(t)) ||
        lower.endsWith(".wasm") || lower.includes("wasm-base64") || lower.includes(".tmp") ||
        lower.endsWith(".so") || lower.endsWith(".so.node") || lower.endsWith(".dylib") ||
        UNUSED_FILES.includes(lower);
      if (unused) {
        fs.rmSync(full, { recursive: true, force: true });
        removed++;
      } else if (e.isDirectory()) {
        walk(full);
      }
    }
  })(app);
  console.log(`Removidos ${removed} itens não usados em Windows x64`);
}

// Remove do standalone tudo o que é do programador e substitui o caminho absoluto do projeto
function sanitizeStandalone(app, root) {
  pruneUnused(app);
  // ficheiros de configuração local e bases de dados nunca vão para o pacote
  fs.rmSync(path.join(app, ".env"), { force: true });
  fs.rmSync(path.join(app, "prisma"), { recursive: true, force: true });

  const variants = [root.split(BS).join(BS + BS), root.split(BS).join(BS), root.split(BS).join("/")];
  const codeExt = new Set([".js", ".mjs", ".cjs", ".json", ".map"]);
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (e.name.endsWith(".nft.json") || /\.db(-journal)?$/.test(e.name)) {
        // manifestos de rastreio do build (listam nomes de ficheiros do programador) e bases de dados
        fs.rmSync(full, { force: true });
      } else if (codeExt.has(path.extname(e.name).toLowerCase())) {
        let text = fs.readFileSync(full, "utf8");
        const before = text;
        for (const v of variants) text = text.split(v).join(".");
        if (text !== before) fs.writeFileSync(full, text, "utf8");
      }
    }
  })(app);
}

// 1. Build de produção (inclui lint e tipos)
log("Lint, tipos e build");
execSync("npm run lint", { stdio: "inherit" });
execSync("npx tsc --noEmit", { stdio: "inherit" });
execSync("npm run build", { stdio: "inherit" });

// 2. Base de dados modelo vazia
log("Base de dados modelo (vazia)");
execFileSync(process.execPath, [path.join(ROOT, "scripts", "build-template-db.mjs")], { stdio: "inherit" });

// 3. Montagem
log("A montar a pasta do pacote");
fs.rmSync(STAGE, { recursive: true, force: true });
fs.rmSync(ZIP, { force: true });
const app = path.join(STAGE, "app");
fs.mkdirSync(app, { recursive: true });
fs.cpSync(path.join(ROOT, ".next", "standalone"), app, { recursive: true });
fs.cpSync(path.join(ROOT, ".next", "static"), path.join(app, ".next", "static"), { recursive: true });
fs.cpSync(path.join(ROOT, "public"), path.join(app, "public"), { recursive: true });
sanitizeStandalone(app, ROOT);
fs.mkdirSync(path.join(app, "prisma"), { recursive: true });
fs.copyFileSync(path.join(RELEASE, "template", "template.db"), path.join(app, "prisma", "template.db"));
for (const f of fs.readdirSync(path.join(ROOT, "packaging", "windows"))) {
  fs.copyFileSync(path.join(ROOT, "packaging", "windows", f), path.join(STAGE, f));
}
if (fs.existsSync(path.join(ROOT, "LICENSE"))) fs.copyFileSync(path.join(ROOT, "LICENSE"), path.join(STAGE, "LICENSE.txt"));

// Runtime Node.js oficial (o mesmo binário que executa este script)
const runtime = path.join(STAGE, "runtime");
fs.mkdirSync(runtime, { recursive: true });
fs.copyFileSync(process.execPath, path.join(runtime, "node.exe"));
const nodeVersion = execFileSync(path.join(runtime, "node.exe"), ["--version"]).toString().trim();
fs.writeFileSync(
  path.join(runtime, "LICENSE-node.txt"),
  `Este pacote inclui o runtime Node.js ${nodeVersion} (https://nodejs.org), licenciado sob a licença MIT.\nTexto completo: https://github.com/nodejs/node/blob/main/LICENSE\n`
);

// 4. Verificações de privacidade (bloqueantes)
log("Verificação de dados pessoais e caminhos locais");
const forbidden = [
  ROOT, ROOT.split(BS).join("/"), ROOT.split(BS).join(BS + BS),
  // termos pessoais (nome de utilizador, e-mail, perfis) vêm de VAULTCRAFT_PRIVACY_TERMS, nunca do código
  ...(process.env.VAULTCRAFT_PRIVACY_TERMS || "").split(",").map((t) => t.trim()).filter(Boolean),
  "dev.db", "VaultCraft-Review",
];
const textExt = new Set([".js", ".mjs", ".cjs", ".json", ".html", ".txt", ".vbs", ".bat", ".css", ".map", ".md", ".svg", ".xml", ".ps1"]);
const hits = [];
(function scan(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) scan(full);
    else if (textExt.has(path.extname(e.name).toLowerCase()) || e.name.endsWith(".db")) {
      const content = fs.readFileSync(full, "utf8");
      for (const token of forbidden) if (content.includes(token)) hits.push(`${path.relative(STAGE, full)} -> "${token}"`);
    }
  }
})(STAGE);
const dbFiles = [];
(function findDb(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) findDb(full);
    else if (e.name.endsWith(".db") && e.name !== "template.db") dbFiles.push(full);
  }
})(STAGE);
if (dbFiles.length) hits.push(`bases de dados reais no pacote: ${dbFiles.join(", ")}`);
if (hits.length) {
  console.error("PUBLICAÇÃO CANCELADA. Dados pessoais ou caminhos locais encontrados:\n" + hits.slice(0, 50).join("\n"));
  process.exit(1);
}
console.log("OK: nenhum dado pessoal, caminho local ou base de dados real no pacote.");

// 5. ZIP (bsdtar do Windows 10/11)
log("A criar o ZIP");
// ZIP criado pela biblioteca padrão do .NET (o "tar -a" produziu um ZIP sem diretório central válido)
fs.rmSync(ZIP, { force: true });
const ps = [
  "Add-Type -AssemblyName System.IO.Compression.FileSystem",
  `[IO.Compression.ZipFile]::CreateFromDirectory('${STAGE}', '${ZIP}', 'Optimal', $true)`,
  // verificação: o ZIP tem de abrir e ter todas as entradas da pasta
  `$z = [IO.Compression.ZipFile]::OpenRead('${ZIP}'); $n = $z.Entries.Count; $z.Dispose(); Write-Output "entradas=$n"`,
].join("; ");
const verify = execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", ps], { encoding: "utf8" });
const entries = Number(/entradas=(\d+)/.exec(verify)?.[1] ?? 0);
const filesInStage = (function count(dir) { return fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(path.join(dir, e.name)) : 1), 0); })(STAGE);
if (entries < filesInStage) throw new Error(`ZIP incompleto: ${entries} entradas para ${filesInStage} ficheiros`);
console.log(`ZIP verificado: ${entries} entradas (${filesInStage} ficheiros)`);

// 6. SHA-256
const sha = crypto.createHash("sha256").update(fs.readFileSync(ZIP)).digest("hex");
fs.writeFileSync(path.join(RELEASE, "SHA256SUMS.txt"), `${sha}  ${path.basename(ZIP)}\n`);
console.log(`\nPacote: ${ZIP}\nSHA-256: ${sha}\nTamanho: ${(fs.statSync(ZIP).size / 1048576).toFixed(1)} MB\nRuntime: ${nodeVersion}`);
