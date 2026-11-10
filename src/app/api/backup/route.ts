import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  cleanRawGameTitle,
  checkIsDuplicateGame,
  type ExistingGameRef,
} from "@/lib/gameNormalization";

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
    let gamesToImport: any[] = [];
    let mediaToImport: any[] = [];
    let categoriesToImport: any[] = [];
    let goalsToImport: any[] = [];

    if (Array.isArray(body)) {
      gamesToImport = body;
    } else if (body && typeof body === "object") {
      if (Array.isArray(body.games)) gamesToImport = body.games;
      if (Array.isArray(body.media)) mediaToImport = body.media;
      if (Array.isArray(body.categories)) categoriesToImport = body.categories;
      if (Array.isArray(body.goals)) goalsToImport = body.goals;
    } else {
      return NextResponse.json({ error: "Ficheiro de backup inválido" }, { status: 400 });
    }

    let gamesImportedCount = 0;
    let gamesSkippedCount = 0;
    let mediaImportedCount = 0;

    // 1. Restore Games
    if (gamesToImport.length > 0) {
      const existingGames: ExistingGameRef[] = await prisma.game.findMany({
        select: { id: true, title: true, platform: true },
      });

      for (const item of gamesToImport) {
        if (!item.title) {
          gamesSkippedCount++;
          continue;
        }

        const { cleanTitle } = cleanRawGameTitle(item.title);
        const titleToSave = cleanTitle.trim() || item.title.trim();
        const platformToSave = item.platform || "PC";

        const dup = checkIsDuplicateGame(titleToSave, platformToSave, existingGames);
        if (dup.isDuplicate) {
          gamesSkippedCount++;
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
            customCategories: item.customCategories || null,
            timeToBeat: item.timeToBeat || null,
            isInstalled: Boolean(item.isInstalled),
            isArchived: Boolean(item.isArchived),
            isFavorite: Boolean(item.isFavorite),
            hasSavefile: Boolean(item.hasSavefile),
            hasAchievements: Boolean(item.hasAchievements),
            isPlatinum: Boolean(item.isPlatinum || item.status === "PLATINUM"),
            isWishlist: Boolean(item.isWishlist),
            wishlistStatus: item.wishlistStatus || null,
            wishlistPriority: item.wishlistPriority || "MEDIUM",
            targetPrice: item.targetPrice ? Number(item.targetPrice) : null,
            installNotes: item.installNotes || null,
            hoursPlayed: item.hoursPlayed ? Number(item.hoursPlayed) : 0,
            gameVersion: item.gameVersion || null,
            versionDate: item.versionDate ? new Date(item.versionDate) : null,
            latestKnownVersion: item.latestKnownVersion || null,
            latestVersionDate: item.latestVersionDate ? new Date(item.latestVersionDate) : null,
            latestPatchTitle: item.latestPatchTitle || null,
            latestPatchNotesUrl: item.latestPatchNotesUrl || null,
            isUpToDate: item.isUpToDate !== undefined ? item.isUpToDate : null,
            completionDate:
              item.completionDate && !isNaN(Date.parse(item.completionDate))
                ? new Date(item.completionDate)
                : null,
          },
        });

        existingGames.push({ id: created.id, title: created.title, platform: created.platform });
        gamesImportedCount++;
      }
    }

    // 2. Restore Media (Movies & Series)
    if (mediaToImport.length > 0) {
      const existingMedia = await prisma.mediaItem.findMany({
        select: { title: true, type: true },
      });

      for (const m of mediaToImport) {
        if (!m.title || !m.title.trim()) continue;

        const isDup = existingMedia.some(
          (ex) => ex.title.toLowerCase().trim() === m.title.toLowerCase().trim() && ex.type === m.type
        );

        if (isDup) continue;

        await prisma.mediaItem.create({
          data: {
            title: m.title.trim(),
            originalTitle: m.originalTitle || null,
            type: m.type || "MOVIE",
            status: m.status || "PLAN_TO_WATCH",
            rating: m.rating ? parseInt(m.rating, 10) : null,
            posterUrl: m.posterUrl || null,
            backdropUrl: m.backdropUrl || null,
            releaseYear: m.releaseYear ? parseInt(m.releaseYear, 10) : null,
            genres: m.genres || null,
            synopsis: m.synopsis || null,
            director: m.director || null,
            cast: m.cast || null,
            durationMinutes: m.durationMinutes ? parseInt(m.durationMinutes, 10) : null,
            totalSeasons: m.totalSeasons ? parseInt(m.totalSeasons, 10) : 1,
            totalEpisodes: m.totalEpisodes ? parseInt(m.totalEpisodes, 10) : null,
            currentSeason: m.currentSeason ? parseInt(m.currentSeason, 10) : 1,
            currentEpisode: m.currentEpisode ? parseInt(m.currentEpisode, 10) : 0,
            quality: m.quality || null,
            storageLocation: m.storageLocation || null,
            sourceOrigin: m.sourceOrigin || "LOCAL",
            streamingService: m.streamingService || null,
            isFavorite: Boolean(m.isFavorite),
            userReview: m.userReview || null,
            customTags: m.customTags || null,
          },
        });

        existingMedia.push({ title: m.title.trim(), type: m.type });
        mediaImportedCount++;
      }
    }

    // 3. Restore Categories
    for (const cat of categoriesToImport) {
      if (!cat.name) continue;
      await prisma.category.upsert({
        where: { name: cat.name },
        update: { icon: cat.icon, color: cat.color },
        create: { name: cat.name, icon: cat.icon, color: cat.color },
      });
    }

    // 4. Restore Goals
    for (const goal of goalsToImport) {
      if (!goal.title) continue;
      const existingGoal = await prisma.goal.findFirst({ where: { title: goal.title } });
      if (!existingGoal) {
        await prisma.goal.create({
          data: {
            title: goal.title,
            description: goal.description || null,
            targetCount: goal.targetCount || 1,
            currentCount: goal.currentCount || 0,
            category: goal.category || "CUSTOM",
            isCompleted: Boolean(goal.isCompleted),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      gamesImportedCount,
      gamesSkippedCount,
      mediaImportedCount,
      message: `Cópia restaurada com sucesso! (${gamesImportedCount} jogos, ${mediaImportedCount} filmes/séries).`,
    });
  } catch (error) {
    console.error("Backup import error:", error);
    return NextResponse.json({ error: "Erro ao restaurar a cópia de segurança" }, { status: 500 });
  }
}
