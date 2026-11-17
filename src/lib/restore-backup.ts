import { prisma } from "@/lib/prisma";
import {
  cleanRawGameTitle,
  checkIsDuplicateGame,
  type ExistingGameRef,
} from "@/lib/gameNormalization";

export interface RestoreSummary {
  success: true;
  gamesImportedCount: number;
  gamesSkippedCount: number;
  mediaImportedCount: number;
  message: string;
}

/**
 * Restaura dados de um backup JSON unificado (Jogos, Filmes & Séries, Categorias e Metas)
 * evitando duplicados em registos já existentes.
 */
/**
 * Um registo vindo de um ficheiro de backup. O JSON é entrada externa e o formato mudou
 * entre versões (números como texto, campos em falta), por isso cada campo é convertido
 * explicitamente (Number/parseInt/Boolean/new Date) antes de chegar ao Prisma.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- formato livre, validado campo a campo abaixo
type BackupRecord = Record<string, any>;

function asRecords(value: unknown): BackupRecord[] {
  return Array.isArray(value)
    ? value.filter((v): v is BackupRecord => Boolean(v) && typeof v === "object")
    : [];
}

export async function restoreUnifiedBackupData(body: unknown): Promise<RestoreSummary> {
  let gamesToImport: BackupRecord[] = [];
  let mediaToImport: BackupRecord[] = [];
  let categoriesToImport: BackupRecord[] = [];
  let goalsToImport: BackupRecord[] = [];

  if (Array.isArray(body)) {
    gamesToImport = asRecords(body);
  } else if (body && typeof body === "object") {
    const data = body as Record<string, unknown>;
    gamesToImport = asRecords(data.games);
    mediaToImport = asRecords(Array.isArray(data.media) ? data.media : data.mediaItems);
    categoriesToImport = asRecords(data.categories);
    goalsToImport = asRecords(data.goals);
  } else {
    throw new Error("Ficheiro de backup inválido");
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
          userReview: item.userReview || null,
          screenshots: item.screenshots || null,
          hoursPlayed: item.hoursPlayed ? Number(item.hoursPlayed) : 0,
          gameVersion: item.gameVersion || null,
          versionDate: item.versionDate ? new Date(item.versionDate) : null,
          latestKnownVersion: item.latestKnownVersion || null,
          latestVersionDate: item.latestVersionDate ? new Date(item.latestVersionDate) : null,
          latestPatchTitle: item.latestPatchTitle || null,
          latestPatchNotesUrl: item.latestPatchNotesUrl || null,
          isUpToDate: item.isUpToDate !== undefined ? item.isUpToDate : null,
          externalLink: item.externalLink || null,
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
          rating:
            m.rating !== undefined && m.rating !== null && m.rating !== ""
              ? parseFloat(m.rating)
              : null,
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
          isArchived: Boolean(m.isArchived),
          subtitles: m.subtitles || "SUBBED",
          hasTrailer: Boolean(m.hasTrailer),
          hasTheme: Boolean(m.hasTheme),
          externalLink: m.externalLink || null,
          fileSizeGB: m.fileSizeGB ? parseFloat(m.fileSizeGB) : null,
          imdbId: m.imdbId || null,
          tmdbId: m.tmdbId ? parseInt(m.tmdbId, 10) : null,
          userReview: m.userReview || null,
          customTags: m.customTags || null,
          completionDate:
            m.completionDate && !isNaN(Date.parse(m.completionDate))
              ? new Date(m.completionDate)
              : null,
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

  return {
    success: true,
    gamesImportedCount,
    gamesSkippedCount,
    mediaImportedCount,
    message:
      mediaImportedCount > 0
        ? `Cópia restaurada com sucesso! (${gamesImportedCount} jogos, ${mediaImportedCount} filmes/séries do backup antigo).`
        : `Cópia restaurada com sucesso! (${gamesImportedCount} jogos importados, ${gamesSkippedCount} já existentes ignorados).`,
  };
}
