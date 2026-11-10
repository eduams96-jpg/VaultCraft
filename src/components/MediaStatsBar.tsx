"use client";

import React from "react";
import { MediaItem } from "@/types/media";
import { Film, Tv, CheckCircle2, Clock, Star, Bookmark } from "lucide-react";

interface MediaStatsBarProps {
  mediaItems: MediaItem[];
  activeTypeFilter: string;
  onFilterByType: (type: string) => void;
  activeStatusFilter: string;
  onFilterByStatus: (status: string) => void;
}

export function MediaStatsBar({
  mediaItems,
  activeTypeFilter,
  onFilterByType,
  activeStatusFilter,
  onFilterByStatus,
}: MediaStatsBarProps) {
  const total = mediaItems.length;
  const movies = mediaItems.filter((m) => m.type === "MOVIE");
  const series = mediaItems.filter((m) => m.type !== "MOVIE");
  const watching = mediaItems.filter((m) => m.status === "WATCHING");
  const completed = mediaItems.filter((m) => m.status === "COMPLETED");
  const watchlist = mediaItems.filter((m) => m.status === "PLAN_TO_WATCH");
  const favorites = mediaItems.filter((m) => m.isFavorite);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Total Titles */}
      <div
        onClick={() => {
          onFilterByType("ALL");
          onFilterByStatus("ALL");
        }}
        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
          activeTypeFilter === "ALL" && activeStatusFilter === "ALL"
            ? "bg-purple-950/40 border-purple-500/50 text-white shadow-lg shadow-purple-950/30"
            : "bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800 text-zinc-300"
        }`}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Total Coleção</span>
        <div className="text-xl font-black text-white mt-0.5">{total}</div>
        <span className="text-[11px] text-zinc-500">Filmes & Séries</span>
      </div>

      {/* Movies */}
      <div
        onClick={() => onFilterByType(activeTypeFilter === "MOVIE" ? "ALL" : "MOVIE")}
        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
          activeTypeFilter === "MOVIE"
            ? "bg-purple-600/20 border-purple-500/50 text-white shadow-lg shadow-purple-600/20"
            : "bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800 text-zinc-300"
        }`}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
          <Film className="w-3 h-3" />
          Filmes
        </span>
        <div className="text-xl font-black text-white mt-0.5">{movies.length}</div>
        <span className="text-[11px] text-purple-300/80">{movies.filter((m) => m.status === "COMPLETED").length} vistos</span>
      </div>

      {/* Series */}
      <div
        onClick={() => onFilterByType(activeTypeFilter === "SERIES" ? "ALL" : "SERIES")}
        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
          activeTypeFilter === "SERIES"
            ? "bg-sky-600/20 border-sky-500/50 text-white shadow-lg shadow-sky-600/20"
            : "bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800 text-zinc-300"
        }`}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
          <Tv className="w-3 h-3" />
          Séries & Animes
        </span>
        <div className="text-xl font-black text-white mt-0.5">{series.length}</div>
        <span className="text-[11px] text-sky-300/80">{series.filter((m) => m.status === "WATCHING").length} a acompanhar</span>
      </div>

      {/* A Assistir */}
      <div
        onClick={() => onFilterByStatus(activeStatusFilter === "WATCHING" ? "ALL" : "WATCHING")}
        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
          activeStatusFilter === "WATCHING"
            ? "bg-emerald-600/20 border-emerald-500/50 text-white shadow-lg shadow-emerald-600/20"
            : "bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800 text-zinc-300"
        }`}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          A Assistir
        </span>
        <div className="text-xl font-black text-emerald-400 mt-0.5">{watching.length}</div>
        <span className="text-[11px] text-emerald-500/80">Em andamento</span>
      </div>

      {/* Concluídos */}
      <div
        onClick={() => onFilterByStatus(activeStatusFilter === "COMPLETED" ? "ALL" : "COMPLETED")}
        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
          activeStatusFilter === "COMPLETED"
            ? "bg-blue-600/20 border-blue-500/50 text-white shadow-lg shadow-blue-600/20"
            : "bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800 text-zinc-300"
        }`}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Vistos / Concluídos
        </span>
        <div className="text-xl font-black text-blue-400 mt-0.5">{completed.length}</div>
        <span className="text-[11px] text-blue-500/80">Concluídos</span>
      </div>

      {/* Watchlist */}
      <div
        onClick={() => onFilterByStatus(activeStatusFilter === "PLAN_TO_WATCH" ? "ALL" : "PLAN_TO_WATCH")}
        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
          activeStatusFilter === "PLAN_TO_WATCH"
            ? "bg-amber-600/20 border-amber-500/50 text-white shadow-lg shadow-amber-600/20"
            : "bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800 text-zinc-300"
        }`}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
          <Bookmark className="w-3 h-3" />
          Para Ver
        </span>
        <div className="text-xl font-black text-amber-400 mt-0.5">{watchlist.length}</div>
        <span className="text-[11px] text-amber-500/80">Watchlist</span>
      </div>
    </div>
  );
}
