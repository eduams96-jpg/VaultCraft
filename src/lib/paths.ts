import path from "path";

/**
 * Caminhos de dados do utilizador. Em desenvolvimento ficam dentro do projeto (pastas ignoradas
 * pelo Git). Na aplicação instalada, o lançador define VAULTCRAFT_DATA_DIR para uma pasta do
 * utilizador (%LOCALAPPDATA%\VaultCraft), assim os dados sobrevivem a atualizações.
 */
export const DATA_DIR = process.env.VAULTCRAFT_DATA_DIR || process.cwd();
export const BACKUPS_DIR = path.join(DATA_DIR, "backups");

/** Caminho do ficheiro SQLite indicado em DATABASE_URL (file:...), ou null se não for SQLite. */
export function sqliteFilePath(): string | null {
  const url = process.env.DATABASE_URL || "";
  if (!url.startsWith("file:")) return null;
  const raw = url.slice("file:".length);
  return path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), "prisma", raw);
}
