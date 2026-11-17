import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeTitleForComparison } from "@/lib/gameNormalization";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const identifier = body.identifier?.trim() || "perfil-exemplo";

    const xmlUrl = identifier.match(/^\d{17}$/)
      ? `https://steamcommunity.com/profiles/${identifier}/games/?tab=all&xml=1`
      : `https://steamcommunity.com/id/${identifier}/games/?tab=all&xml=1`;

    const res = await fetch(xmlUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
      },
      signal: AbortSignal.timeout(8000),
    });

    const bodyText = await res.text();
    const isXmlSuccess = bodyText.includes("<gamesList>") && bodyText.includes("<games>");

    if (!isXmlSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: `Não foi possível ler os jogos da Steam para "${identifier}". Confirma se o perfil e os detalhes dos jogos estão definidos como Públicos.`,
        },
        { status: 400 }
      );
    }

    // Extract all games from XML
    const gameMatches = [...bodyText.matchAll(/<game>([\s\S]*?)<\/game>/g)];
    const steamGames: Array<{ appId: number; title: string; hours: number }> = [];

    for (const match of gameMatches) {
      const chunk = match[1];
      const appIdMatch = chunk.match(/<appID>(\d+)<\/appID>/);
      const nameMatch =
        chunk.match(/<name><!\[CDATA\[(.*?)\]\]><\/name>/) ||
        chunk.match(/<name>(.*?)<\/name>/);
      const hoursMatch = chunk.match(/<hoursOnRecord>(.*?)<\/hoursOnRecord>/);

      if (appIdMatch && nameMatch) {
        const appId = parseInt(appIdMatch[1], 10);
        const title = nameMatch[1].trim();
        const rawHours = hoursMatch ? hoursMatch[1].replace(",", ".") : "0";
        const hours = parseFloat(rawHours) || 0;
        steamGames.push({ appId, title, hours });
      }
    }

    if (steamGames.length === 0) {
      return NextResponse.json({
        success: true,
        updatedCount: 0,
        totalChecked: 0,
        message: "Nenhum jogo encontrado no perfil público da Steam.",
      });
    }

    // Fetch existing games from DB
    const dbGames = await prisma.game.findMany({
      where: { isWishlist: false },
      select: { id: true, title: true, coverUrl: true, hoursPlayed: true, originType: true },
    });

    // Build lookup maps: by appId and by normalized title
    const gamesByAppId = new Map<number, typeof dbGames[0]>();
    const gamesByNormTitle = new Map<string, typeof dbGames[0]>();

    for (const g of dbGames) {
      const match = g.coverUrl?.match(/\/apps\/(\d+)\//);
      if (match) {
        gamesByAppId.set(parseInt(match[1], 10), g);
      }
      gamesByNormTitle.set(normalizeTitleForComparison(g.title), g);
    }

    let updatedCount = 0;

    for (const sg of steamGames) {
      // Find matching game in DB
      const targetGame =
        gamesByAppId.get(sg.appId) ||
        gamesByNormTitle.get(normalizeTitleForComparison(sg.title));

      if (targetGame) {
        // If hours changed or increased, update
        if (targetGame.hoursPlayed !== sg.hours) {
          await prisma.game.update({
            where: { id: targetGame.id },
            data: { hoursPlayed: sg.hours },
          });
          updatedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      totalChecked: steamGames.length,
      message:
        updatedCount > 0
          ? `${updatedCount} jogos da Steam sincronizados com novas horas de jogo!`
          : "Todas as horas de jogo da Steam já estavam perfeitamente atualizadas!",
    });
  } catch (error) {
    console.error("Erro na sincronização de horas Steam:", error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : "") || "Erro ao comunicar com a Steam API." },
      { status: 500 }
    );
  }
}
