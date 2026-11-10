import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  cleanRawGameTitle,
  checkIsDuplicateGame,
  type ExistingGameRef,
} from "@/lib/gameNormalization";

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: "desc" },
    });

    const backupData = {
      version: "1.1",
      exportDate: new Date().toISOString(),
      totalGames: games.length,
      games,
    };

    const fileName = `gametracker-backup-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Backup export error:", error);
    return NextResponse.json({ error: "Erro ao gerar cópia de segurança" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gamesToImport: any[] = [];

    if (Array.isArray(body)) {
      gamesToImport = body;
    } else if (body && Array.isArray(body.games)) {
      gamesToImport = body.games;
    } else {
      return NextResponse.json({ error: "Ficheiro de backup inválido" }, { status: 400 });
    }

    let importedCount = 0;
    let skippedCount = 0;

    const existingGames: ExistingGameRef[] = await prisma.game.findMany({
      select: { id: true, title: true, platform: true },
    });

    for (const item of gamesToImport) {
      if (!item.title) {
        skippedCount++;
        continue;
      }

      const { cleanTitle } = cleanRawGameTitle(item.title);
      const titleToSave = cleanTitle.trim() || item.title.trim();
      const platformToSave = item.platform || "PC";

      // Check if title already exists to avoid duplicates
      const dup = checkIsDuplicateGame(titleToSave, platformToSave, existingGames);

      if (dup.isDuplicate) {
        skippedCount++;
        continue;
      }

      const created = await prisma.game.create({
        data: {
          title: titleToSave,
          platform: platformToSave,
          originType: item.originType || "STEAM",
          repackGroup: item.repackGroup || null,
          status: item.status || "BACKLOG",
          rating: item.rating ? Number(item.rating) : null,
          coverUrl: item.coverUrl || null,
          bannerUrl: item.bannerUrl || null,
          releaseYear: item.releaseYear ? Number(item.releaseYear) : null,
          genres: item.genres || null,
          storageLocation: item.storageLocation || null,
          executablePath: item.executablePath || null,
          saveLocation: item.saveLocation || null,
          diskSpace: item.diskSpace || null,
          pcRequirements: item.pcRequirements || null,
          tags: item.tags || null,
          timeToBeat: item.timeToBeat || null,
          isInstalled: Boolean(item.isInstalled),
          isArchived: Boolean(item.isArchived),
          hasSavefile: Boolean(item.hasSavefile),
          hasAchievements: Boolean(item.hasAchievements),
          isPlatinum: Boolean(item.isPlatinum || item.status === "PLATINUM"),
          isWishlist: Boolean(item.isWishlist),
          wishlistStatus: item.wishlistStatus || null,
          installNotes: item.installNotes || null,
          hoursPlayed: item.hoursPlayed ? Number(item.hoursPlayed) : 0,
          completionDate:
            item.completionDate && !isNaN(Date.parse(item.completionDate))
              ? new Date(item.completionDate)
              : null,
        },
      });

      existingGames.push({ id: created.id, title: created.title, platform: created.platform });
      importedCount++;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      skippedCount,
      message: `${importedCount} jogos restaurados com sucesso (${skippedCount} ignorados por duplicado).`,
    });
  } catch (error) {
    console.error("Backup import error:", error);
    return NextResponse.json({ error: "Erro ao restaurar a cópia de segurança" }, { status: 500 });
  }
}
