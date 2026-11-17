// Cria uma base de dados SQLite VAZIA com o esquema atual (usada na primeira execução da app).
// Nunca copia a base de dados do programador: só o esquema.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("release", "template");
const dbFile = path.join(outDir, "template.db");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const absolute = dbFile.split(String.fromCharCode(92)).join("/");
execFileSync(process.execPath, ["node_modules/prisma/build/index.js", "db", "push", "--skip-generate", "--accept-data-loss"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: `file:${absolute}` },
});
if (!fs.existsSync(dbFile)) throw new Error("template.db não foi criada");
console.log("Base de dados modelo:", dbFile, `(${fs.statSync(dbFile).size} bytes)`);
