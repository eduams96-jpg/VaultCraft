export type OriginType =
  | "STEAM"
  | "EPIC"
  | "GOG"
  | "REPACK"
  | "EMULATOR"
  | "PHYSICAL"
  | "OTHER";

export type GameStatus =
  | "AVAILABLE"
  | "BACKLOG"
  | "PLAYING"
  | "COMPLETED"
  | "PLATINUM"
  | "PAUSED"
  | "NOT_STARTED"
  | "ABANDONED";

export interface GameItem {
  id: string;
  title: string;
  platform: string;
  originType: OriginType | string;
  repackGroup?: string | null;
  status: GameStatus | string;
  rating?: number | null;
  coverUrl?: string | null;
  bannerUrl?: string | null;
  releaseYear?: number | null;
  genres?: string | null;
  storageLocation?: string | null;
  executablePath?: string | null;
  saveLocation?: string | null;
  diskSpace?: string | null;
  pcRequirements?: string | null;
  tags?: string | null;
  customCategories?: string | null; // Categorias manuais separadas por vírgula
  timeToBeat?: string | null;
  isInstalled: boolean;
  isArchived?: boolean;
  isFavorite?: boolean;
  hasSavefile?: boolean;
  hasAchievements?: boolean;
  isPlatinum?: boolean;
  isWishlist?: boolean;
  wishlistStatus?: "WAITING_CRACK" | "WAITING_SALE" | "WAITING_RELEASE" | string | null;
  wishlistPriority?: "HIGH" | "MEDIUM" | "LOW" | string | null;
  targetPrice?: number | null;
  installNotes?: string | null;
  userReview?: string | null;
  screenshots?: string | null;
  hoursPlayed: number;
  // Versão e Atualizações
  gameVersion?: string | null;
  versionDate?: string | null;
  latestKnownVersion?: string | null;
  latestVersionDate?: string | null;
  latestPatchNotesUrl?: string | null;
  latestPatchTitle?: string | null;
  isUpToDate?: boolean | null;
  externalLink?: string | null;
  completionDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GameMetadataResult {
  id: number | string;
  name: string;
  releaseYear?: number;
  genres?: string[];
  coverUrl?: string;
  bannerUrl?: string;
  diskSpace?: string;
  pcRequirements?: string;
  screenshots?: string;
  timeToBeat?: string;
  externalLink?: string;
}

export interface GoalItem {
  id: string;
  title: string;
  description?: string | null;
  targetCount: number;
  currentCount: number;
  category?: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
