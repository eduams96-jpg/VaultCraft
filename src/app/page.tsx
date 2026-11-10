"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { GameItem, CategoryItem, GoalItem } from "@/types/game";
import { Navbar } from "@/components/Navbar";
import { StatsBar } from "@/components/StatsBar";
import { FilterBar } from "@/components/FilterBar";
import { HallOfFame } from "@/components/HallOfFame";
import { GameCard } from "@/components/GameCard";
import { GameListView } from "@/components/GameListView";
import { GameFormModal } from "@/components/GameFormModal";
import { GameDetailModal } from "@/components/GameDetailModal";
import { BackupModal } from "@/components/BackupModal";
import { RandomPickerModal } from "@/components/RandomPickerModal";
import { StatsModal } from "@/components/StatsModal";
import { WishlistModal } from "@/components/WishlistModal";
import { BatchImportModal } from "@/components/BatchImportModal";
import { BulkActionBar } from "@/components/BulkActionBar";
import { BulkEditModal, type BulkEditUpdates } from "@/components/BulkEditModal";
import { CategoryModal } from "@/components/CategoryModal";
import { CategoryFilterTabs } from "@/components/CategoryFilterTabs";
import { WishlistView } from "@/components/WishlistView";
import { BacklogGoalsModal } from "@/components/BacklogGoalsModal";
import { GamerWrapUpModal } from "@/components/GamerWrapUpModal";
import { GamerCardModal } from "@/components/GamerCardModal";
import { VersionRadarModal } from "@/components/VersionRadarModal";
import { MediaItem } from "@/types/media";
import { MediaCard } from "@/components/MediaCard";
import { MediaStatsBar } from "@/components/MediaStatsBar";
import { MediaFilterBar } from "@/components/MediaFilterBar";
import { MediaFormModal } from "@/components/MediaFormModal";
import { MediaDetailModal } from "@/components/MediaDetailModal";
import { Loader2, Plus, Ghost, Gamepad2, Bookmark, Film, Tv, Clapperboard } from "lucide-react";

export default function HomePage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Main Workspace Tab (Collection vs Wishlist/Radar)
  const [mainTab, setMainTab] = useState<"COLLECTION" | "WISHLIST">("COLLECTION");

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [originFilter, setOriginFilter] = useState("ALL");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [tagFilter, setTagFilter] = useState("ALL");
  const [durationFilter, setDurationFilter] = useState("ALL");
  const [eraFilter, setEraFilter] = useState("ALL");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [archiveFilter, setArchiveFilter] = useState("ALL");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Multi-Selection State
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryAssignMode, setCategoryAssignMode] = useState(false);

  // Feature Modals
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isWrapUpModalOpen, setIsWrapUpModalOpen] = useState(false);
  const [isGamerCardModalOpen, setIsGamerCardModalOpen] = useState(false);
  const [isVersionRadarOpen, setIsVersionRadarOpen] = useState(false);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isRandomModalOpen, setIsRandomModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [defaultIsWishlist, setDefaultIsWishlist] = useState(false);

  const [gameToEdit, setGameToEdit] = useState<GameItem | null>(null);
  const [gameDetail, setGameDetail] = useState<GameItem | null>(null);

  // Top-Level Entertainment Vault (GAMES vs MEDIA)
  const [activeVault, setActiveVault] = useState<"GAMES" | "MEDIA">("GAMES");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Media Filters
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("ALL");
  const [mediaStatusFilter, setMediaStatusFilter] = useState("ALL");
  const [mediaQualityFilter, setMediaQualityFilter] = useState("ALL");
  const [mediaFavoriteOnly, setMediaFavoriteOnly] = useState(false);
  const [mediaSortBy, setMediaSortBy] = useState("updatedAt");

  // Media Modals
  const [isMediaFormOpen, setIsMediaFormOpen] = useState(false);
  const [mediaToEdit, setMediaToEdit] = useState<MediaItem | null>(null);
  const [mediaDetail, setMediaDetail] = useState<MediaItem | null>(null);

  // Status Notification Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(
    null
  );

  // Background Tasks Loading States
  const [isEnriching, setIsEnriching] = useState(false);
  const [isSyncingSteam, setIsSyncingSteam] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Fetch games from API
  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch("/api/games");
      if (res.ok) {
        const data = await res.json();
        setGames(data);
      }
    } catch (err) {
      console.error("Erro ao carregar jogos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
    }
  }, []);

  // Fetch backlog goals from API
  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (err) {
      console.error("Erro ao carregar metas:", err);
    }
  }, []);

  // Fetch media (movies & series)
  const fetchMediaItems = useCallback(async () => {
    try {
      setMediaLoading(true);
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = await res.json();
        setMediaItems(data);
      }
    } catch (err) {
      console.error("Erro ao carregar filmes e séries:", err);
    } finally {
      setMediaLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
    fetchCategories();
    fetchGoals();
    fetchMediaItems();
  }, [fetchGames, fetchCategories, fetchGoals, fetchMediaItems]);

  // Wishlist count
  const wishlistCount = useMemo(() => {
    return games.filter((g) => g.isWishlist).length;
  }, [games]);

  // Main collection games (excluding wishlist)
  const collectionGames = useMemo(() => {
    return games.filter((g) => !g.isWishlist);
  }, [games]);

  // Available unique platforms from collection
  const availablePlatforms = useMemo(() => {
    const list = new Set<string>();
    collectionGames.forEach((g) => {
      if (g.platform) list.add(g.platform);
    });
    return Array.from(list);
  }, [collectionGames]);

  // Available unique tags from collection
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    collectionGames.forEach((g) => {
      if (g.tags) {
        g.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .forEach((t) => set.add(t));
      }
    });
    return Array.from(set);
  }, [collectionGames]);

  // Category games counts
  const categoryGameCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    collectionGames.forEach((g) => {
      if (g.customCategories) {
        g.customCategories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
          .forEach((c) => {
            counts[c] = (counts[c] || 0) + 1;
          });
      }
    });
    return counts;
  }, [collectionGames]);

  // Client-side filtering & sorting for main library
  const filteredGames = useMemo(() => {
    const result = collectionGames.filter((game) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = game.title.toLowerCase().includes(q);
        const matchesNotes = game.installNotes?.toLowerCase().includes(q);
        const matchesRepack = game.repackGroup?.toLowerCase().includes(q);
        const matchesGenre = game.genres?.toLowerCase().includes(q);
        const matchesLocation = game.storageLocation?.toLowerCase().includes(q);
        const matchesTags = game.tags?.toLowerCase().includes(q);
        const matchesCat = game.customCategories?.toLowerCase().includes(q);

        if (
          !matchesTitle &&
          !matchesNotes &&
          !matchesRepack &&
          !matchesGenre &&
          !matchesLocation &&
          !matchesTags &&
          !matchesCat
        ) {
          return false;
        }
      }

      // Custom Category Filter
      if (activeCategoryFilter !== "ALL") {
        if (!game.customCategories) return false;
        const gameCats = game.customCategories
          .split(",")
          .map((c) => c.trim().toLowerCase())
          .filter(Boolean);
        if (!gameCats.includes(activeCategoryFilter.toLowerCase())) {
          return false;
        }
      }

      // Status
      if (statusFilter !== "ALL" && game.status !== statusFilter) {
        return false;
      }

      // Origin
      if (originFilter !== "ALL" && game.originType !== originFilter) {
        return false;
      }

      // Platform
      if (platformFilter !== "ALL" && game.platform !== platformFilter) {
        return false;
      }

      // Tags
      if (tagFilter !== "ALL") {
        if (!game.tags || !game.tags.toLowerCase().includes(tagFilter.toLowerCase())) {
          return false;
        }
      }

      // Duration (HowLongToBeat / Backlog Destroyer / Unplayed)
      if (durationFilter !== "ALL") {
        if (durationFilter === "UNPLAYED") {
          if ((game.hoursPlayed ?? 0) > 0) return false;
        } else {
          if (!game.timeToBeat) return false;
          const match = game.timeToBeat.match(/(\d+(?:\.\d+)?)\s*h/i);
          const hours = match ? parseFloat(match[1]) : null;
          if (hours === null || isNaN(hours)) return false;

          if (durationFilter === "QUICK" && hours >= 5) return false;
          if (durationFilter === "SHORT" && (hours < 5 || hours >= 10)) return false;
          if (durationFilter === "MEDIUM" && (hours < 10 || hours >= 25)) return false;
          if (durationFilter === "LONG" && (hours < 25 || hours >= 50)) return false;
          if (durationFilter === "EPIC" && hours < 50) return false;
        }
      }

      // Favorite Only (Hall of Fame)
      if (favoriteOnly && !game.isFavorite) {
        return false;
      }

      // Era / Decades Filter
      if (eraFilter !== "ALL") {
        const year = game.releaseYear;
        if (!year) return false;
        if (eraFilter === "2020s" && year < 2020) return false;
        if (eraFilter === "2010s" && (year < 2010 || year > 2019)) return false;
        if (eraFilter === "2000s" && (year < 2000 || year > 2009)) return false;
        if (eraFilter === "90s" && (year < 1990 || year > 1999)) return false;
        if (eraFilter === "RETRO" && year >= 1990) return false;
      }

      // Archive Filter
      if (archiveFilter === "ARCHIVED" && !game.isArchived) {
        return false;
      }
      if (archiveFilter === "NOT_ARCHIVED" && game.isArchived) {
        return false;
      }

      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0);
        case "hoursPlayed":
          return (b.hoursPlayed ?? 0) - (a.hoursPlayed ?? 0);
        case "title":
          return a.title.localeCompare(b.title);
        case "releaseYear":
          return (b.releaseYear ?? 0) - (a.releaseYear ?? 0);
        case "updatedAt":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [
    collectionGames,
    search,
    activeCategoryFilter,
    statusFilter,
    originFilter,
    platformFilter,
    tagFilter,
    durationFilter,
    eraFilter,
    favoriteOnly,
    archiveFilter,
    sortBy,
  ]);

  // Selection Logic
  const handleToggleSelectGame = (game: GameItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedGameIds((prev) =>
      prev.includes(game.id) ? prev.filter((id) => id !== game.id) : [...prev, game.id]
    );
  };

  const allFilteredSelected =
    filteredGames.length > 0 &&
    filteredGames.every((g) => selectedGameIds.includes(g.id));

  const handleToggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const visibleIds = new Set(filteredGames.map((g) => g.id));
      setSelectedGameIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      const combined = new Set([...selectedGameIds, ...filteredGames.map((g) => g.id)]);
      setSelectedGameIds(Array.from(combined));
    }
  };

  const handleClearSelection = () => {
    setSelectedGameIds([]);
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedGameIds.length === 0) return;
    if (
      !confirm(
        `Tens a certeza que desejas remover os ${selectedGameIds.length} jogos selecionados da tua biblioteca? Esta ação não pode ser anulada.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/games/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", ids: selectedGameIds }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao remover jogos");

      setGames((prev) => prev.filter((g) => !selectedGameIds.includes(g.id)));
      showToast(data.message || `${selectedGameIds.length} jogos removidos.`);
      setSelectedGameIds([]);
    } catch (err) {
      console.error(err);
      showToast("Erro ao remover jogos em lote.", "error");
    }
  };

  const handleBulkApplyEdit = async (updates: BulkEditUpdates) => {
    if (selectedGameIds.length === 0) return;

    try {
      const res = await fetch("/api/games/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", ids: selectedGameIds, updates }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar jogos");

      await fetchGames();
      await fetchCategories();
      showToast(data.message || `${selectedGameIds.length} jogos atualizados com sucesso!`);
      setSelectedGameIds([]);
    } catch (err) {
      console.error(err);
      showToast("Erro ao editar jogos em lote.", "error");
    }
  };

  const handleBulkToggleArchive = async () => {
    if (selectedGameIds.length === 0) return;
    const selectedGamesList = games.filter((g) => selectedGameIds.includes(g.id));
    const allArchived = selectedGamesList.every((g) => g.isArchived);
    const targetVal = !allArchived;

    await handleBulkApplyEdit({ isArchived: targetVal });
    showToast(
      targetVal
        ? `${selectedGameIds.length} jogos marcados como arquivados 📦`
        : `${selectedGameIds.length} jogos removidos do arquivo`
    );
  };

  const handleBulkTogglePlatinum = async () => {
    if (selectedGameIds.length === 0) return;
    const selectedGamesList = games.filter((g) => selectedGameIds.includes(g.id));
    const allPlatinum = selectedGamesList.every((g) => g.isPlatinum || g.status === "PLATINUM");
    const targetVal = !allPlatinum;

    await handleBulkApplyEdit({
      isPlatinum: targetVal,
      status: targetVal ? "PLATINUM" : "COMPLETED",
    });
    showToast(
      targetVal
        ? `👑 ${selectedGameIds.length} jogos marcados como PLATINADOS / 100%!`
        : `${selectedGameIds.length} jogos desmarcados de platinado`
    );
  };

  const handleAssignToCategory = async (categoryName: string) => {
    if (selectedGameIds.length === 0) return;

    try {
      const res = await fetch("/api/games/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          ids: selectedGameIds,
          updates: { addCategory: categoryName },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atribuir categoria");

      await fetchGames();
      await fetchCategories();
      showToast(
        data.message || `${selectedGameIds.length} jogos adicionados à categoria "${categoryName}"!`
      );
      setSelectedGameIds([]);
    } catch (err) {
      console.error(err);
      showToast("Erro ao atribuir categoria.", "error");
    }
  };

  const handleCreateCategory = async (name: string, icon?: string, color?: string) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon, color }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao criar categoria");

    await fetchCategories();
    showToast(`Categoria "${name}" criada com sucesso!`);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    const res = await fetch(`/api/categories?id=${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao remover categoria");

    if (activeCategoryFilter === name) {
      setActiveCategoryFilter("ALL");
    }

    await fetchCategories();
    await fetchGames();
    showToast(data.message || `Categoria "${name}" removida.`);
  };

  const handleAutoFranchises = async () => {
    try {
      const res = await fetch("/api/categories/auto-franchises", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar franquias");

      await fetchCategories();
      await fetchGames();
      showToast(data.message || "Franquias organizadas automaticamente!");
    } catch (err) {
      console.error(err);
      showToast("Erro ao gerar franquias automáticas.", "error");
    }
  };

  // Save (Create or Update Single Game)
  const handleSaveGame = async (gameData: Partial<GameItem>) => {
    if (gameToEdit) {
      // Update
      const res = await fetch(`/api/games/${gameToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameData),
      });

      if (!res.ok) throw new Error("Falha ao atualizar jogo");
      const updated = await res.json();

      setGames((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      if (gameDetail?.id === updated.id) setGameDetail(updated);
      await fetchCategories();
      showToast(`"${updated.title}" guardado com sucesso!`);
    } else {
      // Create
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameData),
      });

      if (!res.ok) throw new Error("Falha ao criar jogo");
      const created = await res.json();

      setGames((prev) => [created, ...prev]);
      await fetchCategories();
      showToast(
        created.isWishlist
          ? `"${created.title}" adicionado à Wishlist!`
          : `"${created.title}" adicionado à coleção!`
      );
    }
  };

  // Delete Single Game
  const handleDeleteGame = async (game: GameItem) => {
    try {
      const res = await fetch(`/api/games/${game.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setGames((prev) => prev.filter((g) => g.id !== game.id));
        setSelectedGameIds((prev) => prev.filter((id) => id !== game.id));
        if (gameDetail?.id === game.id) setGameDetail(null);
        showToast(`"${game.title}" removido.`);
      }
    } catch (err) {
      console.error("Erro ao apagar jogo:", err);
    }
  };

  // Quick Update Status
  const handleUpdateStatus = async (game: GameItem, newStatus: string) => {
    try {
      const res = await fetch(`/api/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setGames((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
        if (gameDetail?.id === updated.id) setGameDetail(updated);
      }
    } catch (err) {
      console.error("Erro ao atualizar estado:", err);
    }
  };

  // Quick Toggle Archive Status
  const handleToggleArchive = async (game: GameItem) => {
    const nextVal = !game.isArchived;
    setGames((prev) =>
      prev.map((g) => (g.id === game.id ? { ...g, isArchived: nextVal } : g))
    );
    if (gameDetail && gameDetail.id === game.id) {
      setGameDetail({ ...gameDetail, isArchived: nextVal });
    }
    showToast(
      nextVal
        ? `"${game.title}" marcado como arquivado 📦`
        : `"${game.title}" removido do arquivo`
    );

    try {
      await fetch(`/api/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: nextVal }),
      });
    } catch (err) {
      console.error("Erro ao atualizar arquivo:", err);
    }
  };

  // Quick Toggle Installed Status
  const handleToggleInstalled = async (game: GameItem) => {
    const nextVal = !game.isInstalled;
    setGames((prev) =>
      prev.map((g) => (g.id === game.id ? { ...g, isInstalled: nextVal } : g))
    );
    if (gameDetail && gameDetail.id === game.id) {
      setGameDetail({ ...gameDetail, isInstalled: nextVal });
    }
    showToast(
      nextVal
        ? `"${game.title}" marcado como instalado 🎮`
        : `"${game.title}" marcado como desinstalado`
    );

    try {
      await fetch(`/api/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isInstalled: nextVal }),
      });
    } catch (err) {
      console.error("Erro ao atualizar instalação:", err);
    }
  };

  // Quick Toggle Savefile
  const handleToggleSavefile = async (game: GameItem) => {
    const nextVal = !game.hasSavefile;
    setGames((prev) =>
      prev.map((g) => (g.id === game.id ? { ...g, hasSavefile: nextVal } : g))
    );
    if (gameDetail && gameDetail.id === game.id) {
      setGameDetail({ ...gameDetail, hasSavefile: nextVal });
    }
    showToast(
      nextVal
        ? `Savefile guardado de "${game.title}" registado! 💾`
        : `Savefile de "${game.title}" desmarcado`
    );

    try {
      await fetch(`/api/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasSavefile: nextVal }),
      });
    } catch (err) {
      console.error("Erro ao atualizar savefile:", err);
    }
  };

  // Quick Toggle Achievements
  const handleToggleAchievements = async (game: GameItem) => {
    const nextVal = !game.hasAchievements;
    setGames((prev) =>
      prev.map((g) => (g.id === game.id ? { ...g, hasAchievements: nextVal } : g))
    );
    if (gameDetail && gameDetail.id === game.id) {
      setGameDetail({ ...gameDetail, hasAchievements: nextVal });
    }
    showToast(
      nextVal
        ? `Ficheiro de Conquistas de "${game.title}" registado! 🏆`
        : `Conquistas de "${game.title}" desmarcadas`
    );

    try {
      await fetch(`/api/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasAchievements: nextVal }),
      });
    } catch (err) {
      console.error("Erro ao atualizar conquistas:", err);
    }
  };

  // Quick Toggle Platinum
  const handleTogglePlatinum = async (game: GameItem) => {
    const nextVal = !(game.isPlatinum || game.status === "PLATINUM");
    setGames((prev) =>
      prev.map((g) =>
        g.id === game.id
          ? {
              ...g,
              isPlatinum: nextVal,
              status: nextVal ? "PLATINUM" : g.status === "PLATINUM" ? "COMPLETED" : g.status,
            }
          : g
      )
    );
    if (gameDetail && gameDetail.id === game.id) {
      setGameDetail({
        ...gameDetail,
        isPlatinum: nextVal,
        status: nextVal ? "PLATINUM" : gameDetail.status === "PLATINUM" ? "COMPLETED" : gameDetail.status,
      });
    }
    showToast(
      nextVal
        ? `👑 "${game.title}" marcado como PLATINADO / 100%! Parabéns!`
        : `"${game.title}" desmarcado de platinado`
    );

    try {
      await fetch(`/api/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPlatinum: nextVal,
          status: nextVal ? "PLATINUM" : game.status === "PLATINUM" ? "COMPLETED" : game.status,
        }),
      });
    } catch (err) {
      console.error("Erro ao atualizar platinado:", err);
    }
  };

  // Quick Toggle Favorite (Hall of Fame)
  const handleToggleFavorite = async (game: GameItem) => {
    const nextVal = !game.isFavorite;
    setGames((prev) =>
      prev.map((g) => (g.id === game.id ? { ...g, isFavorite: nextVal } : g))
    );
    if (gameDetail && gameDetail.id === game.id) {
      setGameDetail({ ...gameDetail, isFavorite: nextVal });
    }
    showToast(
      nextVal
        ? `⭐ "${game.title}" adicionado ao Hall of Fame!`
        : `"${game.title}" removido do Hall of Fame`
    );

    try {
      await fetch(`/api/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: nextVal }),
      });
    } catch (err) {
      console.error("Erro ao atualizar favorito:", err);
    }
  };

  // Auto-promote top 3 most played to Hall of Fame
  const handleAutoPickTopFavorites = async () => {
    const sorted = [...collectionGames].sort((a, b) => (b.hoursPlayed ?? 0) - (a.hoursPlayed ?? 0));
    const top3 = sorted.slice(0, 3).filter((g) => !g.isFavorite);
    if (top3.length === 0) {
      showToast("Os teus jogos mais jogados já estão no Hall of Fame! ⭐");
      return;
    }

    const top3Ids = new Set(top3.map((g) => g.id));
    setGames((prev) =>
      prev.map((g) => (top3Ids.has(g.id) ? { ...g, isFavorite: true } : g))
    );

    try {
      await Promise.all(
        top3.map((g) =>
          fetch(`/api/games/${g.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isFavorite: true }),
          })
        )
      );
      showToast(`⭐ ${top3.length} jogos mais jogados promovidos ao Hall of Fame!`);
    } catch (err) {
      console.error("Erro ao auto-fixar favoritos:", err);
    }
  };

  // Backlog Goals Handlers
  const handleCreateGoal = async (title: string, targetCount: number, category?: string) => {
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, targetCount, category }),
      });
      if (res.ok) {
        const newGoal = await res.json();
        setGoals((prev) => [newGoal, ...prev]);
        showToast(`Meta "${newGoal.title}" criada! 🎯`);
      }
    } catch (err) {
      console.error(err);
      showToast("Erro ao criar meta.", "error");
    }
  };

  const handleUpdateGoal = async (id: string, currentCount: number, isCompleted?: boolean) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentCount, isCompleted }),
      });
      if (res.ok) {
        const updated = await res.json();
        setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
        if (updated.isCompleted) {
          showToast(`🏆 Meta "${updated.title}" concluída! Parabéns!`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (res.ok) {
        setGoals((prev) => prev.filter((g) => g.id !== id));
        showToast("Meta removida.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 1-Click Auto-Enrich HowLongToBeat & Missing Metadata
  const handleEnrichMetadata = async () => {
    setIsEnriching(true);
    showToast("🪄 A consultar HowLongToBeat e dados oficiais em segundo plano...");
    try {
      const res = await fetch("/api/games/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 40 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enriquecer jogos.");

      await fetchGames();
      showToast(
        data.remaining > 0
          ? `✨ ${data.updated} jogos enriquecidos! (${data.remaining} restantes - clica de novo para continuar)`
          : `🎉 ${data.updated} jogos enriquecidos! Toda a biblioteca está completa com HowLongToBeat!`
      );
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Erro ao enriquecer dados.", "error");
    } finally {
      setIsEnriching(false);
    }
  };

  // 1-Click Sync Steam Playtime Hours
  const handleSyncSteamHours = async () => {
    setIsSyncingSteam(true);
    showToast("🔄 A contactar a Steam para sincronizar horas de jogo...");
    try {
      const res = await fetch("/api/steam/sync-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "perfil-exemplo" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao sincronizar horas da Steam.");

      await fetchGames();
      showToast(data.message || "Horas da Steam sincronizadas com sucesso!");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Erro ao comunicar com a Steam.", "error");
    } finally {
      setIsSyncingSteam(false);
    }
  };

  // Move from Wishlist to Main Collection
  const handleMoveToCollection = async (game: GameItem) => {
    try {
      const res = await fetch(`/api/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isWishlist: false, wishlistStatus: null }),
      });

      if (res.ok) {
        const updated = await res.json();
        setGames((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
        showToast(`🎉 "${updated.title}" foi movido para a tua coleção ativa!`, "success");
      }
    } catch (err) {
      console.error("Erro ao mover para a coleção:", err);
    }
  };

  // Filtered & Sorted Media items (Movies & Series)
  const filteredMedia = useMemo(() => {
    return mediaItems
      .filter((m) => {
        if (mediaSearch.trim()) {
          const q = mediaSearch.toLowerCase();
          const match =
            m.title.toLowerCase().includes(q) ||
            m.genres?.toLowerCase().includes(q) ||
            m.cast?.toLowerCase().includes(q) ||
            m.director?.toLowerCase().includes(q);
          if (!match) return false;
        }
        if (mediaTypeFilter !== "ALL" && m.type !== mediaTypeFilter) return false;
        if (mediaStatusFilter !== "ALL" && m.status !== mediaStatusFilter) return false;
        if (mediaQualityFilter !== "ALL" && m.quality !== mediaQualityFilter) return false;
        if (mediaFavoriteOnly && !m.isFavorite) return false;
        return true;
      })
      .sort((a, b) => {
        if (mediaSortBy === "title") return a.title.localeCompare(b.title);
        if (mediaSortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        if (mediaSortBy === "releaseYear") return (b.releaseYear || 0) - (a.releaseYear || 0);
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [mediaItems, mediaSearch, mediaTypeFilter, mediaStatusFilter, mediaQualityFilter, mediaFavoriteOnly, mediaSortBy]);

  // Media CRUD Handlers
  const handleSaveMedia = async (data: Partial<MediaItem>) => {
    try {
      if (mediaToEdit) {
        const res = await fetch(`/api/media/${mediaToEdit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const updated = await res.json();
          setMediaItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
          if (mediaDetail && mediaDetail.id === updated.id) setMediaDetail(updated);
          showToast(`"${updated.title}" atualizado com sucesso!`);
        }
      } else {
        const res = await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const created = await res.json();
          setMediaItems((prev) => [created, ...prev]);
          showToast(`"${created.title}" adicionado à coleção!`);
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast("Erro ao guardar filme/série.", "error");
    }
  };

  const handleDeleteMedia = async (media: MediaItem) => {
    try {
      const res = await fetch(`/api/media/${media.id}`, { method: "DELETE" });
      if (res.ok) {
        setMediaItems((prev) => prev.filter((m) => m.id !== media.id));
        if (mediaDetail && mediaDetail.id === media.id) setMediaDetail(null);
        showToast(`"${media.title}" removido com sucesso.`);
      }
    } catch (err) {
      console.error(err);
      showToast("Erro ao eliminar.", "error");
    }
  };

  const handleUpdateMediaStatus = async (media: MediaItem, newStatus: string) => {
    try {
      const res = await fetch(`/api/media/${media.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMediaItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        if (mediaDetail && mediaDetail.id === updated.id) setMediaDetail(updated);
        showToast(`Estado alterado para "${newStatus}"!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMediaFavorite = async (media: MediaItem) => {
    try {
      const res = await fetch(`/api/media/${media.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !media.isFavorite }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMediaItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        if (mediaDetail && mediaDetail.id === updated.id) setMediaDetail(updated);
        showToast(updated.isFavorite ? `⭐ "${updated.title}" adicionado aos favoritos!` : `Removido dos favoritos.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleIncrementEpisode = async (media: MediaItem) => {
    try {
      const currentEp = media.currentEpisode || 0;
      const nextEp = currentEp + 1;
      const res = await fetch(`/api/media/${media.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEpisode: nextEp,
          status: media.status === "PLAN_TO_WATCH" ? "WATCHING" : media.status,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMediaItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        if (mediaDetail && mediaDetail.id === updated.id) setMediaDetail(updated);
        showToast(`Episódio ${nextEp} marcado como visto!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecrementEpisode = async (media: MediaItem) => {
    try {
      const currentEp = media.currentEpisode || 0;
      const prevEp = Math.max(0, currentEp - 1);
      const res = await fetch(`/api/media/${media.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentEpisode: prevEp }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMediaItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        if (mediaDetail && mediaDetail.id === updated.id) setMediaDetail(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500 selection:text-white pb-20">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 border animate-in slide-in-from-bottom-3 duration-300 ${
            toastMsg.type === "success"
              ? "bg-zinc-900 border-emerald-500/50 text-emerald-300 shadow-emerald-950/40"
              : "bg-zinc-900 border-rose-500/50 text-rose-300 shadow-rose-950/40"
          }`}
        >
          <span>{toastMsg.type === "success" ? "🚀" : "⚠️"}</span>
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeVault={activeVault}
        onSelectVault={setActiveVault}
        mediaCount={mediaItems.length}
        onOpenAddMediaModal={() => {
          setMediaToEdit(null);
          setIsMediaFormOpen(true);
        }}
        activeTab={mainTab}
        onSelectTab={setMainTab}
        totalGames={collectionGames.length}
        wishlistCount={wishlistCount}
        onOpenAddModal={() => {
          setGameToEdit(null);
          setDefaultIsWishlist(false);
          setIsFormModalOpen(true);
        }}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenRandomModal={() => setIsRandomModalOpen(true)}
        onOpenStatsModal={() => setIsStatsModalOpen(true)}
        onOpenWishlistModal={() => setMainTab("WISHLIST")}
        onOpenCategoryModal={() => {
          setCategoryAssignMode(false);
          setIsCategoryModalOpen(true);
        }}
        onOpenGoalsModal={() => setIsGoalsModalOpen(true)}
        onOpenWrapUpModal={() => setIsWrapUpModalOpen(true)}
        onOpenGamerCardModal={() => setIsGamerCardModalOpen(true)}
        onOpenVersionRadarModal={() => setIsVersionRadarOpen(true)}
        onEnrichMetadata={handleEnrichMetadata}
        onSyncSteamHours={handleSyncSteamHours}
        isEnriching={isEnriching}
        isSyncingSteam={isSyncingSteam}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeVault === "MEDIA" ? (
          <div>
            {/* Media Bird's eye statistics */}
            <MediaStatsBar
              mediaItems={mediaItems}
              activeTypeFilter={mediaTypeFilter}
              onFilterByType={setMediaTypeFilter}
              activeStatusFilter={mediaStatusFilter}
              onFilterByStatus={setMediaStatusFilter}
            />

            {/* Media Filter & Search Bar */}
            <MediaFilterBar
              search={mediaSearch}
              onSearchChange={setMediaSearch}
              typeFilter={mediaTypeFilter}
              onTypeFilterChange={setMediaTypeFilter}
              statusFilter={mediaStatusFilter}
              onStatusFilterChange={setMediaStatusFilter}
              qualityFilter={mediaQualityFilter}
              onQualityFilterChange={setMediaQualityFilter}
              favoriteOnly={mediaFavoriteOnly}
              onFavoriteOnlyToggle={() => setMediaFavoriteOnly(!mediaFavoriteOnly)}
              sortBy={mediaSortBy}
              onSortByChange={setMediaSortBy}
            />

            {/* Loading */}
            {mediaLoading && (
              <div className="py-24 flex flex-col items-center justify-center text-zinc-500 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <p className="text-sm">A carregar filmes e séries...</p>
              </div>
            )}

            {/* Empty State */}
            {!mediaLoading && mediaItems.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center justify-center bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                  <Film className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">A tua coleção de Cinema & TV está pronta!</h3>
                <p className="text-sm text-zinc-400 max-w-md mb-6">
                  Começa a adicionar os teus filmes favoritos, séries que estás a acompanhar ou animes com metadados e posters automáticos.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMediaToEdit(null);
                    setIsMediaFormOpen(true);
                  }}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Primeiro Filme / Série
                </button>
              </div>
            )}

            {/* No matches for search/filters */}
            {!mediaLoading && mediaItems.length > 0 && filteredMedia.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center justify-center bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-8">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-bold text-zinc-200 mb-1">Nenhum título encontrado</h3>
                <p className="text-xs text-zinc-400 max-w-sm mb-4">
                  Nenhum filme ou série corresponde aos filtros atuais. Tenta pesquisar outro termo ou limpar os filtros.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMediaSearch("");
                    setMediaTypeFilter("ALL");
                    setMediaStatusFilter("ALL");
                    setMediaQualityFilter("ALL");
                    setMediaFavoriteOnly(false);
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline cursor-pointer"
                >
                  Redefinir filtros
                </button>
              </div>
            )}

            {/* Media Grid */}
            {!mediaLoading && filteredMedia.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                {filteredMedia.map((item) => (
                  <MediaCard
                    key={item.id}
                    media={item}
                    onClick={() => setMediaDetail(item)}
                    onEdit={() => {
                      setMediaToEdit(item);
                      setIsMediaFormOpen(true);
                    }}
                    onDelete={() => handleDeleteMedia(item)}
                    onToggleFavorite={handleToggleMediaFavorite}
                    onUpdateStatus={(m, st) => handleUpdateMediaStatus(m, st)}
                    onIncrementEpisode={handleIncrementEpisode}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Workspace Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-inner">
            <button
              type="button"
              onClick={() => setMainTab("COLLECTION")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer ${
                mainTab === "COLLECTION"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/35"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Minha Coleção</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
                  mainTab === "COLLECTION"
                    ? "bg-indigo-700/80 text-white"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {collectionGames.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab("WISHLIST")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer ${
                mainTab === "WISHLIST"
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-600/35"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <Bookmark className="w-4 h-4 text-pink-300" />
              <span>Wishlist & Radar</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
                  mainTab === "WISHLIST"
                    ? "bg-pink-700/80 text-white"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {wishlistCount}
              </span>
            </button>
          </div>

          {/* Quick CTA depending on main tab */}
          <div className="flex items-center gap-2.5">
            {mainTab === "COLLECTION" ? (
              <button
                type="button"
                onClick={() => {
                  setGameToEdit(null);
                  setDefaultIsWishlist(false);
                  setIsFormModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Jogo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setGameToEdit(null);
                  setDefaultIsWishlist(true);
                  setIsFormModalOpen(true);
                }}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-pink-600/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Adicionar ao Radar</span>
              </button>
            )}
          </div>
        </div>

        {mainTab === "WISHLIST" ? (
          <WishlistView
            games={games}
            onOpenAddModal={() => {
              setGameToEdit(null);
              setDefaultIsWishlist(true);
              setIsFormModalOpen(true);
            }}
            onEditGame={(game) => {
              setGameToEdit(game);
              setDefaultIsWishlist(true);
              setIsFormModalOpen(true);
            }}
            onDeleteGame={handleDeleteGame}
            onMoveToCollection={handleMoveToCollection}
            onSelectGameDetail={(game) => setGameDetail(game)}
          />
        ) : (
          <>
            {/* Bird's Eye Statistics */}
            <StatsBar
              games={collectionGames}
              activeStatusFilter={statusFilter}
              onFilterByStatus={(st) => setStatusFilter(st)}
              activeOriginFilter={originFilter}
              onFilterByOrigin={(og) => setOriginFilter(og)}
              activeArchiveFilter={archiveFilter}
              onFilterByArchive={(arch) => setArchiveFilter(arch)}
            />

            {/* Hall of Fame Featured Vitrina */}
            <HallOfFame
              games={collectionGames}
              onSelectGame={(g) => setGameDetail(g)}
              onToggleFavorite={handleToggleFavorite}
              onAutoPickTopGames={handleAutoPickTopFavorites}
            />

            {/* Custom Categories Filter Tabs */}
            <CategoryFilterTabs
              categories={categories}
              activeCategory={activeCategoryFilter}
              onSelectCategory={(cat) => setActiveCategoryFilter(cat)}
              onOpenManageModal={() => {
                setCategoryAssignMode(false);
                setIsCategoryModalOpen(true);
              }}
              categoryCounts={categoryGameCounts}
              totalGamesCount={collectionGames.length}
            />

            {/* Filter & Search Bar */}
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              status={statusFilter}
              onStatusChange={setStatusFilter}
              originType={originFilter}
              onOriginTypeChange={setOriginFilter}
              platform={platformFilter}
              onPlatformChange={setPlatformFilter}
              tagFilter={tagFilter}
              onTagFilterChange={setTagFilter}
              durationFilter={durationFilter}
              onDurationFilterChange={setDurationFilter}
              eraFilter={eraFilter}
              onEraFilterChange={setEraFilter}
              favoriteOnly={favoriteOnly}
              onFavoriteOnlyToggle={() => setFavoriteOnly(!favoriteOnly)}
              archiveFilter={archiveFilter}
              onArchiveFilterChange={setArchiveFilter}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              availablePlatforms={availablePlatforms}
              availableTags={availableTags}
              archivedCount={collectionGames.filter((g) => g.isArchived).length}
            />

            {/* Loading Spinner */}
            {loading && (
              <div className="py-24 flex flex-col items-center justify-center text-zinc-500 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-sm">A carregar a tua biblioteca...</p>
              </div>
            )}

            {/* Empty Collection State */}
            {!loading && collectionGames.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center justify-center bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                  <Ghost className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">A tua coleção está vazia!</h3>
                <p className="text-sm text-zinc-400 max-w-md mb-6">
                  Começa a catalogar os teus jogos favoritos — sejam da Steam, FitGirl repacks, ROMs de emulador ou cópias físicas.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setGameToEdit(null);
                      setDefaultIsWishlist(false);
                      setIsFormModalOpen(true);
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Jogo
                  </button>
                </div>
              </div>
            )}

            {/* No Matches Found Filter State */}
            {!loading && collectionGames.length > 0 && filteredGames.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center justify-center bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-8">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-bold text-zinc-200 mb-1">Nenhum jogo encontrado</h3>
                <p className="text-xs text-zinc-400 max-w-sm mb-4">
                  Nenhum item corresponde aos filtros selecionados. Tenta pesquisar outro termo ou limpar os filtros.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                    setOriginFilter("ALL");
                    setPlatformFilter("ALL");
                    setTagFilter("ALL");
                    setDurationFilter("ALL");
                    setEraFilter("ALL");
                    setFavoriteOnly(false);
                    setArchiveFilter("ALL");
                    setActiveCategoryFilter("ALL");
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
                >
                  Redefinir todos os filtros
                </button>
              </div>
            )}

            {/* Games Grid View */}
            {!loading && filteredGames.length > 0 && viewMode === "grid" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                {filteredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onClick={() => setGameDetail(game)}
                    onEdit={() => {
                      setGameToEdit(game);
                      setDefaultIsWishlist(false);
                      setIsFormModalOpen(true);
                    }}
                    onDelete={() => handleDeleteGame(game)}
                    onToggleArchive={handleToggleArchive}
                    onToggleInstalled={handleToggleInstalled}
                    onToggleFavorite={handleToggleFavorite}
                    onQuickUpdateStatus={(g, st) => handleUpdateStatus(g, st)}
                    isSelected={selectedGameIds.includes(game.id)}
                    onToggleSelect={handleToggleSelectGame}
                  />
                ))}
              </div>
            )}

            {/* Games List / Table View */}
            {!loading && filteredGames.length > 0 && viewMode === "list" && (
              <GameListView
                games={filteredGames}
                onSelectGame={(game) => setGameDetail(game)}
                onEditGame={(game) => {
                  setGameToEdit(game);
                  setDefaultIsWishlist(false);
                  setIsFormModalOpen(true);
                }}
                onDeleteGame={(game) => handleDeleteGame(game)}
                onToggleArchive={handleToggleArchive}
                onToggleFavorite={handleToggleFavorite}
                onQuickUpdateStatus={(g, st) => handleUpdateStatus(g, st)}
                selectedGameIds={selectedGameIds}
                onToggleSelectGame={handleToggleSelectGame}
                onToggleSelectAll={handleToggleSelectAllFiltered}
                allSelected={allFilteredSelected}
              />
            )}
          </>
        )}
          </>
        )}
      </main>

      {/* Floating Bulk Action Bar */}
      {activeVault === "GAMES" && mainTab === "COLLECTION" && (
        <BulkActionBar
          selectedCount={selectedGameIds.length}
          totalFilteredCount={filteredGames.length}
          allSelected={allFilteredSelected}
          onToggleSelectAll={handleToggleSelectAllFiltered}
          onClearSelection={handleClearSelection}
          onOpenBulkEdit={() => setIsBulkEditOpen(true)}
          onOpenCategoryAssign={() => {
            setCategoryAssignMode(true);
            setIsCategoryModalOpen(true);
          }}
          onBulkDelete={handleBulkDelete}
          onBulkToggleArchive={handleBulkToggleArchive}
          onBulkTogglePlatinum={handleBulkTogglePlatinum}
        />
      )}

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={isBulkEditOpen}
        selectedCount={selectedGameIds.length}
        onClose={() => setIsBulkEditOpen(false)}
        onApply={handleBulkApplyEdit}
      />

      {/* Category Management & Assign Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        categories={categories}
        games={collectionGames}
        selectedGameIds={selectedGameIds}
        assignMode={categoryAssignMode}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCategoryAssignMode(false);
        }}
        onCreateCategory={handleCreateCategory}
        onDeleteCategory={handleDeleteCategory}
        onAssignToCategory={handleAssignToCategory}
        onAutoFranchises={handleAutoFranchises}
      />

      {/* Add / Edit Form Modal */}
      <GameFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setGameToEdit(null);
          setDefaultIsWishlist(false);
        }}
        onSave={handleSaveGame}
        initialGame={gameToEdit}
        defaultIsWishlist={defaultIsWishlist}
      />

      {/* Game Detail Modal */}
      <GameDetailModal
        game={gameDetail}
        onClose={() => setGameDetail(null)}
        onEdit={(game) => {
          setGameToEdit(game);
          setDefaultIsWishlist(false);
          setIsFormModalOpen(true);
        }}
        onDelete={handleDeleteGame}
        onUpdateStatus={handleUpdateStatus}
        onToggleArchive={handleToggleArchive}
        onToggleSavefile={handleToggleSavefile}
        onToggleAchievements={handleToggleAchievements}
        onTogglePlatinum={handleTogglePlatinum}
        onToggleFavorite={handleToggleFavorite}
        onGameUpdated={(updated) => {
          setGames((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
          setGameDetail(updated);
        }}
      />

      {/* Batch Import Modal */}
      <BatchImportModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onImportSuccess={() => {
          fetchGames();
          showToast("Jogos em lote importados com sucesso!");
        }}
      />

      {/* Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onRestoreSuccess={() => {
          fetchGames();
          fetchCategories();
          showToast("Coleção restaurada com sucesso!");
        }}
      />

      {/* Random Roulette Picker Modal */}
      <RandomPickerModal
        isOpen={isRandomModalOpen}
        onClose={() => setIsRandomModalOpen(false)}
        games={collectionGames}
        onSelectGame={(game) => setGameDetail(game)}
      />

      {/* Stats & Savings Modal */}
      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        games={games}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        games={games}
        onAddWishlistGame={() => {
          setGameToEdit(null);
          setDefaultIsWishlist(true);
          setIsFormModalOpen(true);
        }}
        onMoveToCollection={handleMoveToCollection}
        onDeleteGame={handleDeleteGame}
      />

      {/* Backlog Goals Modal */}
      <BacklogGoalsModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        goals={goals}
        onCreateGoal={handleCreateGoal}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
      />

      {/* Steam Replay Style Gamer Wrap-Up Modal */}
      <GamerWrapUpModal
        isOpen={isWrapUpModalOpen}
        onClose={() => setIsWrapUpModalOpen(false)}
        games={collectionGames}
      />

      {/* Holo Gamer Card & Export Modal */}
      <GamerCardModal
        isOpen={isGamerCardModalOpen}
        onClose={() => setIsGamerCardModalOpen(false)}
        games={collectionGames}
      />

      {/* Radar de Versões & Patches Modal */}
      <VersionRadarModal
        isOpen={isVersionRadarOpen}
        onClose={() => setIsVersionRadarOpen(false)}
        games={collectionGames}
        onSelectGame={(game) => {
          setIsVersionRadarOpen(false);
          setGameDetail(game);
        }}
        onRefreshGames={fetchGames}
      />

      {/* Media Add / Edit Modal */}
      <MediaFormModal
        isOpen={isMediaFormOpen}
        onClose={() => {
          setIsMediaFormOpen(false);
          setMediaToEdit(null);
        }}
        onSave={handleSaveMedia}
        initialMedia={mediaToEdit}
      />

      {/* Media Detail Modal */}
      <MediaDetailModal
        media={mediaDetail}
        onClose={() => setMediaDetail(null)}
        onEdit={(m) => {
          setMediaToEdit(m);
          setIsMediaFormOpen(true);
        }}
        onDelete={handleDeleteMedia}
        onUpdateStatus={handleUpdateMediaStatus}
        onIncrementEpisode={handleIncrementEpisode}
        onDecrementEpisode={handleDecrementEpisode}
        onToggleFavorite={handleToggleMediaFavorite}
      />
    </div>
  );
}
