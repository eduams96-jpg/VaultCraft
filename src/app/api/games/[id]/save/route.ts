import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";

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

    if (!fs.existsSync(expandedPath)) {
      return NextResponse.json(
        {
          error: `A pasta de saves "${expandedPath}" não foi encontrada no disco.`,
        },
        { status: 404 }
      );
    }

    // ACTION: OPEN IN EXPLORER
    if (action === "open") {
      execFile("explorer.exe", [expandedPath], (err) => {
        if (err) console.error("Erro ao abrir pasta:", err);
      });

      return NextResponse.json({
        success: true,
        message: "A abrir pasta de saves no Explorador do Windows...",
      });
    }

    // ACTION: BACKUP SAVE FOLDER
    if (action === "backup") {
      const backupRootDir = path.join(process.cwd(), "backups", "saves");
      if (!fs.existsSync(backupRootDir)) {
        fs.mkdirSync(backupRootDir, { recursive: true });
      }

      const safeTitle = game.title.replace(/[^a-zA-Z0-9_-]/g, "_");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const targetBackupDir = path.join(backupRootDir, `${safeTitle}_backup_${timestamp}`);

      // Copy directory recursively using node fs.cpSync (available in Node 16+)
      fs.cpSync(expandedPath, targetBackupDir, { recursive: true });

      return NextResponse.json({
        success: true,
        backupPath: targetBackupDir,
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
