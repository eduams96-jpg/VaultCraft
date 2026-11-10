"use client";

import React from "react";
import { MEDIA_CATEGORIES } from "@/types/media";
import {
  Search,
  Star,
  X,
  LayoutGrid,
  Grid3X3,
  List,
  FolderSearch,
} from "lucide-react";

interface MediaFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  qualityFilter: string;
  onQualityFilterChange: (quality: string) => void;
  favoriteOnly: boolean;
  onFavoriteOnlyToggle: () => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  viewMode: "grid" | "compact" | "list";
  onViewModeChange: (mode: "grid" | "compact" | "list") => void;
  onOpenScanModal?: () => void;
  categoryCounts?: Record<string, number>;
}

export function MediaFilterBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  qualityFilter,
  onQualityFilterChange,
  favoriteOnly,
  onFavoriteOnlyToggle,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  onOpenScanModal,
  categoryCounts = {},
}: MediaFilterBarProps) {
  const hasActiveFilters =
    search.trim() !== "" ||
    typeFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    qualityFilter !== "ALL" ||
    favoriteOnly;

  const handleClearFilters = () => {
    onSearchChange("");
    onTypeFilterChange("ALL");
    onStatusFilterChange("ALL");
    onQualityFilterChange("ALL");
    if (favoriteOnly) onFavoriteOnlyToggle();
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 mb-6 space-y-3.5 shadow-lg">
      {/* Category Tabs Row (Filmes, Séries, Filmes Animação, Desenhos Animados, Filmes PT, Séries PT, Animes) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {MEDIA_CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.key];
          const isSelected = typeFilter === cat.key;

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onTypeFilterChange(cat.key)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-[1.02]"
                  : "bg-zinc-950/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Controls Row: Search & Filters */}
      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-zinc-800/80">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Pesquisar por título, realizador, elenco ou género..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="ALL">Todos os Estados</option>
          <option value="PLAN_TO_WATCH">🍿 Para Ver (Watchlist)</option>
          <option value="WATCHING">👀 A Assistir</option>
          <option value="COMPLETED">✅ Visto / Concluído</option>
          <option value="PAUSED">⏸️ Em Pausa</option>
          <option value="DROPPED">🚫 Abandonado</option>
        </select>

        {/* Quality Dropdown */}
        <select
          value={qualityFilter}
          onChange={(e) => onQualityFilterChange(e.target.value)}
          className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="ALL">Qualidade (Todas)</option>
          <option value="4K HDR">4K HDR / Remux</option>
          <option value="1080p Remux">1080p Remux</option>
          <option value="1080p Web-DL">1080p Web-DL</option>
          <option value="720p">720p HD</option>
          <option value="Blu-Ray">Blu-Ray Físico</option>
          <option value="Streaming">Streaming</option>
        </select>

        {/* Favorite Only Chip */}
        <button
          type="button"
          onClick={onFavoriteOnlyToggle}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
            favoriteOnly
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
              : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700"
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${favoriteOnly ? "fill-amber-400 text-amber-400" : "text-zinc-500"}`} />
          <span>Favoritos</span>
        </button>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400 focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="updatedAt">Atualizados Recentemente</option>
          <option value="title">Título (A-Z)</option>
          <option value="rating">Melhor Avaliação</option>
          <option value="releaseYear">Ano de Lançamento</option>
        </select>

        {/* View Mode Toggle: Normal Grid, Compact Grid, List */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="Vista de Galeria Normal"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("compact")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "compact"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="Vista Compacta (Mais títulos no ecrã)"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "list"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="Vista de Tabela / Lista"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Folder Scanner Button (Opção 1) */}
        {onOpenScanModal && (
          <button
            type="button"
            onClick={onOpenScanModal}
            className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Escanear pasta de filmes/séries no computador ou NAS"
          >
            <FolderSearch className="w-3.5 h-3.5 text-purple-400" />
            <span>Scanner de Pastas</span>
          </button>
        )}

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline cursor-pointer"
          >
            Limpar Filtros
          </button>
        )}
      </div>
    </div>
  );
}
