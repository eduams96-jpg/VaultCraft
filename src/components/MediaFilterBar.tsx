"use client";

import React from "react";
import { Search, Filter, Star, Film, Tv, Sparkles, X } from "lucide-react";

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
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 mb-6 space-y-3">
      {/* Top Search & Primary Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Pesquisar por filme, série, ator ou género..."
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

        {/* Type Pills */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          {[
            { key: "ALL", label: "Todos" },
            { key: "MOVIE", label: "🎬 Filmes" },
            { key: "SERIES", label: "📺 Séries" },
            { key: "ANIME", label: "🎌 Animes" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => onTypeFilterChange(t.key)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                typeFilter === t.key
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
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
          className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400 focus:outline-none focus:border-purple-500 cursor-pointer ml-auto"
        >
          <option value="updatedAt">Atualizados Recentemente</option>
          <option value="title">Título (A-Z)</option>
          <option value="rating">Melhor Avaliação</option>
          <option value="releaseYear">Ano de Lançamento</option>
        </select>

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
