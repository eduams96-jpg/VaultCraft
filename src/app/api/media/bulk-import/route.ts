import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = body.items as any[];

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Nenhum item fornecido para importação." }, { status: 400 });
    }

    let createdCount = 0;

    for (const item of items) {
      if (!item.title || !item.title.trim()) continue;

      await prisma.mediaItem.create({
        data: {
          title: item.title.trim(),
          type: item.type || "MOVIE",
          status: item.status || "PLAN_TO_WATCH",
          rating: item.rating ? parseInt(item.rating, 10) : null,
          posterUrl: item.posterUrl?.trim() || null,
          releaseYear: item.releaseYear ? parseInt(item.releaseYear, 10) : null,
          genres: item.genres?.trim() || null,
          synopsis: item.synopsis?.trim() || null,
          cast: item.cast?.trim() || null,
          quality: item.quality?.trim() || "1080p Web-DL",
          storageLocation: item.storageLocation?.trim() || null,
          totalSeasons: item.totalSeasons ? parseInt(item.totalSeasons, 10) : 1,
          totalEpisodes: item.totalEpisodes ? parseInt(item.totalEpisodes, 10) : null,
          currentSeason: item.currentSeason ? parseInt(item.currentSeason, 10) : 1,
          currentEpisode: item.currentEpisode ? parseInt(item.currentEpisode, 10) : 0,
        },
      });

      createdCount++;
    }

    return NextResponse.json({
      success: true,
      createdCount,
      message: `${createdCount} títulos importados com sucesso para a tua coleção!`,
    });
  } catch (error: any) {
    console.error("Bulk import media error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
