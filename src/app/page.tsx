"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { GameItem, CategoryItem, GoalItem } from "@/types/game";
import { Navbar } from "@/components/Navbar";
import { GameFormModal } from "@/components/GameFormModal";
import { GameDetailModal } from "@/components/GameDetailModal";
import { BackupModal } from "@/components/BackupModal";
import { RandomPickerModal } from "@/components/RandomPickerModal";
import { StatsModal } from "@/components/StatsModal";
import { BatchImportModal } from "@/components/BatchImportModal";
import { BulkActionBar } from "@/components/BulkActionBar";
import { BulkEditModal, type BulkEditUpdates } from "@/components/BulkEditModal";
import { CategoryModal } from "@/components/CategoryModal";
import { WishlistView } from "@/components/WishlistView";
import { BacklogGoalsModal } from "@/components/BacklogGoalsModal";
import { GamerWrapUpModal } from "@/components/GamerWrapUpModal";
import { GamerCardModal } from "@/components/GamerCardModal";
import { VersionRadarModal } from "@/components/VersionRadarModal";
import { GamesVaultSection } from "@/components/GamesVaultSection";
import { GameScanModal } from "@/components/GameScanModal";
import { SpotlightModal } from "@/components/SpotlightModal";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import { useViewMode, setStoredViewMode, type ViewMode } from "@/hooks/useBrowserState";

/** GET JSON da API local; devolve null (e regista o erro) se falhar. */
async function fetchJson<T>(url: string, label: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    console.error(`Erro ao carregar ${label}:`, err);
    return null;
  }
}

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
  const viewMode = useViewMode();

  // Bulk Edit Modal State
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryAssignMode, setCategoryAssignMode] = useState(false);

  // Feature Modals
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isWrapUpModalOpen, setIsWrapUpModalOpen] = useState(false);
  const [isGamerCardModalOpen, setIsGamerCardModalOpen] = useState(false);
  const [isVersionRadarOpen, setIsVersionRadarOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isRandomModalOpen, setIsRandomModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isGameScanOpen, setIsGameScanOpen] = useState(false);
  const [defaultIsWishlist, setDefaultIsWishlist] = useState(false);

  const [gameToEdit, setGameToEdit] = useState<GameItem | null>(null);
  const [gameDetail, setGameDetail] = useState<GameItem | null>(null);

  // Status Notification Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(
    null
  );

  // Background Tasks Loading States
  const [isEnriching, setIsEnriching] = useState(false);
  const [isSyncingSteam, setIsSyncingSteam] = useState(false);
  const [isRescanningGames, setIsRescanningGames] = useState(false);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((text: string, type: "success" | "error" = "success") => {
    // Cancel the previous timer so an older toast can't hide a newer one early
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMsg({ text, type });
    toastTimerRef.current = setTimeout(() => {
      setToastMsg(null);
      toastTimerRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Carregamento de dados: todos os setState acontecem depois do await (nunca de forma
  // síncrona dentro do efeito de arranque).
  const fetchGames = useCallback(async () => {
    const data = await fetchJson<GameItem[]>("/api/games", "jogos");
    if (data) setGames(data);
    setLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const data = await fetchJson<CategoryItem[]>("/api/categories", "categorias");
    if (data) setCategories(data);
  }, []);

  const fetchGoals = useCallback(async () => {
    const data = await fetchJson<GoalItem[]>("/api/goals", "metas");
    if (data) setGoals(data);
  }, []);

  // Remove chaves antigas da Videoteca que já não são usadas
  useEffect(() => {
    try {
      localStorage.removeItem("gt_activeVault");
      localStorage.removeItem("gt_mediaViewMode");
    } catch {}
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setStoredViewMode(mode);
  }, []);

  // Global shortcuts: Alt+N opens the add-game modal; Escape closes the top-most modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setGameToEdit(null);
        setDefaultIsWishlist(mainTab === "WISHLIST");
        setIsFormModalOpen(true);
        return;
      }

      if (e.key !== "Escape") return;
      if (isFormModalOpen) {
        setIsFormModalOpen(false);
        setGameToEdit(null);
        setDefaultIsWishlist(false);
      } else if (isGameScanOpen) {
        setIsGameScanOpen(false);
      } else if (gameDetail) {
        setGameDetail(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mainTab, isFormModalOpen, isGameScanOpen, gameDetail]);

  // Carregamento inicial: os dados são aplicados no callback da promessa e ignorados
  // se o componente já tiver sido desmontado (ex.: duplo mount do StrictMode em dev).
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchJson<GameItem[]>("/api/games", "jogos"),
      fetchJson<CategoryItem[]>("/api/categories", "categorias"),
      fetchJson<GoalItem[]>("/api/goals", "metas"),
    ]).then(([gamesData, categoriesData, goalsData]) => {
      if (cancelled) return;
      if (gamesData) setGames(gamesData);
      if (categoriesData) setCategories(categoriesData);
      if (goalsData) setGoals(goalsData);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
          return (b.updatedAt || "").localeCompare(a.updatedAt || "");
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

  // Selection Logic via shared useMultiSelect hook (O(1) Set lookups)
  const {
    selectedIds: selectedGameIds,
    selectedSet: selectedGamesSet,
    allFilteredSelected,
    toggleSelectId: toggleSelectGameId,
    toggleSelectAllFiltered: handleToggleSelectAllFiltered,
    clearSelection: handleClearSelection,
    setSelectedIds: setSelectedGameIds,
  } = useMultiSelect(filteredGames);

  const handleToggleSelectGame = (game: GameItem, e: React.MouseEvent) => {
    toggleSelectGameId(game.id, e);
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
    const prevVal = game.isArchived;
    const nextVal = !prevVal;
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
      const res = await fetch(`/api/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: nextVal }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar arquivo");
    } catch (err) {
      console.error("Erro ao atualizar arquivo:", err);
      setGames((prev) =>
        prev.map((g) => (g.id === game.id ? { ...g, isArchived: prevVal } : g))
      );
      if (gameDetail && gameDetail.id === game.id) {
        setGameDetail({ ...gameDetail, isArchived: prevVal });
      }
      showToast(`Erro ao atualizar arquivo de "${game.title}".`, "error");
    }
  };

  // Quick Toggle Installed Status
  const handleToggleInstalled = async (game: GameItem) => {
    const prevVal = game.isInstalled;
    const nextVal = !prevVal;
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
      const res = await fetch(`/api/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isInstalled: nextVal }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar instalação");
    } catch (err) {
      console.error("Erro ao atualizar instalação:", err);
      setGames((prev) =>
        prev.map((g) => (g.id === game.id ? { ...g, isInstalled: prevVal } : g))
      );
      if (gameDetail && gameDetail.id === game.id) {
        setGameDetail({ ...gameDetail, isInstalled: prevVal });
      }
      showToast(`Erro ao atualizar instalação de "${game.title}".`, "error");
    }
  };

  // Quick Toggle Savefile
  const handleToggleSavefile = async (game: GameItem) => {
    const prevVal = game.hasSavefile;
    const nextVal = !prevVal;
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
      const res = await fetch(`/api/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasSavefile: nextVal }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar savefile");
    } catch (err) {
      console.error("Erro ao atualizar savefile:", err);
      setGames((prev) =>
        prev.map((g) => (g.id === game.id ? { ...g, hasSavefile: prevVal } : g))
      );
      if (gameDetail && gameDetail.id === game.id) {
        setGameDetail({ ...gameDetail, hasSavefile: prevVal });
      }
      showToast(`Erro ao atualizar savefile de "${game.title}".`, "error");
    }
  };

  // Quick Toggle Achievements
  const handleToggleAchievements = async (game: GameItem) => {
    const prevVal = game.hasAchievements;
    const nextVal = !prevVal;
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
      const res = await fetch(`/api/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasAchievements: nextVal }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar conquistas");
    } catch (err) {
      console.error("Erro ao atualizar conquistas:", err);
      setGames((prev) =>
        prev.map((g) => (g.id === game.id ? { ...g, hasAchievements: prevVal } : g))
      );
      if (gameDetail && gameDetail.id === game.id) {
        setGameDetail({ ...gameDetail, hasAchievements: prevVal });
      }
      showToast(`Erro ao atualizar conquistas de "${game.title}".`, "error");
    }
  };

  // Quick Toggle Platinum
  const handleTogglePlatinum = async (game: GameItem) => {
    const prevPlatinum = game.isPlatinum;
    const prevStatus = game.status;
    const nextVal = !(prevPlatinum || prevStatus === "PLATINUM");
    const nextStatus = nextVal ? "PLATINUM" : prevStatus === "PLATINUM" ? "COMPLETED" : prevStatus;

    setGames((prev) =>
      prev.map((g) =>
        g.id === game.id
          ? {
              ...g,
              isPlatinum: nextVal,
              status: nextStatus,
            }
          : g
      )
    );
    if (gameDetail && gameDetail.id === game.id) {
      setGameDetail({
        ...gameDetail,
        isPlatinum: nextVal,
        status: nextStatus,
      });
    }
    showToast(
      nextVal
        ? `👑 "${game.title}" marcado como PLATINADO / 100%! Parabéns!`
        : `"${game.title}" desmarcado de platinado`
    );

    try {
      const res = await fetch(`/api/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPlatinum: nextVal,
          status: nextStatus,
        }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar platinado");
    } catch (err) {
      console.error("Erro ao atualizar platinado:", err);
      setGames((prev) =>
        prev.map((g) =>
          g.id === game.id
            ? { ...g, isPlatinum: prevPlatinum, status: prevStatus }
            : g
        )
      );
      if (gameDetail && gameDetail.id === game.id) {
        setGameDetail({
          ...gameDetail,
          isPlatinum: prevPlatinum,
          status: prevStatus,
        });
      }
      showToast(`Erro ao atualizar platinado de "${game.title}".`, "error");
    }
  };

  // Quick Toggle Favorite (Hall of Fame)
  const handleToggleFavorite = async (game: GameItem) => {
    const prevVal = game.isFavorite;
    const nextVal = !prevVal;
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
      const res = await fetch(`/api/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: nextVal }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar favorito");
    } catch (err) {
      console.error("Erro ao atualizar favorito:", err);
      setGames((prev) =>
        prev.map((g) => (g.id === game.id ? { ...g, isFavorite: prevVal } : g))
      );
      if (gameDetail && gameDetail.id === game.id) {
        setGameDetail({ ...gameDetail, isFavorite: prevVal });
      }
      showToast(`Erro ao atualizar favorito de "${game.title}".`, "error");
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
    } catch (err) {
      console.error(err);
      showToast((err instanceof Error ? err.message : "") || "Erro ao enriquecer dados.", "error");
    } finally {
      setIsEnriching(false);
    }
  };

  // 1-Click Sync Steam Playtime Hours
  const handleSyncSteamHours = async () => {
    let identifier = "";
    try {
      identifier = localStorage.getItem("gt_steamId") || "";
    } catch {}
    if (!identifier) {
      identifier = (window.prompt("ID público da Steam (nome do perfil ou número de 17 dígitos):") || "").trim();
      if (!identifier) return;
      try {
        localStorage.setItem("gt_steamId", identifier);
      } catch {}
    }
    setIsSyncingSteam(true);
    showToast("🔄 A contactar a Steam para sincronizar horas de jogo...");
    try {
      const res = await fetch("/api/steam/sync-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao sincronizar horas da Steam.");

      await fetchGames();
      showToast(data.message || "Horas da Steam sincronizadas com sucesso!");
    } catch (err) {
      console.error(err);
      showToast((err instanceof Error ? err.message : "") || "Erro ao comunicar com a Steam.", "error");
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

  const handleRescanGameFolders = async () => {
    if (isRescanningGames) return;
    setIsRescanningGames(true);
    try {
      const res = await fetch("/api/games/rescan", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao sincronizar disco de jogos.");
      await fetchGames();
      showToast(data.message || "Disco de jogos sincronizado com sucesso!");
    } catch (err) {
      console.error(err);
      showToast((err instanceof Error ? err.message : "") || "Erro ao sincronizar pastas de jogos.", "error");
    } finally {
      setIsRescanningGames(false);
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
        activeTab={mainTab}
        onSelectTab={setMainTab}
        totalGames={collectionGames.length}
        wishlistCount={wishlistCount}
        onOpenAddModal={() => {
          setGameToEdit(null);
          setDefaultIsWishlist(false);
          setIsFormModalOpen(true);
        }}
        onOpenScanGamesModal={() => setIsGameScanOpen(true)}
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
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        onEnrichMetadata={handleEnrichMetadata}
        onSyncSteamHours={handleSyncSteamHours}
        isEnriching={isEnriching}
        isSyncingSteam={isSyncingSteam}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <GamesVaultSection
            collectionGames={collectionGames}
            filteredGames={filteredGames}
            categories={categories}
            loading={loading}
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            originFilter={originFilter}
            onOriginFilterChange={setOriginFilter}
            platformFilter={platformFilter}
            onPlatformFilterChange={setPlatformFilter}
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
            activeCategoryFilter={activeCategoryFilter}
            onActiveCategoryFilterChange={setActiveCategoryFilter}
            categoryGameCounts={categoryGameCounts}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            availablePlatforms={availablePlatforms}
            availableTags={availableTags}
            selectedGameIds={selectedGameIds}
            selectedGamesSet={selectedGamesSet}
            allFilteredSelected={allFilteredSelected}
            onToggleSelectGame={handleToggleSelectGame}
            onToggleSelectAllFiltered={handleToggleSelectAllFiltered}
            onOpenManageCategories={() => {
              setCategoryAssignMode(false);
              setIsCategoryModalOpen(true);
            }}
            onOpenAddGame={() => {
              setGameToEdit(null);
              setDefaultIsWishlist(false);
              setIsFormModalOpen(true);
            }}
            onOpenScanModal={() => setIsGameScanOpen(true)}
            onRescanFolders={handleRescanGameFolders}
            isRescanning={isRescanningGames}
            onOpenBatchModal={() => setIsBatchModalOpen(true)}
            onSelectGameDetail={setGameDetail}
            onEditGame={(game) => {
              setGameToEdit(game);
              setDefaultIsWishlist(false);
              setIsFormModalOpen(true);
            }}
            onDeleteGame={handleDeleteGame}
            onToggleArchive={handleToggleArchive}
            onToggleInstalled={handleToggleInstalled}
            onToggleFavorite={handleToggleFavorite}
            onQuickUpdateStatus={(g, st) => handleUpdateStatus(g, st)}
            onAutoPickTopFavorites={handleAutoPickTopFavorites}
          />
        )}
      </main>

      {/* Floating Bulk Action Bar */}
      {mainTab === "COLLECTION" && (
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
          onBulkUpdateStatus={(st) => handleBulkApplyEdit({ status: st as BulkEditUpdates["status"] })}
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

      {/* Add / Edit Form Modal: montado só quando abre, com key, para começar sempre com os dados certos */}
      {isFormModalOpen && (
      <GameFormModal
        key={gameToEdit?.id ?? (defaultIsWishlist ? "new-wishlist" : "new")}
        isOpen
        onClose={() => {
          setIsFormModalOpen(false);
          setGameToEdit(null);
          setDefaultIsWishlist(false);
        }}
        onSave={handleSaveGame}
        initialGame={gameToEdit}
        defaultIsWishlist={defaultIsWishlist}
      />
      )}

      {/* Game Detail Modal: key por jogo, para abrir sempre com estado limpo */}
      {gameDetail && (
      <GameDetailModal
        key={gameDetail.id}
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
      )}

      {/* Batch Import Modal */}
      <BatchImportModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onImportSuccess={() => {
          fetchGames();
          showToast("Jogos em lote importados com sucesso!");
        }}
      />

      {/* Game Folder Scanner Modal */}
      <GameScanModal
        isOpen={isGameScanOpen}
        onClose={() => setIsGameScanOpen(false)}
        onImportSuccess={async () => {
          await fetchGames();
          showToast("Jogos importados do disco com sucesso!");
        }}
      />

      {/* Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onRestoreSuccess={() => {
          fetchGames();
          fetchCategories();
          fetchGoals();
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

      {/* Global Spotlight Command Palette (Ctrl + K) */}
      <SpotlightModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onOpen={() => setIsSpotlightOpen(true)}
        games={collectionGames}
        onSelectGame={(game) => setGameDetail(game)}
        onOpenRandomModal={() => setIsRandomModalOpen(true)}
        onOpenStatsModal={() => setIsStatsModalOpen(true)}
        onOpenWrapUpModal={() => setIsWrapUpModalOpen(true)}
        onOpenScanGamesModal={() => setIsGameScanOpen(true)}
        onOpenAddGameModal={() => {
          setGameToEdit(null);
          setDefaultIsWishlist(false);
          setIsFormModalOpen(true);
        }}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenVersionRadarModal={() => setIsVersionRadarOpen(true)}
        onOpenGamerCardModal={() => setIsGamerCardModalOpen(true)}
        onOpenGoalsModal={() => setIsGoalsModalOpen(true)}
      />
    </div>
  );
}
