import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // MOVIE, SERIES, ANIME or ALL
    const status = searchParams.get("status"); // PLAN_TO_WATCH, WATCHING, COMPLETED, etc.
    const search = searchParams.get("search");

    const where: any = {};

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { originalTitle: { contains: search.trim() } },
        { director: { contains: search.trim() } },
        { cast: { contains: search.trim() } },
        { genres: { contains: search.trim() } },
      ];
    }

    const items = await prisma.mediaItem.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error("GET /api/media error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "O título é obrigatório." }, { status: 400 });
    }

    const item = await prisma.mediaItem.create({
      data: {
        title: body.title.trim(),
        originalTitle: body.originalTitle?.trim() || null,
        type: body.type || "MOVIE",
        status: body.status || "PLAN_TO_WATCH",
        rating: body.rating ? parseInt(body.rating, 10) : null,
        posterUrl: body.posterUrl?.trim() || null,
        backdropUrl: body.backdropUrl?.trim() || null,
        releaseYear: body.releaseYear ? parseInt(body.releaseYear, 10) : null,
        genres: body.genres?.trim() || null,
        synopsis: body.synopsis?.trim() || null,
        director: body.director?.trim() || null,
        cast: body.cast?.trim() || null,
        durationMinutes: body.durationMinutes ? parseInt(body.durationMinutes, 10) : null,
        totalSeasons: body.totalSeasons ? parseInt(body.totalSeasons, 10) : 1,
        totalEpisodes: body.totalEpisodes ? parseInt(body.totalEpisodes, 10) : null,
        currentSeason: body.currentSeason ? parseInt(body.currentSeason, 10) : 1,
        currentEpisode: body.currentEpisode ? parseInt(body.currentEpisode, 10) : 0,
        quality: body.quality?.trim() || null,
        storageLocation: body.storageLocation?.trim() || null,
        sourceOrigin: body.sourceOrigin || "LOCAL",
        streamingService: body.streamingService?.trim() || null,
        isFavorite: Boolean(body.isFavorite),
        userReview: body.userReview?.trim() || null,
        customTags: body.customTags?.trim() || null,
        imdbId: body.imdbId?.trim() || null,
        tmdbId: body.tmdbId ? parseInt(body.tmdbId, 10) : null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/media error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
