import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { execFile } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const game = await prisma.game.findUnique({
      where: { id },
    });

    if (!game) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
    }

    const execPath = game.executablePath?.trim() || game.storageLocation?.trim();

    if (!execPath) {
      return NextResponse.json(
        {
          error:
            "Nenhum caminho de executável (.exe) ou pasta configurada para este jogo. Configura o caminho nas definições do jogo.",
        },
        { status: 400 }
      );
    }

    // If it's a URL or Steam protocol (steam://)
    if (execPath.startsWith("steam://") || execPath.startsWith("http://") || execPath.startsWith("https://")) {
      execFile("cmd.exe", ["/c", "start", "", execPath], (err) => {
        if (err) console.error("Erro ao abrir URL/protocolo:", err);
      });
      return NextResponse.json({ success: true, message: "A abrir jogo..." });
    }

    // If it's a local path on Windows
    if (!fs.existsSync(execPath)) {
      return NextResponse.json(
        {
          error: `O ficheiro ou diretório "${execPath}" não foi encontrado no teu disco.`,
        },
        { status: 404 }
      );
    }

    const stat = fs.statSync(execPath);
    let target = execPath;
    let cwd = path.dirname(execPath);

    if (stat.isDirectory()) {
      // Find .exe files in the directory
      const files = fs.readdirSync(execPath);
      const exeFiles = files.filter(
        (f) =>
          f.toLowerCase().endsWith(".exe") &&
          !f.toLowerCase().includes("unins") &&
          !f.toLowerCase().includes("crash") &&
          !f.toLowerCase().includes("setup") &&
          !f.toLowerCase().includes("redist")
      );

      if (exeFiles.length > 0) {
        target = path.join(execPath, exeFiles[0]);
        cwd = execPath;
      } else {
        // Just open the folder in Windows Explorer securely
        execFile("explorer.exe", [execPath], (err) => {
          if (err) console.error("Erro ao abrir explorer:", err);
        });
        return NextResponse.json({
          success: true,
          message: "A abrir a pasta do jogo no Explorador de Ficheiros...",
        });
      }
    }

    // Execute on Windows via cmd start to detach process cleanly
    execFile("cmd.exe", ["/c", "start", "", target], { cwd }, (err) => {
      if (err) {
        console.error("Erro ao iniciar jogo:", err);
      }
    });

    return NextResponse.json({
      success: true,
      message: `A iniciar jogo: ${path.basename(target)}`,
    });
  } catch (error) {
    console.error("Launch error:", error);
    return NextResponse.json({ error: "Erro ao tentar iniciar o jogo" }, { status: 500 });
  }
}
