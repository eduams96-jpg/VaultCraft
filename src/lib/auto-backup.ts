import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { BACKUPS_DIR, sqliteFilePath } from "@/lib/paths";

const MAX_SNAPSHOTS = 10;

export interface AutoSnapshotMeta {
  filename: string;
  createdAt: string;
  sizeKB: number;
  reason: string;
  gamesCount: number;
  mediaCount: number;
}

function getBackupsDir(): string {
  return BACKUPS_DIR;
}

function formatTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(
    date.getHours()
  )}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

/**
 * Cria um snapshot JSON completo da base de dados + cópia física de prisma/dev.db,
 * mantendo no máximo os 10 snapshots mais recentes na pasta /backups.
 */
export async function createAutoSnapshot(reason: string): Promise<AutoSnapshotMeta | null> {
  try {
    const backupsDir = getBackupsDir();
    fs.mkdirSync(backupsDir, { recursive: true });

    const [games, categories, goals, mediaItems] = await Promise.all([
      prisma.game.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.goal.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.mediaItem.findMany({ orderBy: { createdAt: "asc" } }),
    ]);

    const now = new Date();
    const safeReason =
      reason
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/^-+|-+$/g, "") || "auto";

    const filename = `snapshot-${formatTimestamp(now)}-${safeReason}.json`;
    const filePath = path.join(/*turbopackIgnore: true*/ backupsDir, filename);

    const payload = {
      version: "2.0",
      exportedAt: now.toISOString(),
      reason: safeReason,
      gamesCount: games.length,
      mediaCount: mediaItems.length,
      games,
      categories,
      goals,
      mediaItems,
    };

    const jsonString = JSON.stringify(payload, null, 2);
    fs.writeFileSync(filePath, jsonString, "utf-8");

    // Copiar ficheiro físico SQLite mais recente
    const sqlitePath = sqliteFilePath();
    if (sqlitePath && fs.existsSync(sqlitePath)) {
      const latestDbCopy = path.join(/*turbopackIgnore: true*/ backupsDir, "dev-latest.db.backup");
      fs.copyFileSync(sqlitePath, latestDbCopy);
    }

    // Rotação: manter apenas os MAX_SNAPSHOTS ficheiros JSON mais recentes
    const jsonFiles = fs
      .readdirSync(backupsDir)
      .filter((f) => f.endsWith(".json") && f.startsWith("snapshot-"))
      .map((f) => {
        const full = path.join(/*turbopackIgnore: true*/ backupsDir, f);
        return { name: f, full, mtimeMs: fs.statSync(full).mtimeMs };
      })
      .sort((a, b) => b.mtimeMs - a.mtimeMs);

    if (jsonFiles.length > MAX_SNAPSHOTS) {
      for (const old of jsonFiles.slice(MAX_SNAPSHOTS)) {
        try {
          fs.unlinkSync(old.full);
        } catch {}
      }
    }

    const stat = fs.statSync(filePath);
    return {
      filename,
      createdAt: payload.exportedAt,
      sizeKB: Math.round((stat.size / 1024) * 10) / 10,
      reason: safeReason,
      gamesCount: games.length,
      mediaCount: mediaItems.length,
    };
  } catch (err) {
    console.error("Auto-snapshot failed:", err);
    return null;
  }
}

export async function listAutoSnapshots(): Promise<AutoSnapshotMeta[]> {
  try {
    const backupsDir = getBackupsDir();
    if (!fs.existsSync(backupsDir)) return [];

    const files = fs
      .readdirSync(backupsDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        const full = path.join(/*turbopackIgnore: true*/ backupsDir, f);
        const stat = fs.statSync(full);
        return { name: f, full, stat };
      })
      .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);

    const results: AutoSnapshotMeta[] = [];
    for (const file of files) {
      try {
        const raw = fs.readFileSync(file.full, "utf-8");
        const parsed = JSON.parse(raw);
        results.push({
          filename: file.name,
          createdAt: parsed.exportedAt || new Date(file.stat.mtimeMs).toISOString(),
          sizeKB: Math.round((file.stat.size / 1024) * 10) / 10,
          reason: parsed.reason || "snapshot",
          gamesCount: Array.isArray(parsed.games) ? parsed.games.length : parsed.gamesCount || 0,
          mediaCount: Array.isArray(parsed.mediaItems) ? parsed.mediaItems.length : parsed.mediaCount || 0,
        });
      } catch {}
    }
    return results;
  } catch {
    return [];
  }
}

export async function readAutoSnapshot(filename: string): Promise<unknown> {
  if (
    !filename ||
    path.basename(filename) !== filename ||
    !filename.endsWith(".json")
  ) {
    throw new Error("Nome de ficheiro de snapshot inválido.");
  }
  const filePath = path.join(/*turbopackIgnore: true*/ getBackupsDir(), filename);
  if (!fs.existsSync(filePath)) {
    throw new Error("Snapshot não encontrado no disco.");
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}
