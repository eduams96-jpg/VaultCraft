export type MediaType =
  | "MOVIE"
  | "SERIES"
  | "ANIMATION_MOVIE"
  | "CARTOON"
  | "PT_MOVIE"
  | "PT_SERIES"
  | "ANIME";

export type MediaStatus = "PLAN_TO_WATCH" | "WATCHING" | "COMPLETED" | "PAUSED" | "DROPPED";
export type MediaQuality = "4K HDR" | "1080p Remux" | "1080p Web-DL" | "720p" | "Blu-Ray" | "DVD" | "Outro";
export type MediaSource = "LOCAL" | "STREAMING" | "PHYSICAL";

export interface MediaItem {
  id: string;
  title: string;
  originalTitle?: string | null;
  type: MediaType;
  status: MediaStatus;
  rating?: number | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  releaseYear?: number | null;
  genres?: string | null;
  synopsis?: string | null;
  director?: string | null;
  cast?: string | null;
  durationMinutes?: number | null;
  totalSeasons?: number | null;
  totalEpisodes?: number | null;
  currentSeason?: number | null;
  currentEpisode?: number | null;
  quality?: string | null;
  storageLocation?: string | null;
  sourceOrigin?: MediaSource | string | null;
  streamingService?: string | null;
  isFavorite?: boolean;
  userReview?: string | null;
  customTags?: string | null;
  imdbId?: string | null;
  tmdbId?: number | null;
  completionDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const MEDIA_CATEGORIES = [
  { key: "ALL", label: "Todos", icon: "🍿" },
  { key: "MOVIE", label: "Filmes", icon: "🎬" },
  { key: "SERIES", label: "Séries", icon: "📺" },
  { key: "ANIMATION_MOVIE", label: "Filmes Animação", icon: "🎨" },
  { key: "CARTOON", label: "Desenhos Animados", icon: "🧸" },
  { key: "PT_MOVIE", label: "Filmes Portugueses", icon: "🇵🇹" },
  { key: "PT_SERIES", label: "Séries Portuguesas", icon: "🇵🇹" },
  { key: "ANIME", label: "Animes", icon: "🎌" },
] as const;

export function getMediaTypeBadge(type: MediaType | string) {
  switch (type) {
    case "ANIMATION_MOVIE":
      return { label: "Filme Animação", icon: "🎨", color: "bg-amber-950/80 text-amber-300 border-amber-500/40" };
    case "CARTOON":
      return { label: "Desenho Animado", icon: "🧸", color: "bg-yellow-950/80 text-yellow-300 border-yellow-500/40" };
    case "PT_MOVIE":
      return { label: "Filme PT", icon: "🇵🇹", color: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40" };
    case "PT_SERIES":
      return { label: "Série PT", icon: "🇵🇹", color: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40" };
    case "ANIME":
      return { label: "Anime", icon: "🎌", color: "bg-pink-950/80 text-pink-300 border-pink-500/40" };
    case "SERIES":
      return { label: "Série", icon: "📺", color: "bg-sky-950/80 text-sky-300 border-sky-500/40" };
    case "MOVIE":
    default:
      return { label: "Filme", icon: "🎬", color: "bg-purple-950/80 text-purple-300 border-purple-500/40" };
  }
}

export interface TMDBMediaResult {
  id: number | string;
  title: string;
  originalTitle?: string;
  type: MediaType;
  releaseYear?: number;
  posterUrl?: string;
  backdropUrl?: string;
  overview?: string;
  rating?: number;
  genres?: string[];
}
