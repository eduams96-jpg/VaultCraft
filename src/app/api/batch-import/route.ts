import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  cleanRawGameTitle,
  checkIsDuplicateGame,
  normalizeTitleForComparison,
  type ExistingGameRef,
} from "@/lib/gameNormalization";
import { fetchHowLongToBeat } from "@/lib/hltb";
import { extractCleanGenres } from "@/lib/genreExtractor";

export { cleanRawGameTitle };

// 1. Steam Store & Community API Lookup
async function fetchSteamMetadata(title: string) {
  try {
    const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(
      title
    )}&l=english&cc=US`;

    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
      },
      signal: AbortSignal.timeout(3500),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const topMatch = data.items[0];
        const appId = topMatch.id;
        const finalTitle = topMatch.name || title;
        const coverUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`;
        const bannerUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;

        let releaseYear: number | null = null;
        let genres: string | null = null;
        let diskSpace: string | null = null;
        let screenshots: string | null = null;

        try {
          const detailRes = await fetch(
            `https://store.steampowered.com/api/appdetails?appids=${appId}`,
            {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              },
              signal: AbortSignal.timeout(2000),
            }
          );
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            if (detailData[appId]?.success && detailData[appId]?.data) {
              const appData = detailData[appId].data;
              if (appData.release_date?.date) {
                const ym = appData.release_date.date.match(/\b(19\d\d|20\d\d)\b/);
                if (ym) releaseYear = parseInt(ym[0], 10);
              }
              if (Array.isArray(appData.genres)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                genres = appData.genres.map((g: any) => g.description).join(", ");
              }
              if (Array.isArray(appData.screenshots) && appData.screenshots.length > 0) {
                screenshots = appData.screenshots
                  .slice(0, 4)
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .map((s: any) => s.path_full)
                  .filter(Boolean)
                  .join(", ");
              }
              if (appData.pc_requirements?.minimum) {
                const sm = appData.pc_requirements.minimum.match(/(?:Storage|Hard Drive):\s*([^<]+)/i);
                if (sm) diskSpace = sm[1].trim();
              }
            }
          }
        } catch {
          // ignore detail error
        }

        return {
          source: "steam",
          finalTitle,
          coverUrl,
          bannerUrl,
          releaseYear,
          genres,
          diskSpace,
          screenshots,
        };
      }
    }
  } catch {
    // Steam lookup error, fallback
  }

  return null;
}

// 2. Wikipedia Summary API with polite User-Agent
async function fetchWikipediaMetadata(title: string) {
  try {
    const cleanSearch = title.replace(/[!:]/g, " ").replace(/\s+/g, " ").trim();
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      cleanSearch
    )}`;

    const sumRes = await fetch(summaryUrl, {
      headers: {
        "User-Agent": "GameTrackerVault/1.0 (mailto:gametracker@local.dev)",
      },
      signal: AbortSignal.timeout(3000),
    });

    if (sumRes.ok) {
      const sumData = await sumRes.json();
      const coverUrl =
        sumData.originalimage?.source || sumData.thumbnail?.source || null;

      if (coverUrl) {
        let releaseYear: number | null = null;
        if (sumData.description) {
          const ym = sumData.description.match(/\b(19\d\d|20\d\d)\b/);
          if (ym) releaseYear = parseInt(ym[0], 10);
        }
        if (!releaseYear && sumData.extract) {
          const ym = sumData.extract.match(/\b(19\d\d|20\d\d)\b/);
          if (ym) releaseYear = parseInt(ym[0], 10);
        }

        const cleanWikiTitle = (sumData.title || title)
          .replace(/\s*\([^)]*video game[^)]*\)/i, "")
          .trim();

        const cleanGenres = extractCleanGenres(
          sumData.description,
          sumData.extract,
          cleanWikiTitle || title
        );

        return {
          source: "wikipedia",
          finalTitle: cleanWikiTitle || title,
          coverUrl,
          bannerUrl: null,
          releaseYear,
          genres: cleanGenres,
          diskSpace: null,
          screenshots: null,
        };
      }
    }

    // Try search query if direct summary was 404
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      cleanSearch + " video game"
    )}&format=json`;

    const searchRes = await fetch(searchUrl, {
      headers: {
        "User-Agent": "GameTrackerVault/1.0 (mailto:gametracker@local.dev)",
      },
      signal: AbortSignal.timeout(3000),
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.query?.search && searchData.query.search.length > 0) {
        const pageTitle = searchData.query.search[0].title;
        const pageUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          pageTitle
        )}`;

        const pageRes = await fetch(pageUrl, {
          headers: {
            "User-Agent": "GameTrackerVault/1.0 (mailto:gametracker@local.dev)",
          },
          signal: AbortSignal.timeout(3000),
        });

        if (pageRes.ok) {
          const pageData = await pageRes.json();
          const coverUrl =
            pageData.originalimage?.source || pageData.thumbnail?.source || null;

          if (coverUrl) {
            let releaseYear: number | null = null;
            if (pageData.description) {
              const ym = pageData.description.match(/\b(19\d\d|20\d\d)\b/);
              if (ym) releaseYear = parseInt(ym[0], 10);
            }

            const cleanWikiTitle = pageTitle.replace(/\s*\([^)]*video game[^)]*\)/i, "").trim();
            const cleanGenres = extractCleanGenres(
              pageData.description,
              pageData.extract,
              cleanWikiTitle || title
            );

            return {
              source: "wikipedia",
              finalTitle: cleanWikiTitle || title,
              coverUrl,
              bannerUrl: null,
              releaseYear,
              genres: cleanGenres,
              diskSpace: null,
              screenshots: null,
            };
          }
        }
      }
    }
  } catch {
    // Wikipedia fallback error
  }

  return null;
}

// 3. DuckDuckGo Dedicated Video Game Box Art Engine (Universal for Consoles, Localized PAL/PT & Retrô)
async function fetchDuckDuckGoCover(title: string, platform?: string) {
  try {
    const platQuery = platform && platform !== "PC" && platform !== "ALL" ? ` ${platform}` : "";
    const query = `${title}${platQuery} capa cover box art`;
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iax=images&ia=images`;

    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return null;
    const html = await res.text();
    const vqdMatch = html.match(/vqd=([0-9-]+)/);
    if (!vqdMatch) return null;

    const vqd = vqdMatch[1];
    const apiUrl = `https://duckduckgo.com/i.js?l=pt-pt&o=json&q=${encodeURIComponent(
      query
    )}&vqd=${vqd}`;

    const apiRes = await fetch(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://duckduckgo.com/",
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!apiRes.ok) return null;
    const data = await apiRes.json();

    if (data.results && data.results.length > 0) {
      const topHit = data.results[0];
      let releaseYear: number | null = null;
      const ym = (topHit.title || "").match(/\b(19\d\d|20\d\d)\b/);
      if (ym) releaseYear = parseInt(ym[1], 10);

      // Extract screenshots from next images
      const screenshots = data.results.length > 1
        ? data.results
            .slice(1, 5)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((r: any) => r.image)
            .filter(Boolean)
            .join(", ")
        : null;

      const genres = extractCleanGenres(null, null, title);

      return {
        source: "boxart",
        finalTitle: title,
        coverUrl: topHit.image || topHit.thumbnail,
        bannerUrl: null,
        releaseYear,
        genres,
        diskSpace: null,
        screenshots,
      };
    }
  } catch {
    // DDG search error, fallback
  }

  return null;
}

// Multi-Source Resolver with Official HLTB integration
async function resolveGameMetadata(cleanTitle: string, searchTitle: string, platform?: string) {
  const isConsole = platform && platform !== "PC" && platform !== "ALL";

  // Fetch official HLTB in parallel
  const hltbPromise = fetchHowLongToBeat(searchTitle || cleanTitle);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let meta: any = null;

  // For consoles or localized games: check Wikipedia with searchTitle first!
  if (isConsole || searchTitle !== cleanTitle) {
    const wiki = await fetchWikipediaMetadata(searchTitle);
    if (wiki?.coverUrl) {
      meta = wiki;
    } else {
      const boxArt = await fetchDuckDuckGoCover(cleanTitle, platform);
      if (boxArt?.coverUrl) {
        meta = boxArt;
      } else {
        const steam = await fetchSteamMetadata(searchTitle);
        meta = steam || wiki || boxArt;
      }
    }
  } else {
    // PC: Steam first
    const steam = await fetchSteamMetadata(cleanTitle);
    if (steam?.coverUrl) {
      meta = steam;
    } else {
      const boxArt = await fetchDuckDuckGoCover(cleanTitle, platform);
      if (boxArt?.coverUrl) {
        meta = boxArt;
      } else {
        const wiki = await fetchWikipediaMetadata(cleanTitle);
        meta = steam || boxArt || wiki;
      }
    }
  }

  const hltb = await hltbPromise.catch(() => null);

  if (!meta && !hltb) return null;

  return {
    source: meta?.source || (hltb ? "hltb" : "manual"),
    finalTitle: meta?.finalTitle || cleanTitle,
    coverUrl: meta?.coverUrl || hltb?.gameImage || null,
    bannerUrl: meta?.bannerUrl || null,
    releaseYear: meta?.releaseYear || null,
    genres: meta?.genres || extractCleanGenres(null, null, cleanTitle),
    diskSpace: meta?.diskSpace || null,
    screenshots: meta?.screenshots || null,
    timeToBeat: hltb?.formattedTime || null,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // MODE 1: Analyze & Detect without saving (Preview flow)
    if (body.mode === "analyze") {
      const rawLines: string[] = Array.isArray(body.titles)
        ? body.titles
        : typeof body.titles === "string"
        ? body.titles.split("\n")
        : [];

      // Fetch all existing games from DB once for fast high-precision duplicate checking
      const allDbGames: ExistingGameRef[] = await prisma.game.findMany({
        select: { id: true, title: true, platform: true },
      });

      const seenInBatch = new Set<string>();
      const results = [];

      for (const line of rawLines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.length < 2) continue;

        const {
          cleanTitle,
          searchTitle,
          detectedOrigin,
          detectedRepack,
          detectedPlatform,
          detectedYear,
        } = cleanRawGameTitle(trimmed);

        if (!cleanTitle) continue;

        const targetPlatform = detectedPlatform || body.defaultPlatform || "PC";

        // Check if duplicate in current batch or in database
        const normKey = `${targetPlatform.toLowerCase()}::${normalizeTitleForComparison(cleanTitle)}`;
        const isBatchDuplicate = seenInBatch.has(normKey);
        const dbDup = checkIsDuplicateGame(cleanTitle, targetPlatform, allDbGames);

        const isDuplicate = isBatchDuplicate || dbDup.isDuplicate;
        const duplicateReason = isBatchDuplicate
          ? "Duplicado na própria lista colada"
          : dbDup.reason;

        if (!isDuplicate) {
          seenInBatch.add(normKey);
        }

        // Search metadata with Multi-Source Engine (Steam + DDG BoxArt + Wikipedia)
        const meta = await resolveGameMetadata(cleanTitle, searchTitle, targetPlatform);

        // Polite delay of 120ms between queries to respect rate limits
        await new Promise((r) => setTimeout(r, 120));

        results.push({
          original: trimmed,
          cleanTitle: cleanTitle, // Keep user's chosen Portuguese or clean title
          coverUrl: meta?.coverUrl || null,
          bannerUrl: meta?.bannerUrl || null,
          releaseYear: meta?.releaseYear || detectedYear || null,
          genres: meta?.genres || null,
          diskSpace: meta?.diskSpace || null,
          screenshots: meta?.screenshots || null,
          timeToBeat: meta?.timeToBeat || null,
          metaSource: meta?.source || "manual",
          detectedOrigin: detectedOrigin || body.defaultOrigin || "STEAM",
          detectedRepack: detectedRepack || null,
          detectedPlatform: targetPlatform,
          isDuplicate,
          duplicateReason: isDuplicate ? duplicateReason : undefined,
          selected: !isDuplicate, // strictly unselected by default if duplicate
          isArchived: Boolean(body.defaultArchived),
          hasSavefile: Boolean(body.defaultHasSavefile),
          hasAchievements: Boolean(body.defaultHasAchievements),
          isPlatinum: Boolean(body.defaultIsPlatinum),
        });
      }

      return NextResponse.json({
        success: true,
        detectedGames: results,
      });
    }

    // MODE 2: Save verified items directly (from Preview)
    if (Array.isArray(body.games) && body.games.length > 0) {
      let importedCount = 0;
      let skippedCount = 0;
      const importedGames = [];

      // Fetch existing DB games once to check duplicates with normalization
      const allDbGames: ExistingGameRef[] = await prisma.game.findMany({
        select: { id: true, title: true, platform: true },
      });
      const seenInBatch = new Set<string>();

      for (const item of body.games) {
        if (!item.cleanTitle && !item.title) continue;
        const { cleanTitle, detectedPlatform, detectedYear } = cleanRawGameTitle(
          item.cleanTitle || item.title
        );
        const titleToSave = cleanTitle.trim();
        if (!titleToSave) continue;

        const targetPlatform =
          item.platform || item.detectedPlatform || detectedPlatform || body.platform || "PC";

        // Strict duplicate check against DB and current batch
        const normKey = `${targetPlatform.toLowerCase()}::${normalizeTitleForComparison(titleToSave)}`;
        if (seenInBatch.has(normKey)) {
          skippedCount++;
          continue;
        }

        const dbDup = checkIsDuplicateGame(titleToSave, targetPlatform, allDbGames);
        if (dbDup.isDuplicate) {
          skippedCount++;
          continue;
        }

        const isPlatinum = Boolean(item.isPlatinum || item.status === "PLATINUM");

        const created = await prisma.game.create({
          data: {
            title: titleToSave,
            platform: targetPlatform,
            originType: item.originType || item.detectedOrigin || body.originType || "STEAM",
            repackGroup: item.repackGroup?.trim() || item.detectedRepack || null,
            status: isPlatinum ? "PLATINUM" : (item.status || body.status || "BACKLOG"),
            coverUrl: item.coverUrl || null,
            bannerUrl: item.bannerUrl || null,
            releaseYear: item.releaseYear ? Number(item.releaseYear) : (detectedYear || null),
            genres: item.genres?.trim() || null,
            storageLocation: item.storageLocation?.trim() || null,
            executablePath: item.executablePath?.trim() || null,
            gameVersion: item.gameVersion?.trim() || null,
            diskSpace: item.diskSpace?.trim() || null,
            screenshots: item.screenshots?.trim() || null,
            timeToBeat: item.timeToBeat?.trim() || null,
            externalLink: item.externalLink?.trim() || null,
            customCategories: item.customCategories?.trim() || body.customCategories?.trim() || null,
            isInstalled: Boolean(item.isInstalled),
            isArchived: Boolean(item.isArchived ?? body.isArchived ?? false),
            hasSavefile: Boolean(item.hasSavefile ?? body.hasSavefile ?? false),
            hasAchievements: Boolean(item.hasAchievements ?? body.hasAchievements ?? false),
            isPlatinum,
          },
        });

        // Add created game to in-memory list to prevent duplicate insertion within same request
        allDbGames.push({ id: created.id, title: created.title, platform: created.platform });
        seenInBatch.add(normKey);

        importedCount++;
        importedGames.push(created);
      }

      return NextResponse.json({
        success: true,
        importedCount,
        skippedCount,
        message: `${importedCount} jogos guardados com sucesso (${skippedCount} ignorados por já existirem).`,
        games: importedGames,
      });
    }

    // MODE 3: Direct batch import from raw titles list
    const rawTitles: string[] = Array.isArray(body.titles)
      ? body.titles
      : typeof body.titles === "string"
      ? body.titles.split("\n")
      : [];

    const defaultPlatform = body.platform || "PC";
    const defaultOrigin = body.originType || "STEAM";
    const defaultStatus = body.status || "BACKLOG";
    const defaultArchived = Boolean(body.isArchived);
    const defaultHasSavefile = Boolean(body.hasSavefile);
    const defaultHasAchievements = Boolean(body.hasAchievements);
    const defaultIsPlatinum = Boolean(body.isPlatinum || defaultStatus === "PLATINUM");

    if (rawTitles.length === 0) {
      return NextResponse.json(
        { error: "Nenhum título fornecido para importação" },
        { status: 400 }
      );
    }

    let importedCount = 0;
    let skippedCount = 0;
    const importedGames = [];

    // Fetch existing games
    const allDbGames: ExistingGameRef[] = await prisma.game.findMany({
      select: { id: true, title: true, platform: true },
    });
    const seenInBatch = new Set<string>();

    for (const line of rawTitles) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length < 2) continue;

      const {
        cleanTitle,
        searchTitle,
        detectedOrigin,
        detectedRepack,
        detectedPlatform,
        detectedYear,
      } = cleanRawGameTitle(trimmed);

      if (!cleanTitle) continue;

      const targetPlatform = detectedPlatform || defaultPlatform;

      // Strict duplicate check against DB and current batch
      const normKey = `${targetPlatform.toLowerCase()}::${normalizeTitleForComparison(cleanTitle)}`;
      if (seenInBatch.has(normKey)) {
        skippedCount++;
        continue;
      }

      const dbDup = checkIsDuplicateGame(cleanTitle, targetPlatform, allDbGames);
      if (dbDup.isDuplicate) {
        skippedCount++;
        continue;
      }

      const meta = await resolveGameMetadata(cleanTitle, searchTitle, targetPlatform);
      await new Promise((r) => setTimeout(r, 120));

      const created = await prisma.game.create({
        data: {
          title: cleanTitle,
          platform: targetPlatform,
          originType: detectedOrigin || defaultOrigin,
          repackGroup: detectedRepack || null,
          status: defaultIsPlatinum ? "PLATINUM" : defaultStatus,
          coverUrl: meta?.coverUrl || null,
          bannerUrl: meta?.bannerUrl || null,
          releaseYear: meta?.releaseYear || detectedYear || null,
          genres: meta?.genres || null,
          diskSpace: meta?.diskSpace || null,
          screenshots: meta?.screenshots || null,
          timeToBeat: meta?.timeToBeat || null,
          customCategories: body.customCategories?.trim() || null,
          isInstalled: false,
          isArchived: defaultArchived,
          hasSavefile: defaultHasSavefile,
          hasAchievements: defaultHasAchievements,
          isPlatinum: defaultIsPlatinum,
        },
      });

      allDbGames.push({ id: created.id, title: created.title, platform: created.platform });
      seenInBatch.add(normKey);

      importedCount++;
      importedGames.push(created);
    }

    return NextResponse.json({
      success: true,
      importedCount,
      skippedCount,
      message: `${importedCount} jogos importados com sucesso (${skippedCount} ignorados por já existirem na biblioteca).`,
      games: importedGames,
    });
  } catch (error) {
    console.error("Batch import error:", error);
    return NextResponse.json(
      { error: "Erro na importação em lote" },
      { status: 500 }
    );
  }
}
