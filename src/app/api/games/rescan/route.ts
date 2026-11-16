import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { createAutoSnapshot } from "@/lib/auto-backup";

const IGNORED_EXES = [
  "unins000.exe",
  "uninstall.exe",
  "setup.exe",
  "dxwebsetup.exe",
  "vcredist",
  "vc_redist",
  "unitycrashhandler",
  "crashreport",
  "quicksfv.exe",
];

function findMainExe(dirPath: string, maxDepth = 2, depth = 0): string | null {
  let best: { exe: string; size: number } | null = null;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(/*turbopackIgnore: true*/ dirPath, e.name);
      if (e.isFile() && e.name.toLowerCase().endsWith(".exe")) {
        const lower = e.name.toLowerCase();
        if (IGNORED_EXES.some((ig) => lower.includes(ig))) continue;
        try {
          const st = fs.statSync(full);
          if (!best || st.size > best.size) best = { exe: full, size: st.size };
        } catch {}
      } else if (e.isDirectory() && depth < maxDepth) {
        const sub = findMainExe(full, maxDepth, depth + 1);
        if (sub) {
          try {
            const st = fs.statSync(/*turbopackIgnore: true*/ sub);
            if (!best || st.size > best.size) best = { exe: sub, size: st.size };
          } catch {}
        }
      }
    }
  } catch {}
  return best?.exe || null;
}

export async function POST(request: Request) {
  try {
    let targetId: string | undefined;
    try {
      const body = await request.json();
      if (body && typeof body.id === "string" && body.id.trim()) {
        targetId = body.id.trim();
      }
    } catch {
      // Request body pode estar vazio num rescan global
    }

    const games = await prisma.game.findMany({
      where: targetId
        ? { id: targetId }
        : {
            OR: [
              { storageLocation: { not: null } },
              { executablePath: { not: null } },
            ],
          },
    });

    if (games.length === 0) {
      if (targetId) {
        return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
      }
      return NextResponse.json({
        updatedCount: 0,
        checkedCount: 0,
        message: "Nenhum jogo tem pasta ou executável associado para sincronizar.",
      });
    }

    let updatedCount = 0;
    let checkedCount = 0;
    let singleGameResult = games[0] || null;

    for (const game of games) {
      const loc = game.storageLocation?.trim() || "";
      const exe = game.executablePath?.trim() || "";

      if (exe.startsWith("steam://") || exe.startsWith("com.epicgames")) {
        if (targetId) {
          return NextResponse.json({
            success: true,
            game: singleGameResult,
            updatedCount: 0,
            checkedCount: 1,
            message: "Atalho de loja (Steam/Epic) verificado.",
          });
        }
        continue;
      }

      if (!loc && !exe) {
        continue;
      }

      checkedCount++;
      let existsOnDisk = false;
      let detectedExe = game.executablePath;

      if (exe && fs.existsSync(path.resolve(/*turbopackIgnore: true*/ exe))) {
        existsOnDisk = true;
      } else if (loc && fs.existsSync(path.resolve(/*turbopackIgnore: true*/ loc))) {
        existsOnDisk = true;
        if (!detectedExe) {
          const resolvedLoc = path.resolve(/*turbopackIgnore: true*/ loc);
          try {
            if (fs.statSync(resolvedLoc).isDirectory()) {
              detectedExe = findMainExe(resolvedLoc);
            }
          } catch {}
        }
      }

      if (existsOnDisk !== game.isInstalled || detectedExe !== game.executablePath) {
        singleGameResult = await prisma.game.update({
          where: { id: game.id },
          data: {
            isInstalled: existsOnDisk,
            executablePath: detectedExe,
          },
        });
        updatedCount++;
      }
    }

    if (targetId) {
      return NextResponse.json({
        success: true,
        game: singleGameResult,
        updatedCount,
        checkedCount,
        message: singleGameResult?.isInstalled
          ? updatedCount > 0
            ? "Disco verificado! Instalação e executável confirmados."
            : "Disco verificado! O jogo continua instalado e acessível."
          : "Caminho não encontrado no disco (estado atualizado para Não Instalado).",
      });
    }

    if (updatedCount > 0) {
      await createAutoSnapshot("games-rescan");
    }

    return NextResponse.json({
      updatedCount,
      checkedCount,
      message:
        updatedCount > 0
          ? `Sincronização concluída: ${updatedCount} de ${checkedCount} jogos atualizados no disco!`
          : `Todas as ${checkedCount} pastas de jogos verificadas estão sincronizadas!`,
    });
  } catch (error) {
    console.error("Error rescanning game folders:", error);
    return NextResponse.json(
      { error: "Erro ao sincronizar pastas de jogos." },
      { status: 500 }
    );
  }
}
