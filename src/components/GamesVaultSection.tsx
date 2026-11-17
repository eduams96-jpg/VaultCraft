"use client";

import React, { useState, useEffect, useRef } from "react";
import { GameItem, CategoryItem } from "@/types/game";
import { StatsBar } from "@/components/StatsBar";
import { HallOfFame } from "@/components/HallOfFame";
import { CategoryFilterTabs } from "@/components/CategoryFilterTabs";
import { FilterBar } from "@/components/FilterBar";
import { GameCard } from "@/components/GameCard";
import { GameListView } from "@/components/GameListView";
import { FolderSearch, ListPlus, Loader2, Plus, SearchX } from "lucide-react";
import { EmptyGamesVaultIllustration } from "@/components/CraftIcons";
import { playUiSound } from "@/lib/ui-sfx";

const PAGE_SIZE = 60;

interface GamesVaultSectionProps {
  collectionGames: GameItem[];
  filteredGames: GameItem[];
  categories: CategoryItem[];
  loading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  originFilter: string;
  onOriginFilterChange: (val: string) => void;
  platformFilter: string;
  onPlatformFilterChange: (val: string) => void;
  tagFilter: string;
  onTagFilterChange: (val: string) => void;
  durationFilter: string;
  onDurationFilterChange: (val: string) => void;
  eraFilter: string;
  onEraFilterChange: (val: string) => void;
  favoriteOnly: boolean;
  onFavoriteOnlyToggle: () => void;
  archiveFilter: string;
  onArchiveFilterChange: (val: string) => void;
  activeCategoryFilter: string;
  onActiveCategoryFilterChange: (val: string) => void;
  categoryGameCounts: Record<string, number>;
  sortBy: string;
  onSortByChange: (val: string) => void;
  viewMode: "grid" | "compact" | "list";
  onViewModeChange: (mode: "grid" | "compact" | "list") => void;
  availablePlatforms: string[];
  availableTags: string[];
  selectedGameIds: string[];
  selectedGamesSet: Set<string>;
  allFilteredSelected: boolean;
  onToggleSelectGame: (game: GameItem, e: React.MouseEvent) => void;
  onToggleSelectAllFiltered: () => void;
  onOpenManageCategories: () => void;
  onOpenAddGame: () => void;
  onOpenScanModal?: () => void;
  onRescanFolders?: () => void;
  isRescanning?: boolean;
  onOpenBatchModal?: () => void;
  onSelectGameDetail: (game: GameItem) => void;
  onEditGame: (game: GameItem) => void;
  onDeleteGame: (game: GameItem) => void;
  onToggleArchive: (game: GameItem) => void;
  onToggleInstalled: (game: GameItem) => void;
  onToggleFavorite: (game: GameItem) => void;
  onQuickUpdateStatus: (game: GameItem, status: string) => void;
  onAutoPickTopFavorites: () => void;
}

export function GamesVaultSection({
  collectionGames,
  filteredGames,
  categories,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  originFilter,
  onOriginFilterChange,
  platformFilter,
  onPlatformFilterChange,
  tagFilter,
  onTagFilterChange,
  durationFilter,
  onDurationFilterChange,
  eraFilter,
  onEraFilterChange,
  favoriteOnly,
  onFavoriteOnlyToggle,
  archiveFilter,
  onArchiveFilterChange,
  activeCategoryFilter,
  onActiveCategoryFilterChange,
  categoryGameCounts,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  availablePlatforms,
  availableTags,
  selectedGameIds,
  selectedGamesSet,
  allFilteredSelected,
  onToggleSelectGame,
  onToggleSelectAllFiltered,
  onOpenManageCategories,
  onOpenAddGame,
  onOpenScanModal,
  onRescanFolders,
  isRescanning = false,
  onOpenBatchModal,
  onSelectGameDetail,
  onEditGame,
  onDeleteGame,
  onToggleArchive,
  onToggleInstalled,
  onToggleFavorite,
  onQuickUpdateStatus,
  onAutoPickTopFavorites,
}: GamesVaultSectionProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Volta à primeira página quando um filtro ou a ordenação muda. Ajustado durante o
  // render (padrão recomendado pelo React) em vez de num efeito, para não desenhar
  // primeiro a lista antiga e depois a nova.
  const filterKey = JSON.stringify([
    search,
    statusFilter,
    originFilter,
    platformFilter,
    tagFilter,
    durationFilter,
    eraFilter,
    favoriteOnly,
    archiveFilter,
    activeCategoryFilter,
    sortBy,
  ]);
  const [pagedFilterKey, setPagedFilterKey] = useState(filterKey);
  if (pagedFilterKey !== filterKey) {
    setPagedFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  const hasMore = visibleCount < filteredGames.length;

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredGames.length));
        }
      },
      { rootMargin: "250px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, filteredGames.length]);

  const paginatedGames = filteredGames.slice(0, visibleCount);

  return (
    <>
      <StatsBar
        games={collectionGames}
        activeStatusFilter={statusFilter}
        onFilterByStatus={onStatusFilterChange}
        activeOriginFilter={originFilter}
        onFilterByOrigin={onOriginFilterChange}
        activeArchiveFilter={archiveFilter}
        onFilterByArchive={onArchiveFilterChange}
      />

      <HallOfFame
        games={collectionGames}
        onSelectGame={onSelectGameDetail}
        onToggleFavorite={onToggleFavorite}
        onAutoPickTopGames={onAutoPickTopFavorites}
      />

      <CategoryFilterTabs
        categories={categories}
        activeCategory={activeCategoryFilter}
        onSelectCategory={onActiveCategoryFilterChange}
        onOpenManageModal={onOpenManageCategories}
        categoryCounts={categoryGameCounts}
        totalGamesCount={collectionGames.length}
      />

      <FilterBar
        search={search}
        onSearchChange={onSearchChange}
        status={statusFilter}
        onStatusChange={onStatusFilterChange}
        originType={originFilter}
        onOriginTypeChange={onOriginFilterChange}
        platform={platformFilter}
        onPlatformChange={onPlatformFilterChange}
        tagFilter={tagFilter}
        onTagFilterChange={onTagFilterChange}
        durationFilter={durationFilter}
        onDurationFilterChange={onDurationFilterChange}
        eraFilter={eraFilter}
        onEraFilterChange={onEraFilterChange}
        favoriteOnly={favoriteOnly}
        onFavoriteOnlyToggle={onFavoriteOnlyToggle}
        archiveFilter={archiveFilter}
        onArchiveFilterChange={onArchiveFilterChange}
        sortBy={sortBy}
        onSortByChange={onSortByChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        availablePlatforms={availablePlatforms}
        availableTags={availableTags}
        archivedCount={collectionGames.filter((g) => g.isArchived).length}
        onOpenScanModal={onOpenScanModal}
        onRescanFolders={onRescanFolders}
        isRescanning={isRescanning}
        onOpenBatchModal={onOpenBatchModal}
      />

      {loading && (
        <div className="py-24 flex flex-col items-center justify-center text-zinc-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm">A carregar a tua biblioteca...</p>
        </div>
      )}

      {!loading && collectionGames.length === 0 && (
        <div className="py-16 text-center flex flex-col items-center justify-center bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden">
          <div className="mb-3">
            <EmptyGamesVaultIllustration className="w-28 h-28" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">A tua coleção está vazia!</h3>
          <p className="text-sm text-zinc-400 max-w-md mb-6">
            Começa a catalogar os teus jogos — sejam da Steam, FitGirl/DODI repacks, ROMs de emulador ou cópias físicas.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {onOpenScanModal && (
              <button
                type="button"
                onClick={() => {
                  playUiSound("open");
                  onOpenScanModal();
                }}
                className="px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <FolderSearch className="w-4 h-4 text-indigo-400" />
                Escanear Pasta (PC/NAS)
              </button>
            )}
            {onOpenBatchModal && (
              <button
                type="button"
                onClick={() => {
                  playUiSound("open");
                  onOpenBatchModal();
                }}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <ListPlus className="w-4 h-4 text-indigo-400" />
                Importar Lista (Texto)
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                playUiSound("open");
                onOpenAddGame();
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar Jogo Manualmente
            </button>
          </div>
        </div>
      )}

      {!loading && collectionGames.length > 0 && filteredGames.length === 0 && (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-8">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
            <SearchX className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-200 mb-1">Nenhum jogo encontrado</h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-4">
            Nenhum item corresponde aos filtros selecionados. Tenta pesquisar outro termo ou limpar os filtros.
          </p>
          <button
            type="button"
            onClick={() => {
              playUiSound("click");
              onSearchChange("");
              onStatusFilterChange("ALL");
              onOriginFilterChange("ALL");
              onPlatformFilterChange("ALL");
              onTagFilterChange("ALL");
              onDurationFilterChange("ALL");
              onEraFilterChange("ALL");
              if (favoriteOnly) onFavoriteOnlyToggle();
              onArchiveFilterChange("ALL");
              onActiveCategoryFilterChange("ALL");
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
          >
            Redefinir todos os filtros
          </button>
        </div>
      )}

      {!loading && paginatedGames.length > 0 && (viewMode === "grid" || viewMode === "compact") && (
        <div
          className={
            viewMode === "compact"
              ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2.5 sm:gap-3"
              : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5"
          }
        >
          {paginatedGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              compact={viewMode === "compact"}
              onClick={() => onSelectGameDetail(game)}
              onEdit={() => onEditGame(game)}
              onDelete={() => onDeleteGame(game)}
              onToggleArchive={onToggleArchive}
              onToggleInstalled={onToggleInstalled}
              onToggleFavorite={onToggleFavorite}
              onQuickUpdateStatus={onQuickUpdateStatus}
              isSelected={selectedGamesSet.has(game.id)}
              onToggleSelect={onToggleSelectGame}
            />
          ))}
        </div>
      )}

      {!loading && paginatedGames.length > 0 && viewMode === "list" && (
        <GameListView
          games={paginatedGames}
          onSelectGame={onSelectGameDetail}
          onEditGame={onEditGame}
          onDeleteGame={onDeleteGame}
          onToggleArchive={onToggleArchive}
          onToggleFavorite={onToggleFavorite}
          onQuickUpdateStatus={onQuickUpdateStatus}
          selectedGameIds={selectedGameIds}
          onToggleSelectGame={onToggleSelectGame}
          onToggleSelectAll={onToggleSelectAllFiltered}
          allSelected={allFilteredSelected}
        />
      )}

      {!loading && hasMore && (
        <div ref={sentinelRef} className="mt-8 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredGames.length))}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
          >
            Mostrar mais (+{Math.min(PAGE_SIZE, filteredGames.length - visibleCount)}) — A mostrar{" "}
            {paginatedGames.length} de {filteredGames.length}
          </button>
        </div>
      )}
    </>
  );
}
