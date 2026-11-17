import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAutoSnapshot } from "@/lib/auto-backup";
import { restoreUnifiedBackupData } from "@/lib/restore-backup";

export async function GET() {
  try {
    const [games, categories, goals, media] = await Promise.all([
      prisma.game.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.goal.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.mediaItem.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    const backupData = {
      version: "2.0-unified",
      exportDate: new Date().toISOString(),
      totalGames: games.length,
      totalMedia: media.length,
      totalCategories: categories.length,
      totalGoals: goals.length,
      games,
      categories,
      goals,
      media,
    };

    const fileName = `entertainment-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Backup export error:", error);
    return NextResponse.json({ error: "Erro ao gerar cópia de segurança unificada" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await createAutoSnapshot("before-restore");
    const summary = await restoreUnifiedBackupData(body);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Backup import error:", error);
    const status = (error instanceof Error ? error.message : "") === "Ficheiro de backup inválido" ? 400 : 500;
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : "") || "Erro ao restaurar a cópia de segurança" },
      { status }
    );
  }
}
