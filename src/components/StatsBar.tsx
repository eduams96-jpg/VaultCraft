"use client";

import React from "react";
import { GameItem } from "@/types/game";
import { Gamepad2, Play, Trophy, Clock, PackageCheck, ShieldAlert, Archive } from "lucide-react";

interface StatsBarProps {
  games: GameItem[];
  activeStatusFilter?: string;
  onFilterByStatus?: (status: string) => void;
  activeOriginFilter?: string;
  onFilterByOrigin?: (origin: string) => void;
  activeArchiveFilter?: string;
  onFilterByArchive?: (archive: string) => void;
}

export function StatsBar({
  games,
  activeStatusFilter,
  onFilterByStatus,
  activeOriginFilter,
  onFilterByOrigin,
  activeArchiveFilter,
  onFilterByArchive,
}: StatsBarProps) {
  const total = games.length;
  const available = games.filter((g) => g.status === "AVAILABLE").length;
  const playing = games.filter((g) => g.status === "PLAYING").length;
  const completed = games.filter((g) => g.status === "COMPLETED" || g.status === "PLATINUM").length;
  const backlog = games.filter((g) => g.status === "BACKLOG").length;
  const repacks = games.filter((g) => g.originType === "REPACK").length;
  const archived = games.filter((g) => g.isArchived).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      {/* Total Card */}
      <button
        type="button"
        onClick={() => {
          onFilterByStatus?.("ALL");
          onFilterByOrigin?.("ALL");
          onFilterByArchive?.("ALL");
        }}
        className={`p-3.5 rounded-xl border text-left transition-all group cursor-pointer ${
          activeStatusFilter === "ALL" && activeOriginFilter === "ALL" && activeArchiveFilter === "ALL"
            ? "bg-zinc-800 border-zinc-500 shadow-md"
            : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
        }`}
      >
        <div className="flex items-center justify-between text-zinc-400 mb-1">
          <span className="text-xs uppercase tracking-wider font-medium">Total</span>
          <Gamepad2 className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
        </div>
        <div className="text-2xl font-bold text-white">{total}</div>
        <p className="text-[11px] text-zinc-400 mt-0.5">Catalogados</p>
      </button>

      {/* Available Card */}
      <button
        type="button"
        onClick={() => onFilterByStatus?.(activeStatusFilter === "AVAILABLE" ? "ALL" : "AVAILABLE")}
        className={`p-3.5 rounded-xl border text-left transition-all group cursor-pointer ${
          activeStatusFilter === "AVAILABLE"
            ? "bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/50"
            : "bg-zinc-900/60 border-zinc-800 hover:border-cyan-500/40 hover:bg-cyan-950/20"
        }`}
      >
        <div className="flex items-center justify-between text-cyan-400 mb-1">
          <span className="text-xs uppercase tracking-wider font-medium">Disponível</span>
          <PackageCheck className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-2xl font-bold text-white">{available}</div>
        <p className="text-[11px] text-zinc-400 mt-0.5">Prontos a jogar</p>
      </button>

      {/* Playing Card */}
      <button
        type="button"
        onClick={() => onFilterByStatus?.(activeStatusFilter === "PLAYING" ? "ALL" : "PLAYING")}
        className={`p-3.5 rounded-xl border text-left transition-all group cursor-pointer ${
          activeStatusFilter === "PLAYING"
            ? "bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/50"
            : "bg-zinc-900/60 border-zinc-800 hover:border-emerald-500/40 hover:bg-emerald-950/20"
        }`}
      >
        <div className="flex items-center justify-between text-emerald-400 mb-1">
          <span className="text-xs uppercase tracking-wider font-medium">A Jogar</span>
          <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-white">{playing}</div>
        <p className="text-[11px] text-zinc-400 mt-0.5">Em progresso</p>
      </button>

      {/* Backlog Card */}
      <button
        type="button"
        onClick={() => onFilterByStatus?.(activeStatusFilter === "BACKLOG" ? "ALL" : "BACKLOG")}
        className={`p-3.5 rounded-xl border text-left transition-all group cursor-pointer ${
          activeStatusFilter === "BACKLOG"
            ? "bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/50"
            : "bg-zinc-900/60 border-zinc-800 hover:border-indigo-500/40 hover:bg-indigo-950/20"
        }`}
      >
        <div className="flex items-center justify-between text-indigo-400 mb-1">
          <span className="text-xs uppercase tracking-wider font-medium">Backlog</span>
          <Clock className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-2xl font-bold text-white">{backlog}</div>
        <p className="text-[11px] text-zinc-400 mt-0.5">Por jogar</p>
      </button>

      {/* Completed Card */}
      <button
        type="button"
        onClick={() => onFilterByStatus?.(activeStatusFilter === "COMPLETED" ? "ALL" : "COMPLETED")}
        className={`p-3.5 rounded-xl border text-left transition-all group cursor-pointer ${
          activeStatusFilter === "COMPLETED"
            ? "bg-teal-950/40 border-teal-500 shadow-md shadow-teal-950/50"
            : "bg-zinc-900/60 border-zinc-800 hover:border-teal-500/40 hover:bg-teal-950/20"
        }`}
      >
        <div className="flex items-center justify-between text-teal-400 mb-1">
          <span className="text-xs uppercase tracking-wider font-medium">Concluídos</span>
          <Trophy className="w-4 h-4 text-teal-400" />
        </div>
        <div className="text-2xl font-bold text-white">{completed}</div>
        <p className="text-[11px] text-zinc-400 mt-0.5">Terminados ou 100%</p>
      </button>

      {/* Repacks Card */}
      <button
        type="button"
        onClick={() => onFilterByOrigin?.(activeOriginFilter === "REPACK" ? "ALL" : "REPACK")}
        className={`p-3.5 rounded-xl border text-left transition-all group cursor-pointer ${
          activeOriginFilter === "REPACK"
            ? "bg-purple-950/40 border-purple-500 shadow-md shadow-purple-950/50"
            : "bg-zinc-900/60 border-zinc-800 hover:border-purple-500/40 hover:bg-purple-950/20"
        }`}
      >
        <div className="flex items-center justify-between text-purple-400 mb-1">
          <span className="text-xs uppercase tracking-wider font-medium">Repacks</span>
          <ShieldAlert className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-2xl font-bold text-white">{repacks}</div>
        <p className="text-[11px] text-zinc-400 mt-0.5">FitGirl / DODI / etc.</p>
      </button>

      {/* Archived Card */}
      <button
        type="button"
        onClick={() => onFilterByArchive?.(activeArchiveFilter === "ARCHIVED" ? "ALL" : "ARCHIVED")}
        className={`p-3.5 rounded-xl border text-left transition-all group cursor-pointer ${
          activeArchiveFilter === "ARCHIVED"
            ? "bg-amber-950/50 border-amber-500 shadow-md shadow-amber-950/60"
            : "bg-zinc-900/60 border-zinc-800 hover:border-amber-500/40 hover:bg-amber-950/20"
        }`}
      >
        <div className="flex items-center justify-between text-amber-400 mb-1">
          <span className="text-xs uppercase tracking-wider font-medium">Arquivados</span>
          <Archive className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold text-amber-300">{archived}</div>
        <p className="text-[11px] text-zinc-400 mt-0.5">Em backup externo</p>
      </button>
    </div>
  );
}
