import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const cleanQuery = query.trim().toLowerCase().replace(/[^a-z0-9 ]/gi, "_");
    const imdbUrl = `https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(cleanQuery)}.json`;

    const imdbRes = await fetch(imdbUrl, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!imdbRes.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await imdbRes.json();
    const rawItems = (data.d || []) as any[];

    // Map and filter out people/actors (keep movies and series)
    const validItems = rawItems
      .filter((item) => item.id && item.l && item.q)
      .slice(0, 8);

    const results = await Promise.all(
      validItems.map(async (item) => {
        const qid = (item.qid || "").toLowerCase();
        const q = (item.q || "").toLowerCase();

        let type: "MOVIE" | "SERIES" | "ANIME" = "MOVIE";
        if (
          qid.includes("tvseries") ||
          qid.includes("tvminiseries") ||
          q.includes("tv series") ||
          q.includes("series")
        ) {
          type = "SERIES";
        }

        const title = item.l;
        const releaseYear = item.y || (item.yr ? parseInt(item.yr.split("-")[0], 10) : null);
        const posterUrl = item.i?.imageUrl || null;
        const cast = item.s || null;
        let synopsis: string | null = null;
        let genres: string | null = null;
        let rating: number | null = null;
        let totalSeasons: number | null = type === "SERIES" ? 1 : null;

        // If series, fetch extra details from TVmaze
        if (type === "SERIES") {
          try {
            const tvRes = await fetch(
              `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}`,
              { signal: AbortSignal.timeout(3000) }
            );
            if (tvRes.ok) {
              const tvData = await tvRes.json();
              if (tvData.summary) {
                synopsis = tvData.summary.replace(/<[^>]*>/g, "").trim();
              }
              if (tvData.genres && tvData.genres.length > 0) {
                genres = tvData.genres.join(", ");
              }
              if (tvData.rating?.average) {
                rating = Math.round(tvData.rating.average);
              }
            }
          } catch {}
        }

        return {
          id: item.id,
          title,
          type,
          releaseYear,
          posterUrl,
          cast,
          synopsis,
          genres,
          rating,
          totalSeasons,
        };
      })
    );

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Media lookup error:", error);
    return NextResponse.json({ results: [], error: error.message }, { status: 500 });
  }
}
