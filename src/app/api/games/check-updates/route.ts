import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const limit = Math.min(body.limit || 20, 50);

    // Prioritize games that haven't been checked or with Steam AppIDs
    const games = await prisma.game.findMany({
      where: {
        isWishlist: false,
        platform: "PC",
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
    });

    let checkedCount = 0;
    let updatesFoundCount = 0;

    for (const game of games) {
      let appId: number | null = null;
      const matchCover = game.coverUrl?.match(/\/apps\/(\d+)\//);
      if (matchCover) appId = parseInt(matchCover[1], 10);

      if (!appId) continue;

      try {
        const newsRes = await fetch(
          `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${appId}&count=3&maxlength=300&feeds=steam_community_announcements&format=json`,
          {
            signal: AbortSignal.timeout(4000),
            headers: { "User-Agent": "Mozilla/5.0" },
          }
        );

        if (newsRes.ok) {
          const newsData = await newsRes.json();
          const items = newsData.appnews?.newsitems || [];
          if (items.length > 0) {
            const latest = items[0];
            const patchDate = new Date(latest.date * 1000);
            const patchTitle = latest.title;
            const patchUrl = latest.url;

            const verMatch = patchTitle.match(
              /(?:v|ver|version|update|patch|hotfix)\s*([0-9]+(?:\.[0-9]+)+[a-z]?)/i
            );
            const detectedVersion = verMatch ? verMatch[1] : null;

            let isUpToDate: boolean | null = null;
            if (game.versionDate) {
              isUpToDate = new Date(game.versionDate).getTime() >= patchDate.getTime();
            }

            if (isUpToDate === false) {
              updatesFoundCount++;
            }

            await prisma.game.update({
              where: { id: game.id },
              data: {
                latestPatchTitle: patchTitle,
                latestPatchNotesUrl: patchUrl,
                latestVersionDate: patchDate,
                latestKnownVersion: detectedVersion || patchTitle,
                isUpToDate,
              },
            });
            checkedCount++;
          }
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      checkedCount,
      updatesFoundCount,
      message: `${checkedCount} jogos verificados com a Steam API. (${updatesFoundCount} com patches mais recentes disponíveis)`,
    });
  } catch (error) {
    console.error("Bulk check updates error:", error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : "") || "Erro ao verificar atualizações em lote." },
      { status: 500 }
    );
  }
}
