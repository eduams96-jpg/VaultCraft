import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const item = await prisma.mediaItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error: any) {
    console.error("GET /api/media/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json();

    const existing = await prisma.mediaItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
    }

    const updated = await prisma.mediaItem.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.originalTitle !== undefined && { originalTitle: body.originalTitle?.trim() || null }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.rating !== undefined && { rating: body.rating ? parseInt(body.rating, 10) : null }),
        ...(body.posterUrl !== undefined && { posterUrl: body.posterUrl?.trim() || null }),
        ...(body.backdropUrl !== undefined && { backdropUrl: body.backdropUrl?.trim() || null }),
        ...(body.releaseYear !== undefined && { releaseYear: body.releaseYear ? parseInt(body.releaseYear, 10) : null }),
        ...(body.genres !== undefined && { genres: body.genres?.trim() || null }),
        ...(body.synopsis !== undefined && { synopsis: body.synopsis?.trim() || null }),
        ...(body.director !== undefined && { director: body.director?.trim() || null }),
        ...(body.cast !== undefined && { cast: body.cast?.trim() || null }),
        ...(body.durationMinutes !== undefined && { durationMinutes: body.durationMinutes ? parseInt(body.durationMinutes, 10) : null }),
        ...(body.totalSeasons !== undefined && { totalSeasons: body.totalSeasons ? parseInt(body.totalSeasons, 10) : 1 }),
        ...(body.totalEpisodes !== undefined && { totalEpisodes: body.totalEpisodes ? parseInt(body.totalEpisodes, 10) : null }),
        ...(body.currentSeason !== undefined && { currentSeason: body.currentSeason ? parseInt(body.currentSeason, 10) : 1 }),
        ...(body.currentEpisode !== undefined && { currentEpisode: body.currentEpisode ? parseInt(body.currentEpisode, 10) : 0 }),
        ...(body.quality !== undefined && { quality: body.quality?.trim() || null }),
        ...(body.storageLocation !== undefined && { storageLocation: body.storageLocation?.trim() || null }),
        ...(body.sourceOrigin !== undefined && { sourceOrigin: body.sourceOrigin }),
        ...(body.streamingService !== undefined && { streamingService: body.streamingService?.trim() || null }),
        ...(body.isFavorite !== undefined && { isFavorite: Boolean(body.isFavorite) }),
        ...(body.userReview !== undefined && { userReview: body.userReview?.trim() || null }),
        ...(body.customTags !== undefined && { customTags: body.customTags?.trim() || null }),
        ...(body.completionDate !== undefined && { completionDate: body.completionDate ? new Date(body.completionDate) : null }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/media/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    await prisma.mediaItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/media/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
