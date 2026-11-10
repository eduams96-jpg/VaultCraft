/**
 * Official HowLongToBeat Integration
 * Fetches verified playthrough durations (Main Story, Main + Extra, 100% Completion)
 * directly from howlongtobeat.com with token caching.
 */

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

const HLTB_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.5",
  Referer: "https://howlongtobeat.com/",
};

async function getHLTBToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }
  try {
    const res = await fetch(`https://howlongtobeat.com/api/search/site/init?t=${now}`, {
      headers: HLTB_HEADERS,
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.token) {
        cachedToken = data.token;
        tokenExpiresAt = now + 10 * 60 * 1000; // Cache for 10 minutes
        return cachedToken;
      }
    }
  } catch {
    // Ignore init error
  }
  return null;
}

function formatHours(seconds?: number | null): number {
  if (!seconds || seconds <= 0) return 0;
  const h = seconds / 3600;
  return h >= 10 ? Math.round(h) : Math.round(h * 10) / 10;
}

export interface HLTBResult {
  gameName: string;
  gameImage: string | null;
  mainHours: number;
  plusHours: number;
  completeHours: number;
  formattedTime: string | null;
}

/**
 * Searches HowLongToBeat for official game duration.
 */
export async function fetchHowLongToBeat(title: string): Promise<HLTBResult | null> {
  if (!title || title.trim().length < 2) return null;

  try {
    const token = await getHLTBToken();
    if (!token) return null;

    const cleanTerms = title
      .replace(/[—–]/g, " ")
      .replace(/[:!?,._\-\/\\()™®]/g, " ")
      .replace(/\b(remastered|goty|edition|definitive|enhanced|hd|playtest|complete|bundle)\b/gi, " ")
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 0 && !/^(the|and)$/i.test(t));

    if (cleanTerms.length === 0) return null;

    const body = {
      searchType: "games",
      searchTerms: cleanTerms,
      searchPage: 1,
      size: 5,
      searchOptions: {
        games: {
          userId: 0,
          platform: "",
          sortCategory: "popular",
          rangeCategory: "main",
          rangeTime: { min: null, max: null },
          gameplay: { perspective: "", flow: "", genre: "", difficulty: "" },
          rangeYear: { min: "", max: "" },
          modifier: "",
        },
        users: { sortCategory: "postcount" },
        lists: { sortCategory: "follows" },
        filter: "",
        sort: 0,
        randomizer: 0,
      },
    };

    const res = await fetch("https://howlongtobeat.com/api/search/site", {
      method: "POST",
      headers: {
        ...HLTB_HEADERS,
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.data || data.data.length === 0) return null;

    // Pick top matching game
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const match = data.data[0];
    const mainH = formatHours(match.comp_main);
    const plusH = formatHours(match.comp_plus);
    const completeH = formatHours(match.comp_100);

    const parts: string[] = [];
    if (mainH > 0) parts.push(`História: ~${mainH}h`);
    if (plusH > 0) parts.push(`Extras: ~${plusH}h`);
    if (completeH > 0) parts.push(`100%: ~${completeH}h`);

    return {
      gameName: match.game_name,
      gameImage: match.game_image
        ? `https://howlongtobeat.com/games/${match.game_image}`
        : null,
      mainHours: mainH,
      plusHours: plusH,
      completeHours: completeH,
      formattedTime: parts.length > 0 ? parts.join(" | ") : null,
    };
  } catch {
    return null;
  }
}
