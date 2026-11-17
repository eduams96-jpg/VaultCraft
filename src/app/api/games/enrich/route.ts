import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchHowLongToBeat } from "@/lib/hltb";

export async function GET() {
  try {
    const missingHltb = await prisma.game.count({
      where: { isWishlist: false, timeToBeat: null },
    });
    const missingGenres = await prisma.game.count({
      where: { isWishlist: false, genres: null },
    });
    const missingYear = await prisma.game.count({
      where: { isWishlist: false, releaseYear: null },
    });
    const totalToEnrich = await prisma.game.count({
      where: {
        isWishlist: false,
        OR: [{ timeToBeat: null }, { genres: null }, { releaseYear: null }],
      },
    });

    return NextResponse.json({
      missingHltb,
      missingGenres,
      missingYear,
      totalToEnrich,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao consultar pendências" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const limit = Math.min(body.limit || 30, 100);

    const games = await prisma.game.findMany({
      where: {
        OR: [{ timeToBeat: null }, { genres: null }, { releaseYear: null }],
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
    });

    let updatedCount = 0;

    for (const game of games) {
      const updates: { genres?: string; releaseYear?: number; timeToBeat?: string } = {};

      const appIdMatch = game.coverUrl?.match(/\/apps\/(\d+)\//);
      const appId = appIdMatch ? appIdMatch[1] : null;

      // Fetch Steam Store info if missing genres or releaseYear
      if (appId && (!game.genres || !game.releaseYear)) {
        try {
          const res = await fetch(
            `https://store.steampowered.com/api/appdetails?appids=${appId}&l=portuguese`,
            { signal: AbortSignal.timeout(5000) }
          );
          if (res.ok) {
            const data = await res.json();
            if (data[appId]?.success && data[appId]?.data) {
              const d = data[appId].data;
              if (!game.genres && d.genres) {
                updates.genres = d.genres.map((g: { description: string }) => g.description).join(", ");
              }
              if (!game.releaseYear && d.release_date?.date) {
                const yMatch = d.release_date.date.match(/\b(19\d\d|20\d\d)\b/);
                if (yMatch) updates.releaseYear = parseInt(yMatch[1], 10);
              }
            }
          }
        } catch {
          // ignore error
        }
      }

      // Fetch HLTB if missing
      if (!game.timeToBeat) {
        const hltb = await fetchHowLongToBeat(game.title);
        if (hltb?.formattedTime) {
          updates.timeToBeat = hltb.formattedTime;
        }
      }

      if (Object.keys(updates).length > 0) {
        await prisma.game.update({
          where: { id: game.id },
          data: updates,
        });
        updatedCount++;
      }
    }

    const remaining = await prisma.game.count({
      where: {
        OR: [{ timeToBeat: null }, { genres: null }, { releaseYear: null }],
      },
    });

    return NextResponse.json({
      success: true,
      message: `${updatedCount} jogos enriquecidos com dados oficiais!`,
      processed: games.length,
      updated: updatedCount,
      remaining,
    });
  } catch (error) {
    console.error("Enrichment error:", error);
    return NextResponse.json(
      { error: "Erro ao enriquecer jogos." },
      { status: 500 }
    );
  }
}
