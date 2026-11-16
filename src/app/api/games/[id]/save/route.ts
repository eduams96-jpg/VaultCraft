import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shellOpen } from "@/lib/shell-open";
import fs from "fs";
import path from "path";

export interface SaveBackupSnapshot {
  name: string;
  createdAt: string;
  sizeKB: number;
  filesCount: number;
}

function getDirectoryStats(dirPath: string): { bytes: number; filesCount: number } {
  let bytes = 0;
  let filesCount = 0;
  try {
    const entries = fs.readdirSync(/*turbopackIgnore: true*/ dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(/*turbopackIgnore: true*/ dirPath, entry.name);
      if (entry.isDirectory()) {
        const sub = getDirectoryStats(full);
        bytes += sub.bytes;
        filesCount += sub.filesCount;
      } else if (entry.isFile()) {
        filesCount += 1;
        try {
          bytes += fs.statSync(/*turbopackIgnore: true*/ full).size;
        } catch {}
      }
    }
  } catch {}
  return { bytes, filesCount };
}

function listGameSaveBackups(safeTitle: string): SaveBackupSnapshot[] {
  const backupRootDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "backups", "saves");
  if (!fs.existsSync(/*turbopackIgnore: true*/ backupRootDir)) {
    return [];
  }

  try {
    const prefix = `${safeTitle}_backup_`;
    const entries = fs.readdirSync(/*turbopackIgnore: true*/ backupRootDir, { withFileTypes: true });
    const snapshots: SaveBackupSnapshot[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || !entry.name.startsWith(prefix)) continue;
      const fullPath = path.join(/*turbopackIgnore: true*/ backupRootDir, entry.name);
      try {
        const stat = fs.statSync(/*turbopackIgnore: true*/ fullPath);
        const { bytes, filesCount } = getDirectoryStats(fullPath);
        snapshots.push({
          name: entry.name,
          createdAt: stat.mtime.toISOString(),
          sizeKB: Math.max(1, Math.round(bytes / 1024)),
          filesCount,
        });
      } catch {}
    }

    return snapshots.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const game = await prisma.game.findUnique({ where: { id } });
    if (!game) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
    }

    const safeTitle = game.title.replace(/[^a-zA-Z0-9_-]/g, "_");
    const backups = listGameSaveBackups(safeTitle);

    const savePath = game.saveLocation?.trim();
    const expandedPath = savePath
      ? savePath.replace(/%([^%]+)%/g, (_, n) => process.env[n] || _)
      : null;
    const saveLocationExists = Boolean(
      expandedPath && fs.existsSync(/*turbopackIgnore: true*/ expandedPath)
    );

    return NextResponse.json({
      backups,
      saveLocationExists,
      expandedPath,
    });
  } catch (error) {
    console.error("GET save backups error:", error);
    return NextResponse.json(
      { error: "Erro ao listar backups de saves" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json();
    const action = body.action || "open";

    const game = await prisma.game.findUnique({
      where: { id },
    });

    if (!game) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
    }

    const safeTitle = game.title.replace(/[^a-zA-Z0-9_-]/g, "_");
    const backupRootDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "backups", "saves");

    // ACTION: OPEN BACKUP FOLDER IN EXPLORER
    if (action === "openBackup") {
      const backupName = typeof body.backupName === "string" ? body.backupName.trim() : "";
      const targetDir =
        backupName && !backupName.includes("..") && !backupName.includes("/") && !backupName.includes("\\")
          ? path.join(/*turbopackIgnore: true*/ backupRootDir, backupName)
          : backupRootDir;

      if (!fs.existsSync(/*turbopackIgnore: true*/ targetDir)) {
        return NextResponse.json(
          { error: "A pasta de backup não foi encontrada no disco." },
          { status: 404 }
        );
      }

      await shellOpen(targetDir);

      return NextResponse.json({
        success: true,
        message: "A abrir cofre de backups no Explorador do Windows...",
      });
    }

    // ACTION: DELETE A SPECIFIC BACKUP SNAPSHOT
    if (action === "deleteBackup") {
      const backupName = typeof body.backupName === "string" ? body.backupName.trim() : "";
      if (
        !backupName ||
        backupName.includes("..") ||
        backupName.includes("/") ||
        backupName.includes("\\") ||
        !backupName.startsWith(`${safeTitle}_backup_`)
      ) {
        return NextResponse.json({ error: "Nome de backup inválido." }, { status: 400 });
      }

      const targetDir = path.join(/*turbopackIgnore: true*/ backupRootDir, backupName);
      if (fs.existsSync(/*turbopackIgnore: true*/ targetDir)) {
        fs.rmSync(/*turbopackIgnore: true*/ targetDir, { recursive: true, force: true });
      }

      const backups = listGameSaveBackups(safeTitle);
      return NextResponse.json({
        success: true,
        backups,
        message: `Snapshot "${backupName}" removido do cofre.`,
      });
    }

    const savePath = game.saveLocation?.trim();

    if (!savePath) {
      return NextResponse.json(
        {
          error:
            "Nenhuma pasta de Saves configurada para este jogo. Define o caminho nas definições do jogo (ex.: %APPDATA%\\... ou C:\\...).",
        },
        { status: 400 }
      );
    }

    // Expand Windows environment variables if present (e.g. %APPDATA%, %USERPROFILE%, %PUBLIC%)
    const expandedPath = savePath.replace(/%([^%]+)%/g, (_, n) => process.env[n] || _);

    // ACTION: RESTORE A BACKUP SNAPSHOT TO GAME SAVE LOCATION
    if (action === "restore") {
      const backupName = typeof body.backupName === "string" ? body.backupName.trim() : "";
      if (
        !backupName ||
        backupName.includes("..") ||
        backupName.includes("/") ||
        backupName.includes("\\") ||
        !backupName.startsWith(`${safeTitle}_backup_`)
      ) {
        return NextResponse.json({ error: "Snapshot de backup inválido." }, { status: 400 });
      }

      const sourceBackupDir = path.join(/*turbopackIgnore: true*/ backupRootDir, backupName);
      if (!fs.existsSync(/*turbopackIgnore: true*/ sourceBackupDir)) {
        return NextResponse.json(
          { error: "A pasta do backup selecionado já não existe no disco." },
          { status: 404 }
        );
      }

      // O restauro escreve por cima dos saves atuais: guarda-os primeiro num snapshot
      // de segurança para que um restauro por engano nunca destrua progresso.
      let safetyBackupName: string | null = null;
      if (fs.existsSync(/*turbopackIgnore: true*/ expandedPath)) {
        const current = getDirectoryStats(expandedPath);
        if (current.filesCount > 0) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
          safetyBackupName = `${safeTitle}_backup_${timestamp}_antes-do-restauro`;
          fs.cpSync(
            /*turbopackIgnore: true*/ expandedPath,
            path.join(/*turbopackIgnore: true*/ backupRootDir, safetyBackupName),
            { recursive: true }
          );
        }
      } else {
        fs.mkdirSync(/*turbopackIgnore: true*/ expandedPath, { recursive: true });
      }

      fs.cpSync(/*turbopackIgnore: true*/ sourceBackupDir, expandedPath, {
        recursive: true,
        force: true,
      });

      return NextResponse.json({
        success: true,
        backups: listGameSaveBackups(safeTitle),
        message: safetyBackupName
          ? `Savegame restaurado a partir de "${backupName}". Os saves anteriores ficaram guardados em "${safetyBackupName}".`
          : `Savegame restaurado com sucesso a partir de "${backupName}"!`,
      });
    }

    if (!fs.existsSync(/*turbopackIgnore: true*/ expandedPath)) {
      return NextResponse.json(
        {
          error: `A pasta de saves "${expandedPath}" não foi encontrada no disco.`,
        },
        { status: 404 }
      );
    }

    // ACTION: OPEN IN EXPLORER
    if (action === "open") {
      await shellOpen(expandedPath);

      return NextResponse.json({
        success: true,
        message: "A abrir pasta de saves no Explorador do Windows...",
      });
    }

    // ACTION: BACKUP SAVE FOLDER
    if (action === "backup") {
      if (!fs.existsSync(/*turbopackIgnore: true*/ backupRootDir)) {
        fs.mkdirSync(/*turbopackIgnore: true*/ backupRootDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const targetBackupDir = path.join(
        /*turbopackIgnore: true*/ backupRootDir,
        `${safeTitle}_backup_${timestamp}`
      );

      // Copy directory recursively using node fs.cpSync
      fs.cpSync(/*turbopackIgnore: true*/ expandedPath, targetBackupDir, { recursive: true });

      // Automatically mark hasSavefile = true in Prisma if not already true
      let updatedGame = null;
      if (!game.hasSavefile) {
        updatedGame = await prisma.game.update({
          where: { id },
          data: { hasSavefile: true },
        });
      }

      const backups = listGameSaveBackups(safeTitle);

      return NextResponse.json({
        success: true,
        backupPath: targetBackupDir,
        updatedGame,
        backups,
        message: `Backup dos saves criado com sucesso em: ${path.basename(targetBackupDir)}!`,
      });
    }

    return NextResponse.json({ error: "Ação não suportada" }, { status: 400 });
  } catch (error) {
    console.error("Save management error:", error);
    return NextResponse.json(
      { error: "Erro ao processar pasta de saves" },
      { status: 500 }
    );
  }
}
