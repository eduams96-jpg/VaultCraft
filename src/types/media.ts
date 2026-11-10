export type MediaType = "MOVIE" | "SERIES" | "ANIME";
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

export interface TMDBMediaResult {
  id: number;
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
