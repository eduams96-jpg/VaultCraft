import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const game = await prisma.game.findUnique({
      where: { id },
    });

    if (!game) {
      return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
    }

    // 1. Try to find Steam AppID from coverUrl, bannerUrl or executable
    let appId: number | null = null;
    const matchCover = game.coverUrl?.match(/\/apps\/(\d+)\//);
    const matchBanner = game.bannerUrl?.match(/\/apps\/(\d+)\//);
    const matchExe = game.executablePath?.match(/rungameid\/(\d+)/);

    if (matchCover) appId = parseInt(matchCover[1], 10);
    else if (matchBanner) appId = parseInt(matchBanner[1], 10);
    else if (matchExe) appId = parseInt(matchExe[1], 10);

    // If no AppID but is a PC/Steam game, search Steam Store
    if (!appId && (game.platform === "PC" || game.originType === "STEAM")) {
      try {
        const searchRes = await fetch(
          `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(game.title)}&l=portuguese&cc=pt`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (searchRes.ok) {
          const sData = await searchRes.json();
          if (sData.items && sData.items.length > 0) {
            appId = sData.items[0].id;
          }
        }
      } catch {}
    }

    // If game has Steam AppID, check official Steam Announcements / Patch notes
    if (appId) {
      try {
        const newsRes = await fetch(
          `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${appId}&count=6&maxlength=400&feeds=steam_community_announcements&format=json`,
          {
            signal: AbortSignal.timeout(6000),
            headers: { "User-Agent": "Mozilla/5.0" },
          }
        );

        if (newsRes.ok) {
          const newsData = await newsRes.json();
          const items = newsData.appnews?.newsitems || [];

          if (items.length > 0) {
            // Find first item that looks like a patch or announcement
            const latestItem = items[0];
            const patchDate = new Date(latestItem.date * 1000);
            const patchTitle = latestItem.title;
            const patchUrl = latestItem.url;

            // Extract version string (e.g. "Patch 5.01", "v1.2.3", "Update 2.1")
            const verMatch = patchTitle.match(
              /(?:v|ver|version|update|patch|hotfix)\s*([0-9]+(?:\.[0-9]+)+[a-z]?)/i
            );
            const detectedVersion = verMatch ? verMatch[1] : null;

            // Determine if outdated
            let isUpToDate: boolean | null = null;
            if (game.versionDate) {
              const userDate = new Date(game.versionDate);
              isUpToDate = userDate.getTime() >= patchDate.getTime();
            } else if (game.gameVersion && detectedVersion) {
              isUpToDate =
                game.gameVersion.toLowerCase().replace(/^v/, "") ===
                detectedVersion.toLowerCase().replace(/^v/, "");
            }

            const now = Date.now();
            const daysSinceUpdate = Math.max(
              0,
              Math.floor((now - patchDate.getTime()) / (1000 * 60 * 60 * 24))
            );
            const monthsSinceUpdate = Math.floor(daysSinceUpdate / 30);

            // Update DB with latest information
            const updatedGame = await prisma.game.update({
              where: { id: game.id },
              data: {
                latestPatchTitle: patchTitle,
                latestPatchNotesUrl: patchUrl,
                latestVersionDate: patchDate,
                latestKnownVersion: detectedVersion || patchTitle,
                isUpToDate,
              },
            });

            return NextResponse.json({
              success: true,
              source: "steam_announcements",
              appId,
              latestPatchTitle: patchTitle,
              latestVersionDate: patchDate.toISOString(),
              latestPatchNotesUrl: patchUrl,
              latestKnownVersion: detectedVersion || patchTitle,
              daysSinceUpdate,
              monthsSinceUpdate,
              isUpToDate,
              game: updatedGame,
              message:
                daysSinceUpdate < 7
                  ? `Novo patch lançado há ${daysSinceUpdate} dias: "${patchTitle}"`
                  : monthsSinceUpdate >= 12
                  ? `Jogo estável! Último update foi há ${Math.floor(monthsSinceUpdate / 12)} anos (${patchDate.toISOString().split("T")[0]}).`
                  : `Último update oficial: há ${monthsSinceUpdate} meses (${patchDate.toISOString().split("T")[0]}).`,
            });
          }
        }
      } catch (err) {
        console.error("Steam news fetch error:", err);
      }
    }

    // Fallback for non-Steam or offline games: calculate from user versionDate
    if (game.versionDate) {
      const vDate = new Date(game.versionDate);
      const daysSince = Math.max(
        0,
        Math.floor((Date.now() - vDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      const monthsSince = Math.floor(daysSince / 30);

      return NextResponse.json({
        success: true,
        source: "local_record",
        gameVersion: game.gameVersion,
        versionDate: game.versionDate,
        daysSinceUpdate: daysSince,
        monthsSinceUpdate: monthsSince,
        isUpToDate: true,
        message:
          monthsSince >= 12
            ? `Versão ${game.gameVersion || "instalada"} sem updates registados há ${Math.floor(monthsSince / 12)} anos. Jogo estável e final.`
            : `Versão ${game.gameVersion || "instalada"} atualizada há ${monthsSince} meses.`,
      });
    }

    return NextResponse.json({
      success: false,
      message:
        "Nenhuma versão registada e não foi possível localizar anúncios oficiais de atualização na Steam.",
    });
  } catch (error) {
    console.error("Error checking game update:", error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : "") || "Erro ao verificar atualizações do jogo." },
      { status: 500 }
    );
  }
}
