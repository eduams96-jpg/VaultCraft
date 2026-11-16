import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { looksLikeUrl, parseLaunchUrl, shellOpen } from "@/lib/shell-open";
import path from "path";
import fs from "fs";

const IGNORED_EXE_HINTS = ["unins", "crash", "setup", "redist"];

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json().catch(() => ({}));
    const action = body?.action || "launch"; // "launch" | "open"

    const game = await prisma.game.findUnique({
      where: { id },
    });

    if (!game) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
    }

    const storagePath = game.storageLocation?.trim() || "";
    const exePath = game.executablePath?.trim() || "";

    if (action === "open") {
      const folderPath =
        storagePath ||
        (exePath && !looksLikeUrl(exePath) ? path.dirname(/*turbopackIgnore: true*/ exePath) : "");

      if (!folderPath || !fs.existsSync(/*turbopackIgnore: true*/ folderPath)) {
        return NextResponse.json(
          { error: "Pasta do jogo não encontrada no disco." },
          { status: 404 }
        );
      }

      // storageLocation pode apontar para um ficheiro (ROM/ISO): abre a pasta que o contém
      const folderToOpen = fs.statSync(/*turbopackIgnore: true*/ folderPath).isDirectory()
        ? folderPath
        : path.dirname(/*turbopackIgnore: true*/ folderPath);

      await shellOpen(folderToOpen);

      return NextResponse.json({
        success: true,
        message: "A abrir pasta do jogo no Explorador do Windows...",
      });
    }

    const execPath = exePath || storagePath;

    if (!execPath) {
      return NextResponse.json(
        {
          error:
            "Nenhum caminho de executável (.exe) ou pasta configurada para este jogo. Configura o caminho nas definições do jogo.",
        },
        { status: 400 }
      );
    }

    // Store / launcher protocols (steam://, com.epicgames.launcher://, https://, ...)
    if (looksLikeUrl(execPath)) {
      const launchUrl = parseLaunchUrl(execPath);
      if (!launchUrl) {
        return NextResponse.json(
          { error: "Protocolo não suportado no caminho do executável deste jogo." },
          { status: 400 }
        );
      }
      await shellOpen(launchUrl);
      return NextResponse.json({ success: true, message: "A abrir jogo..." });
    }

    // Local path on Windows
    if (!fs.existsSync(/*turbopackIgnore: true*/ execPath)) {
      return NextResponse.json(
        {
          error: `O ficheiro ou diretório "${execPath}" não foi encontrado no teu disco.`,
        },
        { status: 404 }
      );
    }

    const stat = fs.statSync(/*turbopackIgnore: true*/ execPath);
    let target = execPath;
    let cwd = path.dirname(/*turbopackIgnore: true*/ execPath);

    if (stat.isDirectory()) {
      const exeFiles = fs.readdirSync(/*turbopackIgnore: true*/ execPath).filter((f) => {
        const lower = f.toLowerCase();
        return lower.endsWith(".exe") && !IGNORED_EXE_HINTS.some((hint) => lower.includes(hint));
      });

      if (exeFiles.length === 0) {
        await shellOpen(execPath);
        return NextResponse.json({
          success: true,
          message: "A abrir a pasta do jogo no Explorador de Ficheiros...",
        });
      }

      // Com vários .exe, o maior é quase sempre o jogo (e não um launcher/config auxiliar)
      let best = exeFiles[0];
      let bestSize = -1;
      for (const f of exeFiles) {
        try {
          const size = fs.statSync(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ execPath, f)).size;
          if (size > bestSize) {
            best = f;
            bestSize = size;
          }
        } catch {}
      }

      target = path.join(/*turbopackIgnore: true*/ execPath, best);
      cwd = execPath;
    }

    await shellOpen(target, cwd);

    return NextResponse.json({
      success: true,
      message: `A iniciar jogo: ${path.basename(/*turbopackIgnore: true*/ target)}`,
    });
  } catch (error) {
    console.error("Launch error:", error);
    return NextResponse.json({ error: "Erro ao tentar iniciar o jogo" }, { status: 500 });
  }
}
