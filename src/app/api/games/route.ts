import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  cleanRawGameTitle,
  checkIsDuplicateGame,
  type ExistingGameRef,
} from "@/lib/gameNormalization";

const SORTABLE_FIELDS = new Set([
  "updatedAt",
  "createdAt",
  "title",
  "rating",
  "hoursPlayed",
  "releaseYear",
  "completionDate",
  "platform",
  "status",
]);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const originType = searchParams.get("originType") || "";
    const platform = searchParams.get("platform") || "";
    const customCategory = searchParams.get("customCategory") || "";
    const installed = searchParams.get("installed");
    const archived = searchParams.get("archived");
    const requestedSort = searchParams.get("sortBy") || "updatedAt";
    const sortBy = SORTABLE_FIELDS.has(requestedSort) ? requestedSort : "updatedAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search.trim()) {
      where.OR = [
        { title: { contains: search } },
        { installNotes: { contains: search } },
        { repackGroup: { contains: search } },
        { genres: { contains: search } },
        { tags: { contains: search } },
        { customCategories: { contains: search } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (originType && originType !== "ALL") {
      where.originType = originType;
    }

    if (platform && platform !== "ALL") {
      where.platform = platform;
    }

    if (customCategory && customCategory !== "ALL") {
      where.customCategories = { contains: customCategory };
    }

    if (installed === "true") {
      where.isInstalled = true;
    }

    if (archived === "true") {
      where.isArchived = true;
    } else if (archived === "false") {
      where.isArchived = false;
    }

    const games = await prisma.game.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return NextResponse.json(games);
  } catch (error) {
    if ((error as { digest?: string } | null)?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Failed to fetch games:", error);
    return NextResponse.json({ error: "Erro ao procurar jogos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "O título do jogo é obrigatório" }, { status: 400 });
    }

    const { cleanTitle, detectedPlatform, detectedYear } = cleanRawGameTitle(body.title.trim());
    const finalTitle = cleanTitle || body.title.trim();
    const finalPlatform = body.platform || detectedPlatform || "PC";

    // Duplicate check unless explicitly forced
    if (!body.force) {
      const existingGames: ExistingGameRef[] = await prisma.game.findMany({
        select: { id: true, title: true, platform: true },
      });

      const dup = checkIsDuplicateGame(finalTitle, finalPlatform, existingGames);
      if (dup.isDuplicate) {
        return NextResponse.json(
          {
            error: dup.reason || "Este jogo já se encontra na tua biblioteca.",
            matchedGame: dup.matchedGame,
          },
          { status: 409 }
        );
      }
    }

    const isPlatinum = Boolean(body.isPlatinum || body.status === "PLATINUM");

    const newGame = await prisma.game.create({
      data: {
        title: finalTitle,
        platform: finalPlatform,
        originType: body.originType || "STEAM",
        repackGroup: body.repackGroup?.trim() || null,
        status: isPlatinum ? "PLATINUM" : (body.status || "BACKLOG"),
        rating: body.rating ? Number(body.rating) : null,
        coverUrl: body.coverUrl?.trim() || null,
        bannerUrl: body.bannerUrl?.trim() || null,
        releaseYear: body.releaseYear ? Number(body.releaseYear) : (detectedYear || null),
        genres: body.genres?.trim() || null,
        storageLocation: body.storageLocation?.trim() || null,
        executablePath: body.executablePath?.trim() || null,
        saveLocation: body.saveLocation?.trim() || null,
        diskSpace: body.diskSpace?.trim() || null,
        pcRequirements: body.pcRequirements?.trim() || null,
        tags: body.tags?.trim() || null,
        customCategories: body.customCategories?.trim() || null,
        timeToBeat: body.timeToBeat?.trim() || null,
        isInstalled: Boolean(body.isInstalled),
        isArchived: Boolean(body.isArchived),
        isFavorite: Boolean(body.isFavorite),
        hasSavefile: Boolean(body.hasSavefile),
        hasAchievements: Boolean(body.hasAchievements),
        isPlatinum,
        installNotes: body.installNotes?.trim() || null,
        userReview: body.userReview?.trim() || null,
        screenshots: body.screenshots?.trim() || null,
        hoursPlayed: body.hoursPlayed ? Number(body.hoursPlayed) : 0,
        gameVersion: body.gameVersion?.trim() || null,
        versionDate: body.versionDate ? new Date(body.versionDate) : null,
        latestKnownVersion: body.latestKnownVersion?.trim() || null,
        latestVersionDate: body.latestVersionDate ? new Date(body.latestVersionDate) : null,
        latestPatchNotesUrl: body.latestPatchNotesUrl?.trim() || null,
        latestPatchTitle: body.latestPatchTitle?.trim() || null,
        isUpToDate: body.isUpToDate !== undefined ? (body.isUpToDate === null ? null : Boolean(body.isUpToDate)) : null,
        externalLink: body.externalLink?.trim() || null,
        isWishlist: Boolean(body.isWishlist),
        wishlistStatus: body.wishlistStatus?.trim() || null,
        wishlistPriority: body.wishlistPriority?.trim() || "MEDIUM",
        targetPrice: body.targetPrice ? Number(body.targetPrice) : null,
        completionDate: body.completionDate ? new Date(body.completionDate) : null,
      },
    });

    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    console.error("Failed to create game:", error);
    return NextResponse.json({ error: "Erro ao adicionar o jogo" }, { status: 500 });
  }
}
