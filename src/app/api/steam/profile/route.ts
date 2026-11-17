import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkIsDuplicateGame, normalizeTitleForComparison, type ExistingGameRef } from "@/lib/gameNormalization";
import { fetchHowLongToBeat } from "@/lib/hltb";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const identifier = searchParams.get("id")?.trim() || "";
  if (!identifier) {
    return NextResponse.json({ error: "Indica o ID público da Steam (nome do perfil ou número de 17 dígitos)." }, { status: 400 });
  }

  try {
    // 1. Try public XML endpoint
    const xmlUrl = identifier.match(/^\d{17}$/)
      ? `https://steamcommunity.com/profiles/${identifier}/games/?tab=all&xml=1`
      : `https://steamcommunity.com/id/${identifier}/games/?tab=all&xml=1`;

    const res = await fetch(xmlUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
      },
      signal: AbortSignal.timeout(5000),
    });

    const bodyText = await res.text();
    const isXmlSuccess = bodyText.includes("<gamesList>") && bodyText.includes("<games>");

    const detectedList: Array<{
      appId: number;
      title: string;
      hoursPlayed?: number;
      coverUrl?: string;
      bannerUrl?: string;
    }> = [];

    if (isXmlSuccess) {
      // Parse games from XML
      const gameMatches = [...bodyText.matchAll(/<game>([\s\S]*?)<\/game>/g)];
      for (const match of gameMatches) {
        const chunk = match[1];
        const appIdMatch = chunk.match(/<appID>(\d+)<\/appID>/);
        const nameMatch = chunk.match(/<name><!\[CDATA\[(.*?)\]\]><\/name>/) || chunk.match(/<name>(.*?)<\/name>/);
        const hoursMatch = chunk.match(/<hoursOnRecord>(.*?)<\/hoursOnRecord>/);

        if (appIdMatch && nameMatch) {
          const appId = parseInt(appIdMatch[1], 10);
          detectedList.push({
            appId,
            title: nameMatch[1].trim(),
            hoursPlayed: hoursMatch ? parseFloat(hoursMatch[1].replace(",", ".")) : 0,
            coverUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`,
            bannerUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
          });
        }
      }

      return NextResponse.json({
        success: true,
        source: "steam_xml",
        isRestricted: false,
        total: detectedList.length,
        games: detectedList,
        message: `${detectedList.length} jogos carregados diretamente da biblioteca Steam pública.`,
      });
    }

    // 2. Perfil privado: não há fallback. A app não inventa jogos para perfis que não lê.
    return NextResponse.json({
      success: false,
      isRestricted: true,
      total: 0,
      games: [],
      message: `A biblioteca Steam de "${identifier}" está privada. Define os detalhes dos jogos como Públicos na Steam e tenta de novo.`,
    });
  } catch (error) {
    console.error("Steam profile fetch error:", error);
    return NextResponse.json(
      { error: "Erro ao comunicar com a Steam Community API." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const gamesToImport = Array.isArray(body.games) ? body.games : [];
    if (gamesToImport.length === 0) {
      return NextResponse.json({ error: "Nenhum jogo recebido para importar." }, { status: 400 });
    }
    const defaultStatus = body.status || "AVAILABLE";

    const allDbGames: ExistingGameRef[] = await prisma.game.findMany({
      select: { id: true, title: true, platform: true },
    });
    const seenInBatch = new Set<string>();

    let importedCount = 0;
    let skippedCount = 0;
    const importedGames = [];

    for (const g of gamesToImport) {
      const title = (g.title || g.fallbackTitle || "").trim();
      const appId = g.appId;
      if (!title) continue;

      const normKey = `pc::${normalizeTitleForComparison(title)}`;
      if (seenInBatch.has(normKey)) {
        skippedCount++;
        continue;
      }

      const dupCheck = checkIsDuplicateGame(title, "PC", allDbGames);
      if (dupCheck.isDuplicate) {
        skippedCount++;
        continue;
      }

      // Fetch live store metadata and price
      let liveTitle = title;
      let releaseYear: number | null = null;
      let genres: string | null = null;
      let diskSpace: string | null = null;
      let screenshots: string | null = null;

      try {
        const detailRes = await fetch(
          `https://store.steampowered.com/api/appdetails?appids=${appId}&l=portuguese&cc=pt`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            signal: AbortSignal.timeout(3000),
          }
        );
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          if (detailData[appId]?.success && detailData[appId]?.data) {
            const data = detailData[appId].data;
            if (data.name) liveTitle = data.name;
            if (data.release_date?.date) {
              const ym = data.release_date.date.match(/\b(19\d\d|20\d\d)\b/);
              if (ym) releaseYear = parseInt(ym[0], 10);
            }
            if (Array.isArray(data.genres)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              genres = data.genres.map((gen: any) => gen.description).join(", ");
            }
            if (Array.isArray(data.screenshots)) {
              screenshots = data.screenshots
                .slice(0, 4)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((s: any) => s.path_full)
                .join(", ");
            }
            if (data.pc_requirements?.minimum) {
              const sm = data.pc_requirements.minimum.match(/(?:Armazenamento|Espaço|Storage|Hard Drive):\s*([^<]+)/i);
              if (sm) diskSpace = sm[1].trim();
            }
          }
        }
      } catch {
        // use defaults
      }

      // Lookup HLTB duration
      const hltb = await fetchHowLongToBeat(liveTitle);

      const coverUrl =
        g.coverUrl ||
        `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`;
      const bannerUrl =
        g.bannerUrl ||
        `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;

      const created = await prisma.game.create({
        data: {
          title: liveTitle,
          platform: "PC",
          originType: "STEAM",
          status: defaultStatus,
          coverUrl,
          bannerUrl,
          releaseYear,
          genres,
          diskSpace,
          screenshots,
          timeToBeat: hltb ? `${hltb.mainHours}h (História) / ${hltb.completeHours}h (100%)` : null,
          hoursPlayed: g.hoursPlayed || 0,
          isInstalled: false,
          isArchived: false,
          hasSavefile: false,
          hasAchievements: true,
          isPlatinum: false,
          isWishlist: false,
        },
      });

      allDbGames.push({ id: created.id, title: created.title, platform: created.platform });
      seenInBatch.add(normKey);
      importedCount++;
      importedGames.push(created);

      await new Promise((r) => setTimeout(r, 60));
    }

    return NextResponse.json({
      success: true,
      importedCount,
      skippedCount,
      message: `${importedCount} jogos da Steam importados com sucesso para a coleção (${skippedCount} ignorados por duplicado).`,
      games: importedGames,
    });
  } catch (error) {
    console.error("Steam import error:", error);
    return NextResponse.json(
      { error: "Erro ao importar jogos da Steam." },
      { status: 500 }
    );
  }
}
