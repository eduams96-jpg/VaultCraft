import { NextResponse } from "next/server";
import { fetchHowLongToBeat } from "@/lib/hltb";
import { extractCleanGenres } from "@/lib/genreExtractor";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const cleanQuery = query.trim();

    // Fetch official HowLongToBeat duration in parallel
    const hltbPromise = fetchHowLongToBeat(cleanQuery);

    // 1. Try Steam Store
    try {
      const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(
        cleanQuery
      )}&l=english&cc=US`;

      const res = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const data = await res.json();
        const items = (data.items || []).slice(0, 5);

        if (items.length > 0) {
          const hltbData = await hltbPromise.catch(() => null);

          const results = await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items.map(async (item: any) => {
              const appId = item.id;
              const libraryPoster = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`;
              const headerBanner = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;

              let releaseYear: number | undefined = undefined;
              let genres: string[] = [];
              let diskSpace: string | undefined = undefined;
              let pcRequirements: string | undefined = undefined;
              let screenshots: string | undefined = undefined;

              try {
                const detailRes = await fetch(
                  `https://store.steampowered.com/api/appdetails?appids=${appId}`,
                  {
                    headers: {
                      "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    },
                    signal: AbortSignal.timeout(2500),
                  }
                );
                if (detailRes.ok) {
                  const detailData = await detailRes.json();
                  if (detailData[appId]?.success && detailData[appId]?.data) {
                    const appData = detailData[appId].data;
                    if (appData.release_date?.date) {
                      const yearMatch = appData.release_date.date.match(/\b(19\d\d|20\d\d)\b/);
                      if (yearMatch) releaseYear = parseInt(yearMatch[0], 10);
                    }
                    if (Array.isArray(appData.genres)) {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      genres = appData.genres.map((g: any) => g.description);
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
                      const spaceMatch = appData.pc_requirements.minimum.match(
                        /(?:Storage|Hard Drive):\s*([^<]+)/i
                      );
                      if (spaceMatch) diskSpace = spaceMatch[1].trim();

                      const cleanReq = appData.pc_requirements.minimum
                        .replace(/<[^>]+>/g, "\n")
                        .replace(/&nbsp;/g, " ")
                        .replace(/\n\s*\n/g, "\n")
                        .trim();
                      if (cleanReq) pcRequirements = cleanReq;
                    }
                  }
                }
              } catch {
                // Ignore detail error
              }

              return {
                id: appId,
                name: item.name,
                releaseYear,
                genres,
                coverUrl: libraryPoster,
                bannerUrl: headerBanner,
                diskSpace,
                pcRequirements,
                screenshots,
                timeToBeat: hltbData?.formattedTime || undefined,
              };
            })
          );

          return NextResponse.json({ results });
        }
      }
    } catch {
      // Steam search failed, fallback to Box Art
    }

    // 2. Fallback: DuckDuckGo Game Box Art search (for Consoles, Retrô & Localized games)
    try {
      const q = `${cleanQuery} capa cover box art`;
      const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(q)}&t=h_&iax=images&ia=images`;

      const ddgRes = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (ddgRes.ok) {
        const html = await ddgRes.text();
        const vqdMatch = html.match(/vqd=([0-9-]+)/);
        if (vqdMatch) {
          const vqd = vqdMatch[1];
          const apiUrl = `https://duckduckgo.com/i.js?l=pt-pt&o=json&q=${encodeURIComponent(
            q
          )}&vqd=${vqd}`;

          const apiRes = await fetch(apiUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              Referer: "https://duckduckgo.com/",
            },
            signal: AbortSignal.timeout(4000),
          });

          if (apiRes.ok) {
            const data = await apiRes.json();
            const rawResults = data.results || [];
            if (rawResults.length > 0) {
              const hltbData = await hltbPromise.catch(() => null);

              // Extract screenshots from subsequent images in the search
              const candidateScreenshots = rawResults
                .slice(1, 5)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((r: any) => r.image)
                .filter(Boolean)
                .join(", ");

              // Auto-detect genres from query and title keywords
              const detectedGenre = extractCleanGenres(null, null, cleanQuery);

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const results = rawResults.slice(0, 4).map((r: any, idx: number) => {
                let releaseYear: number | undefined = undefined;
                const ym = (r.title || "").match(/\b(19\d\d|20\d\d)\b/);
                if (ym) releaseYear = parseInt(ym[1], 10);

                return {
                  id: `boxart-${idx}`,
                  name: cleanQuery,
                  releaseYear,
                  genres: detectedGenre ? [detectedGenre] : [],
                  coverUrl: r.image || r.thumbnail,
                  bannerUrl: null,
                  diskSpace: undefined,
                  pcRequirements: undefined,
                  screenshots: candidateScreenshots || undefined,
                  timeToBeat: hltbData?.formattedTime || undefined,
                };
              });

              if (results.length > 0) {
                return NextResponse.json({ results });
              }
            }
          }
        }
      }
    } catch {
      // DDG fallback failed
    }

    // 3. Fallback: Wikipedia Summary (for classic / encyclopedic titles)
    try {
      const cleanSearch = cleanQuery.replace(/[!:]/g, " ").replace(/\s+/g, " ").trim();
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanSearch)}`;

      const sumRes = await fetch(summaryUrl, {
        headers: { "User-Agent": "GameTrackerVault/1.0 (gametracker@local.dev)" },
        signal: AbortSignal.timeout(3000),
      });

      if (sumRes.ok) {
        const sumData = await sumRes.json();
        const coverUrl = sumData.originalimage?.source || sumData.thumbnail?.source;
        if (coverUrl) {
          let releaseYear: number | undefined = undefined;
          const ym = (sumData.description || sumData.extract || "").match(/\b(19\d\d|20\d\d)\b/);
          if (ym) releaseYear = parseInt(ym[1], 10);

          const hltbData = await hltbPromise.catch(() => null);
          const detectedGenre = extractCleanGenres(sumData.description, sumData.extract, cleanQuery);

          return NextResponse.json({
            results: [
              {
                id: `wiki-0`,
                name: sumData.title || cleanQuery,
                releaseYear,
                genres: detectedGenre ? [detectedGenre] : [],
                coverUrl,
                bannerUrl: null,
                diskSpace: undefined,
                pcRequirements: undefined,
                screenshots: undefined,
                timeToBeat: hltbData?.formattedTime || undefined,
              },
            ],
          });
        }
      }
    } catch {
      // Wikipedia fallback failed
    }

    return NextResponse.json({ results: [] });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Lookup error:", error);
    return NextResponse.json({ results: [], error: "Falha na pesquisa de metadados" });
  }
}
