"use client";

import React from "react";
import { GameItem } from "@/types/game";
import { Gamepad2, Play, Trophy, Clock, PackageCheck, ShieldAlert, Archive } from "lucide-react";
import { playUiSound } from "@/lib/ui-sfx";

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

  const cards = [
    {
      key: "TOTAL",
      label: "Total",
      sub: "Catalogados",
      value: total,
      icon: Gamepad2,
      active: activeStatusFilter === "ALL" && activeOriginFilter === "ALL" && activeArchiveFilter === "ALL",
      accent: "text-zinc-300",
      activeRing: "bg-zinc-800/80 border-zinc-500/70 shadow-lg shadow-black/40",
      topBar: "from-zinc-400 to-zinc-600",
      onClick: () => {
        playUiSound("click");
        onFilterByStatus?.("ALL");
        onFilterByOrigin?.("ALL");
        onFilterByArchive?.("ALL");
      },
    },
    {
      key: "AVAILABLE",
      label: "Disponível",
      sub: "Prontos a jogar",
      value: available,
      icon: PackageCheck,
      active: activeStatusFilter === "AVAILABLE",
      accent: "text-cyan-400",
      activeRing: "bg-cyan-950/35 border-cyan-500/60 shadow-lg shadow-cyan-950/30",
      topBar: "from-cyan-400 to-sky-500",
      onClick: () => {
        playUiSound("click");
        onFilterByStatus?.(activeStatusFilter === "AVAILABLE" ? "ALL" : "AVAILABLE");
      },
    },
    {
      key: "PLAYING",
      label: "A Jogar",
      sub: "Em progresso",
      value: playing,
      icon: Play,
      active: activeStatusFilter === "PLAYING",
      accent: "text-emerald-400",
      activeRing: "bg-emerald-950/35 border-emerald-500/60 shadow-lg shadow-emerald-950/30",
      topBar: "from-emerald-400 to-teal-500",
      onClick: () => {
        playUiSound("click");
        onFilterByStatus?.(activeStatusFilter === "PLAYING" ? "ALL" : "PLAYING");
      },
    },
    {
      key: "BACKLOG",
      label: "Backlog",
      sub: "Por jogar",
      value: backlog,
      icon: Clock,
      active: activeStatusFilter === "BACKLOG",
      accent: "text-indigo-400",
      activeRing: "bg-indigo-950/35 border-indigo-500/60 shadow-lg shadow-indigo-950/30",
      topBar: "from-indigo-400 to-purple-500",
      onClick: () => {
        playUiSound("click");
        onFilterByStatus?.(activeStatusFilter === "BACKLOG" ? "ALL" : "BACKLOG");
      },
    },
    {
      key: "COMPLETED",
      label: "Concluídos",
      sub: "Terminados / 100%",
      value: completed,
      icon: Trophy,
      active: activeStatusFilter === "COMPLETED",
      accent: "text-teal-400",
      activeRing: "bg-teal-950/35 border-teal-500/60 shadow-lg shadow-teal-950/30",
      topBar: "from-teal-400 to-emerald-500",
      onClick: () => {
        playUiSound("click");
        onFilterByStatus?.(activeStatusFilter === "COMPLETED" ? "ALL" : "COMPLETED");
      },
    },
    {
      key: "REPACK",
      label: "Repacks",
      sub: "FitGirl / DODI",
      value: repacks,
      icon: ShieldAlert,
      active: activeOriginFilter === "REPACK",
      accent: "text-purple-400",
      activeRing: "bg-purple-950/35 border-purple-500/60 shadow-lg shadow-purple-950/30",
      topBar: "from-purple-400 to-pink-500",
      onClick: () => {
        playUiSound("click");
        onFilterByOrigin?.(activeOriginFilter === "REPACK" ? "ALL" : "REPACK");
      },
    },
    {
      key: "ARCHIVED",
      label: "Arquivados",
      sub: "Backup externo",
      value: archived,
      icon: Archive,
      active: activeArchiveFilter === "ARCHIVED",
      accent: "text-amber-400",
      activeRing: "bg-amber-950/35 border-amber-500/60 shadow-lg shadow-amber-950/30",
      topBar: "from-amber-400 to-orange-500",
      onClick: () => {
        playUiSound("click");
        onFilterByArchive?.(activeArchiveFilter === "ARCHIVED" ? "ALL" : "ARCHIVED");
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <button
            key={c.key}
            type="button"
            onClick={c.onClick}
            className={`relative overflow-hidden p-3 rounded-2xl border text-left transition-all duration-200 group cursor-pointer ${
              c.active
                ? c.activeRing
                : "bg-zinc-900/55 border-white/[0.07] hover:border-white/[0.16] hover:bg-zinc-900/85"
            }`}
          >
            <div
              className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${c.topBar} transition-opacity ${
                c.active ? "opacity-100" : "opacity-0 group-hover:opacity-60"
              }`}
            />
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] uppercase tracking-wider font-bold ${c.accent}`}>
                {c.label}
              </span>
              <Icon className={`w-3.5 h-3.5 ${c.accent} opacity-80 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className="text-xl font-black font-mono text-white tracking-tight">{c.value}</div>
            <p className="text-[10px] text-zinc-500 truncate mt-0.5">{c.sub}</p>
          </button>
        );
      })}
    </div>
  );
}
