"use client";

import React, { useEffect, useRef } from "react";
import {
  Search,
  LayoutGrid,
  Grid3X3,
  List,
  X,
  Filter,
  Archive,
  Sparkles,
  Star,
  Clock,
  Trophy,
  Play,
  Moon,
  Zap,
  Coffee,
  FolderSearch,
  RefreshCw,
  ListPlus,
} from "lucide-react";
import { playUiSound } from "@/lib/ui-sfx";

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  originType: string;
  onOriginTypeChange: (val: string) => void;
  platform: string;
  onPlatformChange: (val: string) => void;
  tagFilter: string;
  onTagFilterChange: (val: string) => void;
  durationFilter: string;
  onDurationFilterChange: (val: string) => void;
  eraFilter: string;
  onEraFilterChange: (val: string) => void;
  favoriteOnly: boolean;
  onFavoriteOnlyToggle: () => void;
  archiveFilter: string; // "ALL" | "ARCHIVED" | "NOT_ARCHIVED"
  onArchiveFilterChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  viewMode: "grid" | "compact" | "list";
  onViewModeChange: (mode: "grid" | "compact" | "list") => void;
  availablePlatforms: string[];
  availableTags: string[];
  archivedCount?: number;
  onOpenScanModal?: () => void;
  onRescanFolders?: () => void;
  isRescanning?: boolean;
  onOpenBatchModal?: () => void;
}

export function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  originType,
  onOriginTypeChange,
  platform,
  onPlatformChange,
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
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  availablePlatforms,
  availableTags,
  archivedCount = 0,
  onOpenScanModal,
  onRescanFolders,
  isRescanning = false,
  onOpenBatchModal,
}: FilterBarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcuts (Press "/" to search, "Esc" to clear)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inInput = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";

      // Ctrl+K pertence à paleta Spotlight; aqui só "/" foca a pesquisa
      if (e.key === "/" && !inInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        if (search) onSearchChange("");
        searchInputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [search, onSearchChange]);

  const hasActiveFilters =
    search ||
    status !== "ALL" ||
    originType !== "ALL" ||
    platform !== "ALL" ||
    tagFilter !== "ALL" ||
    durationFilter !== "ALL" ||
    eraFilter !== "ALL" ||
    favoriteOnly ||
    archiveFilter !== "ALL";

  const clearFilters = () => {
    playUiSound("click");
    onSearchChange("");
    onStatusChange("ALL");
    onOriginTypeChange("ALL");
    onPlatformChange("ALL");
    onTagFilterChange("ALL");
    onDurationFilterChange("ALL");
    onEraFilterChange("ALL");
    if (favoriteOnly) onFavoriteOnlyToggle();
    onArchiveFilterChange("ALL");
  };

  return (
    <div className="bg-zinc-900/75 border border-zinc-800/80 rounded-2xl p-3.5 mb-6 backdrop-blur-md space-y-3 shadow-xl">
      {/* Row 1: 1-Click Quick Preset Chips + Disk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mr-1 hidden sm:inline-flex items-center gap-1">
            <Zap className="w-3 h-3 text-indigo-400" />
            1-Clique:
          </span>

          {/* All */}
          <button
            type="button"
            onClick={() => {
              playUiSound("click");
              onStatusChange("ALL");
              onDurationFilterChange("ALL");
              onEraFilterChange("ALL");
              if (favoriteOnly) onFavoriteOnlyToggle();
            }}
            className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              status === "ALL" && durationFilter === "ALL" && eraFilter === "ALL" && !favoriteOnly
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Todos</span>
          </button>

          {/* Favorites / Hall of Fame */}
          <button
            type="button"
            onClick={() => {
              playUiSound("click");
              onFavoriteOnlyToggle();
            }}
            className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              favoriteOnly
                ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/30"
                : "bg-zinc-950/80 text-amber-300/80 hover:text-amber-200 hover:bg-zinc-800 border border-amber-500/30"
            }`}
          >
            <Star className={`w-3 h-3 ${favoriteOnly ? "fill-zinc-950" : "fill-amber-400 text-amber-400"}`} />
            <span>Favoritos</span>
          </button>

          {/* Playing */}
          <button
            type="button"
            onClick={() => {
              playUiSound("click");
              onStatusChange(status === "PLAYING" ? "ALL" : "PLAYING");
              if (favoriteOnly) onFavoriteOnlyToggle();
            }}
            className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              status === "PLAYING"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
            }`}
          >
            <Play className="w-3 h-3 fill-current text-emerald-400" />
            <span>A Jogar</span>
          </button>

          {/* Backlog */}
          <button
            type="button"
            onClick={() => {
              playUiSound("click");
              onStatusChange(status === "BACKLOG" ? "ALL" : "BACKLOG");
              if (favoriteOnly) onFavoriteOnlyToggle();
            }}
            className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              status === "BACKLOG"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
            }`}
          >
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>Backlog</span>
          </button>

          {/* Por Estrear / 0 Hours */}
          <button
            type="button"
            onClick={() => {
              playUiSound("click");
              onDurationFilterChange(durationFilter === "UNPLAYED" ? "ALL" : "UNPLAYED");
              if (favoriteOnly) onFavoriteOnlyToggle();
            }}
            className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              durationFilter === "UNPLAYED"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
            }`}
            title="Jogos da coleção com exatamente 0 horas jogadas"
          >
            <Moon className="w-3 h-3 text-purple-400" />
            <span>Por Estrear (0h)</span>
          </button>

          {/* Quick (<5h) */}
          <button
            type="button"
            onClick={() => {
              playUiSound("click");
              onDurationFilterChange(durationFilter === "QUICK" ? "ALL" : "QUICK");
              if (favoriteOnly) onFavoriteOnlyToggle();
            }}
            className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              durationFilter === "QUICK"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
            }`}
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Rápidos (&lt;5h)</span>
          </button>

          {/* Short (5-10h) */}
          <button
            type="button"
            onClick={() => {
              playUiSound("click");
              onDurationFilterChange(durationFilter === "SHORT" ? "ALL" : "SHORT");
              if (favoriteOnly) onFavoriteOnlyToggle();
            }}
            className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              durationFilter === "SHORT"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
            }`}
          >
            <Coffee className="w-3 h-3 text-cyan-400" />
            <span>Curtos (5-10h)</span>
          </button>

          {/* Platinums */}
          <button
            type="button"
            onClick={() => {
              playUiSound("click");
              onStatusChange(status === "PLATINUM" ? "ALL" : "PLATINUM");
              if (favoriteOnly) onFavoriteOnlyToggle();
            }}
            className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              status === "PLATINUM"
                ? "bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-400/30"
                : "bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
            }`}
          >
            <Trophy className={`w-3 h-3 ${status === "PLATINUM" ? "text-zinc-950" : "text-amber-400"}`} />
            <span>Platinados</span>
          </button>
        </div>

        {/* Disk Scanner & Sync Quick Tools */}
        <div className="flex items-center gap-1.5">
          {onOpenScanModal && (
            <button
              type="button"
              onClick={() => {
                playUiSound("open");
                onOpenScanModal();
              }}
              className="h-7 px-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer"
              title="Escanear pasta de jogos ou ROMs no PC/NAS"
            >
              <FolderSearch className="w-3.5 h-3.5 text-indigo-400" />
              <span>Scanner de Pastas</span>
            </button>
          )}
          {onRescanFolders && (
            <button
              type="button"
              onClick={() => {
                playUiSound("click");
                onRescanFolders();
              }}
              disabled={isRescanning}
              className="h-7 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer disabled:opacity-50"
              title="Verificar no disco quais os jogos que estão instalados e detetar executáveis .exe"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRescanning ? "animate-spin" : ""}`} />
              <span>{isRescanning ? "A Sincronizar..." : "Sincronizar Disco"}</span>
            </button>
          )}
          {onOpenBatchModal && (
            <button
              type="button"
              onClick={() => {
                playUiSound("open");
                onOpenBatchModal();
              }}
              className="h-7 px-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer"
              title="Importar lista de jogos por texto"
            >
              <ListPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Importar Texto</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Search input + Archive + View Mode */}
      <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Pesquisar por título, notas, género... ('/')"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-9 pr-20 bg-zinc-950/90 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {search ? (
              <button
                onClick={() => onSearchChange("")}
                className="text-zinc-500 hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 rounded">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Archive Pills & View Mode */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <div className="flex items-center bg-zinc-950/90 border border-zinc-800 rounded-xl p-1 text-xs h-9">
            <button
              type="button"
              onClick={() => {
                playUiSound("click");
                onArchiveFilterChange("ALL");
              }}
              className={`h-7 px-2.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                archiveFilter === "ALL"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => {
                playUiSound("click");
                onArchiveFilterChange("ARCHIVED");
              }}
              className={`h-7 px-2.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                archiveFilter === "ARCHIVED"
                  ? "bg-amber-950/60 text-amber-300 border border-amber-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-amber-300"
              }`}
              title="Filtrar jogos guardados no arquivo"
            >
              <Archive className="w-3 h-3 text-amber-400" />
              <span>Arquivo</span>
              {archivedCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  {archivedCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                playUiSound("click");
                onArchiveFilterChange("NOT_ARCHIVED");
              }}
              className={`h-7 px-2.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                archiveFilter === "NOT_ARCHIVED"
                  ? "bg-zinc-800 text-zinc-200 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Filtrar jogos ativos (não arquivados)"
            >
              Ativos
            </button>
          </div>

          {/* View Mode Toggle: Grid, Compact, List */}
          <div className="flex items-center gap-1 bg-zinc-950/90 border border-zinc-800 rounded-xl p-1 h-9">
            <button
              type="button"
              onClick={() => {
                playUiSound("click");
                onViewModeChange("grid");
              }}
              className={`h-7 w-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Vista de Galeria Normal"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                playUiSound("click");
                onViewModeChange("compact");
              }}
              className={`h-7 w-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                viewMode === "compact"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Vista Compacta (8 capas por linha)"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                playUiSound("click");
                onViewModeChange("list");
              }}
              className={`h-7 w-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Vista em Lista Detalhada"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/70 text-xs">
        <span className="flex items-center gap-1.5 text-zinc-400 font-medium mr-1">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          Filtros:
        </span>

        {/* Status selector */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-8 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="ALL">Todos os Estados</option>
          <option value="AVAILABLE">Disponível</option>
          <option value="BACKLOG">Backlog</option>
          <option value="PLAYING">A Jogar</option>
          <option value="COMPLETED">Concluído</option>
          <option value="PLATINUM">Platinado</option>
          <option value="PAUSED">Em Pausa</option>
          <option value="NOT_STARTED">Não Iniciado</option>
        </select>

        {/* Origin selector */}
        <select
          value={originType}
          onChange={(e) => onOriginTypeChange(e.target.value)}
          className="h-8 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="ALL">Todas as Origens</option>
          <option value="REPACK">Repack / Pirata</option>
          <option value="STEAM">Steam</option>
          <option value="GOG">GOG</option>
          <option value="EPIC">Epic Games</option>
          <option value="EMULATOR">Emulador / ROM</option>
          <option value="PHYSICAL">Cópia Física</option>
          <option value="OTHER">Outro</option>
        </select>

        {/* Platform selector */}
        <select
          value={platform}
          onChange={(e) => onPlatformChange(e.target.value)}
          className="h-8 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="ALL">Todas as Plataformas</option>
          {availablePlatforms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {/* Eras / Décadas selector */}
        <select
          value={eraFilter}
          onChange={(e) => onEraFilterChange(e.target.value)}
          className="h-8 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          title="Filtrar por época / década de lançamento"
        >
          <option value="ALL">Todas as Eras</option>
          <option value="2020s">2020+ (Geração Atual)</option>
          <option value="2010s">2010 - 2019 (Era HD)</option>
          <option value="2000s">2000 - 2009 (Clássicos)</option>
          <option value="90s">Anos 90 &amp; Retro</option>
        </select>

        {/* Duration HLTB selector */}
        <select
          value={durationFilter}
          onChange={(e) => onDurationFilterChange(e.target.value)}
          className="h-8 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          title="Filtrar por duração estimada (HowLongToBeat)"
        >
          <option value="ALL">Qualquer Duração</option>
          <option value="UNPLAYED">Por Estrear (0h jogadas)</option>
          <option value="QUICK">Rápidos (&lt; 5h)</option>
          <option value="SHORT">Curtos (5h - 10h)</option>
          <option value="MEDIUM">Médios (10h - 25h)</option>
          <option value="LONG">Longos (25h - 50h)</option>
          <option value="EPIC">Épicos (50h+)</option>
        </select>

        {/* Tag selector */}
        {availableTags.length > 0 && (
          <select
            value={tagFilter}
            onChange={(e) => onTagFilterChange(e.target.value)}
            className="h-8 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Todas as Tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        )}

        {/* Sort By selector */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-zinc-500 text-[11px]">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="h-8 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="updatedAt">Mais Recentes</option>
            <option value="rating">Melhor Avaliados</option>
            <option value="hoursPlayed">Mais Horas Jogadas</option>
            <option value="title">Título (A-Z)</option>
            <option value="releaseYear">Ano de Lançamento</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="h-8 text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2.5 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
