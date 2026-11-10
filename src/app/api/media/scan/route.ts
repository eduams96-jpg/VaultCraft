import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Clean video release title from torrent/scene tags
function cleanMediaTitle(raw: string): { title: string; year?: number; quality?: string; season?: number } {
  // Strip extension
  let name = raw.replace(/\.(mkv|mp4|avi|mov|wmv|m4v|iso)$/i, "");
  
  // Replace dots, underscores, dashes with space
  name = name.replace(/[._]/g, " ");

  // Extract 4-digit year (1950 - 2030)
  let year: number | undefined;
  const yearMatch = name.match(/\b(19\d\d|20\d\d)\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10);
  }

  // Detect season / episode (e.g. S01 or S01E02)
  let season: number | undefined;
  const seasonMatch = name.match(/\bS(\d{1,2})\b/i);
  if (seasonMatch) {
    season = parseInt(seasonMatch[1], 10);
  }

  // Detect quality
  let quality = "1080p Web-DL";
  if (/2160p|4k|uhd/i.test(name)) {
    quality = /remux/i.test(name) ? "4K HDR" : "4K HDR";
  } else if (/remux/i.test(name)) {
    quality = "1080p Remux";
  } else if (/1080p/i.test(name)) {
    quality = /bluray/i.test(name) ? "1080p Remux" : "1080p Web-DL";
  } else if (/720p/i.test(name)) {
    quality = "720p";
  } else if (/bluray/i.test(name)) {
    quality = "Blu-Ray";
  }

  // Remove release clutter from title
  const stopWords = [
    /\b(2160p|1080p|720p|480p|4k|uhd|hdr|hdr10|dv|dolby\s*vision)\b/gi,
    /\b(bluray|blu-ray|remux|web-dl|webrip|web|hdtv|bdrip|dvdrip)\b/gi,
    /\b(x264|x265|hevc|h264|h265|avc|10bit|8bit)\b/gi,
    /\b(dts|dts-hd|truehd|atmos|ddp|dd5\.1|aac|ac3|flac|mp3)\b/gi,
    /\b(repack|proper|unrated|extended|directors\s*cut|imax)\b/gi,
    /\b(s\d{1,2}(?:e\d{1,2})?|season\s*\d{1,2}|complete)\b/gi,
    /\b(rarbg|yts|yify|eztv|galaxyrg|sparks|amzn|nf|hbo|disney)\b/gi,
    /\[[^\]]*\]/g,
    /\([^\)]*\)/g,
  ];

  let cleaned = name;
  for (const regex of stopWords) {
    cleaned = cleaned.replace(regex, " ");
  }

  // If year was found, cut off everything after year
  if (yearMatch && yearMatch.index !== undefined) {
    const beforeYear = name.slice(0, yearMatch.index).trim();
    if (beforeYear.length >= 2) {
      cleaned = beforeYear;
    }
  }

  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return {
    title: cleaned || raw,
    year,
    quality,
    season,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const folderPath = body.folderPath?.trim();
    const defaultType = body.defaultType || "MOVIE"; // MOVIE, SERIES, ANIMATION_MOVIE, etc.

    if (!folderPath) {
      return NextResponse.json({ error: "O caminho da pasta é obrigatório." }, { status: 400 });
    }

    if (!fs.existsSync(folderPath)) {
      return NextResponse.json({ error: "A pasta especificada não existe no sistema." }, { status: 404 });
    }

    const entries = fs.readdirSync(folderPath, { withFileTypes: true });

    // Filter relevant video files or subfolders
    const validVideoExts = new Set([".mkv", ".mp4", ".avi", ".mov", ".m4v", ".ts"]);
    const rawCandidates: { name: string; fullPath: string; isFolder: boolean }[] = [];

    for (const entry of entries) {
      // Ignore hidden files and system directories
      if (entry.name.startsWith(".") || entry.name.startsWith("$")) continue;

      const fullPath = path.join(folderPath, entry.name);

      if (entry.isDirectory()) {
        rawCandidates.push({ name: entry.name, fullPath, isFolder: true });
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (validVideoExts.has(ext)) {
          // If video file is larger than 100MB (ignore tiny sample files)
          try {
            const stat = fs.statSync(fullPath);
            if (stat.size > 100 * 1024 * 1024) {
              rawCandidates.push({ name: entry.name, fullPath, isFolder: false });
            }
          } catch {
            rawCandidates.push({ name: entry.name, fullPath, isFolder: false });
          }
        }
      }
    }

    // Limit to first 40 to avoid rate limits
    const candidates = rawCandidates.slice(0, 40);

    // Clean names and attempt fast online lookup for posters & official metadata
    const items = await Promise.all(
      candidates.map(async (c, index) => {
        const parsed = cleanMediaTitle(c.name);

        let finalTitle = parsed.title;
        let releaseYear = parsed.year || null;
        let posterUrl: string | null = null;
        let cast: string | null = null;
        let guessedType = defaultType;

        if (parsed.season && (defaultType === "MOVIE" || defaultType === "SERIES")) {
          guessedType = "SERIES";
        }

        // Fast IMDb online lookup
        try {
          const cleanQuery = parsed.title.toLowerCase().replace(/[^a-z0-9 ]/gi, "_");
          const imdbRes = await fetch(
            `https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(cleanQuery)}.json`,
            { signal: AbortSignal.timeout(3000), headers: { "User-Agent": "Mozilla/5.0" } }
          );

          if (imdbRes.ok) {
            const data = await imdbRes.json();
            const first = (data.d || []).find((x: any) => x.id && x.l);
            if (first) {
              finalTitle = first.l;
              if (first.y) releaseYear = first.y;
              if (first.i?.imageUrl) posterUrl = first.i.imageUrl;
              if (first.s) cast = first.s;
            }
          }
        } catch {}

        return {
          id: `scan-${index}-${Date.now()}`,
          rawName: c.name,
          title: finalTitle,
          type: guessedType,
          status: "PLAN_TO_WATCH",
          releaseYear,
          quality: parsed.quality,
          storageLocation: c.fullPath,
          posterUrl,
          cast,
          currentSeason: parsed.season || 1,
          currentEpisode: 0,
          totalSeasons: 1,
          isFolder: c.isFolder,
        };
      })
    );

    return NextResponse.json({
      folderPath,
      totalFound: candidates.length,
      items,
    });
  } catch (error: any) {
    console.error("Folder scan error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
