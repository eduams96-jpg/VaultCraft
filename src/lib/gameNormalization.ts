/**
 * Game title sanitization, normalization, and duplicate detection engine.
 */

// Known localized and franchise aliases (cross-language matching)
const CANONICAL_FRANCHISE_MAP: Record<string, string> = {
  // Buzz! series (PT-PT <-> EN)
  buzzoquizmusica: "buzzthemusicquiz",
  buzzoquizmusical: "buzzthemusicquiz",
  buzzthemusicquiz: "buzzthemusicquiz",

  buzzograndezquiz: "buzzthebigquiz",
  buzzogrande: "buzzthebigquiz",
  buzzograndequiz: "buzzthebigquiz",
  buzzthebigquiz: "buzzthebigquiz",

  buzzoquizdesportivo: "buzzthesportsquiz",
  buzzthesportsquiz: "buzzthesportsquiz",

  buzzomegaquiz: "buzzthemegaquiz",
  buzzthemegaquiz: "buzzthemegaquiz",

  buzzhollywood: "buzzthehollywoodquiz",
  buzzthehollywoodquiz: "buzzthehollywoodquiz",

  buzzpopmusic: "buzzthepopquiz",
  buzzthepopquiz: "buzzthepopquiz",

  buzzquemeogenioportugues: "buzzbrainoftheworld",
  buzzbrainoftheworld: "buzzbrainoftheworld",
  buzzbrainoftheuk: "buzzbrainoftheworld",

  buzzjuniorfestanaselva: "buzzjuniorjungleparty",
  buzzjuniorjungleparty: "buzzjuniorjungleparty",

  buzzjuniorrobotmania: "buzzjuniorrobojam",
  buzzjuniorrobotmaniarobojam: "buzzjuniorrobojam",
  buzzjuniorrobojam: "buzzjuniorrobojam",

  buzzjuniormonstromania: "buzzjuniormonsterrumble",
  buzzjuniormonsterrumble: "buzzjuniormonsterrumble",

  buzzjuniordinomania: "buzzjuniordinoden",
  buzzjuniordinoden: "buzzjuniordinoden",

  buzzjuniorcorridasloucas: "buzzjunioraceracers",
  buzzjunioraceracers: "buzzjunioraceracers",
};

/**
 * Normalizes title for comparison:
 * - Lowercase
 * - Strips accents/diacritics
 * - Converts tabs/newlines to spaces
 * - Keeps strictly alphanumeric characters [a-z0-9]
 */
export function normalizeTitleForComparison(title: string): string {
  if (!title) return "";
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents: é -> e, ã -> a
    .replace(/[\t\r\n]+/g, " ")      // tabs/newlines -> space
    .replace(/[^a-z0-9]/g, "")       // keep strictly lowercase alphanumeric
    .trim();
}

/**
 * Calculates Bigram Dice similarity coefficient between two strings (0.0 to 1.0)
 */
export function calculateTitleSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bg = str.substring(i, i + 2);
      bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
    }
    return bigrams;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);

  let intersection = 0;
  for (const [bg, count1] of b1.entries()) {
    if (b2.has(bg)) {
      intersection += Math.min(count1, b2.get(bg)!);
    }
  }

  const total = (s1.length - 1) + (s2.length - 1);
  return (2.0 * intersection) / total;
}

export interface CleanedTitleResult {
  cleanTitle: string;
  searchTitle: string;
  detectedOrigin?: string;
  detectedRepack?: string;
  detectedPlatform?: string;
  detectedYear?: number;
}

/**
 * Cleans raw input strings pasted from spreadsheets, websites, release titles, or notes.
 */
export function cleanRawGameTitle(raw: string): CleanedTitleResult {
  if (!raw) {
    return { cleanTitle: "", searchTitle: "" };
  }

  let text = raw.trim();

  let detectedOrigin: string | undefined;
  let detectedRepack: string | undefined;
  let detectedPlatform: string | undefined;
  let detectedYear: number | undefined;

  // 1. Check for tab-separated columns or multiple spaces with release year: e.g. "Game Title\t2005" or "Game Title   2005"
  const tabYearMatch = text.match(/(?:[\t]+|\s{2,}|[\s]+[-–—]\s+)(19\d\d|20\d\d)(?:\s.*)?$/);
  if (tabYearMatch) {
    detectedYear = parseInt(tabYearMatch[1], 10);
    text = text.replace(/(?:[\t]+|\s{2,}|[\s]+[-–—]\s+)(19\d\d|20\d\d)(?:\s.*)?$/, "");
  }

  // 2. Check for parenthesized year at the end: e.g. "God of War (2018)"
  const parenYearMatch = text.match(/\s*\((19\d\d|20\d\d)\)\s*$/);
  if (parenYearMatch) {
    detectedYear = parseInt(parenYearMatch[1], 10);
    text = text.replace(/\s*\((19\d\d|20\d\d)\)\s*$/, "");
  }

  // Replace remaining tabs and carriage returns with spaces
  text = text.replace(/[\t\r]+/g, " ").trim();

  const lower = text.toLowerCase();

  // Detect Repacks & Origins
  if (lower.includes("fitgirl")) {
    detectedOrigin = "REPACK";
    detectedRepack = "FitGirl Repack";
  } else if (lower.includes("dodi")) {
    detectedOrigin = "REPACK";
    detectedRepack = "DODI Repack";
  } else if (lower.includes("elamigos")) {
    detectedOrigin = "REPACK";
    detectedRepack = "ElAmigos";
  } else if (lower.includes("gog")) {
    detectedOrigin = "GOG";
  } else if (lower.includes("steam")) {
    detectedOrigin = "STEAM";
  }

  // Detect Consoles
  if (lower.includes("switch") || lower.includes("yuzu") || lower.includes("ryujinx")) {
    detectedPlatform = "Nintendo Switch";
    detectedOrigin = detectedOrigin || "EMULATOR";
  } else if (lower.includes("ps5") || lower.includes("playstation 5")) {
    detectedPlatform = "PlayStation 5";
  } else if (lower.includes("ps4") || lower.includes("playstation 4")) {
    detectedPlatform = "PlayStation 4";
  } else if (lower.includes("ps3") || lower.includes("rpcs3") || lower.includes("playstation 3")) {
    detectedPlatform = "PlayStation 3";
    detectedOrigin = detectedOrigin || "EMULATOR";
  } else if (lower.includes("ps2") || lower.includes("pcsx2") || lower.includes("playstation 2")) {
    detectedPlatform = "PlayStation 2";
    detectedOrigin = detectedOrigin || "EMULATOR";
  } else if (lower.includes("ps1") || lower.includes("psx") || lower.includes("duckstation")) {
    detectedPlatform = "PlayStation 1";
    detectedOrigin = detectedOrigin || "EMULATOR";
  } else if (lower.includes("psp") || lower.includes("ppsspp")) {
    detectedPlatform = "PlayStation Portable (PSP)";
    detectedOrigin = detectedOrigin || "EMULATOR";
  } else if (lower.includes("ps vita") || lower.includes("vita3k")) {
    detectedPlatform = "PlayStation Vita";
    detectedOrigin = detectedOrigin || "EMULATOR";
  } else if (lower.includes("wii u") || lower.includes("cemu")) {
    detectedPlatform = "Nintendo Wii U";
    detectedOrigin = detectedOrigin || "EMULATOR";
  } else if (lower.includes("wii") || lower.includes("dolphin")) {
    detectedPlatform = "Nintendo Wii";
    detectedOrigin = detectedOrigin || "EMULATOR";
  } else if (lower.includes("gamecube") || lower.includes("gc")) {
    detectedPlatform = "Nintendo GameCube";
    detectedOrigin = detectedOrigin || "EMULATOR";
  } else if (lower.includes("n64") || lower.includes("nintendo 64")) {
    detectedPlatform = "Nintendo 64";
    detectedOrigin = detectedOrigin || "EMULATOR";
  } else if (lower.includes("3ds") || lower.includes("citra")) {
    detectedPlatform = "Nintendo 3DS";
    detectedOrigin = detectedOrigin || "EMULATOR";
  } else if (lower.includes("gba") || lower.includes("game boy advance")) {
    detectedPlatform = "Game Boy Advance (GBA)";
    detectedOrigin = detectedOrigin || "EMULATOR";
  } else if (lower.includes("nds") || lower.includes("desmume") || lower.includes("nintendo ds")) {
    detectedPlatform = "Nintendo DS";
    detectedOrigin = detectedOrigin || "EMULATOR";
  } else if (lower.includes("xbox series")) {
    detectedPlatform = "Xbox Series X/S";
  } else if (lower.includes("xbox 360") || lower.includes("xenia")) {
    detectedPlatform = "Xbox 360";
    detectedOrigin = detectedOrigin || "EMULATOR";
  } else if (lower.includes("xbox one")) {
    detectedPlatform = "Xbox One";
  }

  // Remove leading numbers, bullets, checkboxes: "1. ", "01 - ", "[1] ", "- ", "* ", "• "
  text = text.replace(/^[\s\d]+[.)\-\]\s]+/g, "");
  text = text.replace(/^[-*•–—\s]+/g, "");

  // Remove scene tags / release groups
  text = text.replace(
    /\[\s*(fitgirl|dodi|elamigos|tenoke|rune|skidrow|codex|cpy|empress|flt|repack|steam|gog|multi\d*|cracked|switch|ps\d|xbox)[^\]]*\]/gi,
    ""
  );
  text = text.replace(
    /\(\s*(fitgirl|dodi|elamigos|tenoke|rune|skidrow|codex|cpy|empress|flt|repack|steam|gog|multi\d*|cracked|switch|ps\d|xbox)[^)]*\)/gi,
    ""
  );

  // Remove version patterns
  text = text.replace(/\b(v\s*\d+(\.\d+)*[a-z]?)\b/gi, "");
  text = text.replace(/\b(build\s*\d+|update\s*\d+)\b/gi, "");

  // Remove file extensions
  text = text.replace(/\.(exe|iso|zip|rar|7z|bin|cue|nsp|xci|wux|cxi|nds|gba|cso|pkg)$/gi, "");

  // Clean trailing punctuation and multi-spaces
  text = text.replace(/[-_–—|:,]+$/g, "").trim();
  text = text.replace(/\s{2,}/g, " ").trim();

  const finalCleanTitle = text || raw.trim();

  // Known Portuguese localized franchise mapping (Buzz!, etc.)
  let searchTitle = finalCleanTitle;
  const lTitle = finalCleanTitle
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (lTitle.includes("buzz")) {
    if (lTitle.includes("musica")) searchTitle = "Buzz!: The Music Quiz";
    else if (lTitle.includes("grande quiz")) searchTitle = "Buzz!: The BIG Quiz";
    else if (lTitle.includes("desportivo")) searchTitle = "Buzz!: The Sports Quiz";
    else if (lTitle.includes("mega quiz")) searchTitle = "Buzz!: The Mega Quiz";
    else if (lTitle.includes("hollywood")) searchTitle = "Buzz!: The Hollywood Quiz";
    else if (lTitle.includes("pop")) searchTitle = "Buzz!: The Pop Quiz";
    else if (lTitle.includes("genio") || lTitle.includes("portugues")) searchTitle = "Buzz!: Brain of the World";
    else if (lTitle.includes("selva")) searchTitle = "Buzz! Junior: Jungle Party";
    else if (lTitle.includes("robot") || lTitle.includes("robojam")) searchTitle = "Buzz! Junior: Robo Jam";
    else if (lTitle.includes("monstro")) searchTitle = "Buzz! Junior: Monster Rumble";
    else if (lTitle.includes("dino")) searchTitle = "Buzz! Junior: Dino Den";
    else if (lTitle.includes("corridas")) searchTitle = "Buzz! Junior: Ace Racers";
  }

  return {
    cleanTitle: finalCleanTitle,
    searchTitle,
    detectedOrigin,
    detectedRepack,
    detectedPlatform,
    detectedYear,
  };
}

export interface ExistingGameRef {
  id: string;
  title: string;
  platform: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchedGame?: ExistingGameRef;
  reason?: string;
}

/**
 * Thoroughly checks if candidate game already exists in existing collection.
 */
export function checkIsDuplicateGame(
  candidateTitle: string,
  candidatePlatform: string | undefined,
  existingGames: ExistingGameRef[]
): DuplicateCheckResult {
  const normCandidate = normalizeTitleForComparison(candidateTitle);
  if (!normCandidate) return { isDuplicate: false };

  const canonicalCandidate = CANONICAL_FRANCHISE_MAP[normCandidate] || normCandidate;

  for (const dbGame of existingGames) {
    // Also clean dbGame.title in case existing database has trailing tabs or years
    const { cleanTitle: cleanDbTitle } = cleanRawGameTitle(dbGame.title);
    const normDb = normalizeTitleForComparison(cleanDbTitle || dbGame.title);
    if (!normDb) continue;

    const canonicalDb = CANONICAL_FRANCHISE_MAP[normDb] || normDb;

    // Platform comparison: if same platform OR either is unassigned / ALL
    const samePlatform =
      !candidatePlatform ||
      !dbGame.platform ||
      candidatePlatform.trim().toLowerCase() === dbGame.platform.trim().toLowerCase() ||
      candidatePlatform === "ALL" ||
      dbGame.platform === "ALL";

    // 1. Exact normalized match:
    if (normCandidate === normDb) {
      return {
        isDuplicate: true,
        matchedGame: dbGame,
        reason: `Jogo idêntico já existe na biblioteca (${dbGame.title} - ${dbGame.platform})`,
      };
    }

    // 2. Canonical alias match (cross-language, e.g. "Buzz! O Quiz Musical" vs "Buzz!: The Music Quiz")
    if (canonicalCandidate === canonicalDb && (samePlatform || normCandidate.includes("buzz"))) {
      return {
        isDuplicate: true,
        matchedGame: dbGame,
        reason: `Mesmo jogo já na biblioteca (${dbGame.title} - ${dbGame.platform})`,
      };
    }

    // 3. High similarity or prefix/typo match (on the same platform)
    if (samePlatform) {
      // Numbers check: if numeric sequences differ (e.g. sequels like 2 vs 3, or annual editions like 2020 vs 2021), they are distinct sequels!
      const candidateNums = normCandidate.match(/\d+/g) || [];
      const dbNums = normDb.match(/\d+/g) || [];
      if (candidateNums.join(",") !== dbNums.join(",")) {
        continue;
      }

      // Prefix check for long titles: "buzzoquizmusica" vs "buzzoquizmusical"
      if (
        (normCandidate.length >= 8 && normDb.startsWith(normCandidate)) ||
        (normDb.length >= 8 && candidateStartsWithDb(normCandidate, normDb))
      ) {
        return {
          isDuplicate: true,
          matchedGame: dbGame,
          reason: `Variação do mesmo título na biblioteca (${dbGame.title})`,
        };
      }

      // Bigram similarity check (>= 86% similar with close lengths)
      const similarity = calculateTitleSimilarity(normCandidate, normDb);
      if (similarity >= 0.86 && Math.abs(normCandidate.length - normDb.length) <= 3) {
        return {
          isDuplicate: true,
          matchedGame: dbGame,
          reason: `Título quase idêntico já na biblioteca (${dbGame.title} - ${dbGame.platform})`,
        };
      }
    }
  }

  return { isDuplicate: false };
}

function candidateStartsWithDb(candidate: string, db: string): boolean {
  return candidate.startsWith(db) && candidate.length - db.length <= 4;
}
