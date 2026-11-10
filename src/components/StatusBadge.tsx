import React from "react";
import { GameStatus } from "@/types/game";
import { Clock, Play, CheckCircle2, Trophy, PauseCircle, XCircle, PackageCheck, CircleDashed } from "lucide-react";

interface StatusBadgeProps {
  status: GameStatus | string;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className = "", showIcon = true }: StatusBadgeProps) {
  switch (status) {
    case "AVAILABLE":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 ${className}`}
        >
          {showIcon && <PackageCheck className="w-3 h-3 text-cyan-400" />}
          <span>Disponível</span>
        </span>
      );
    case "BACKLOG":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 ${className}`}
        >
          {showIcon && <Clock className="w-3 h-3" />}
          <span>Backlog</span>
        </span>
      );
    case "PLAYING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className}`}
        >
          {showIcon && <Play className="w-3 h-3 fill-emerald-400" />}
          <span>A Jogar</span>
        </span>
      );
    case "COMPLETED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3 h-3 text-teal-400" />}
          <span>Concluído</span>
        </span>
      );
    case "PLATINUM":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-500/20 ${className}`}
        >
          {showIcon && <Trophy className="w-3 h-3 text-amber-400" />}
          <span>Platinado</span>
        </span>
      );
    case "PAUSED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 ${className}`}
        >
          {showIcon && <PauseCircle className="w-3 h-3 text-yellow-400" />}
          <span>Em Pausa</span>
        </span>
      );
    case "NOT_STARTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-700/40 text-zinc-300 border border-zinc-600/40 ${className}`}
        >
          {showIcon && <CircleDashed className="w-3 h-3 text-zinc-400" />}
          <span>Não Iniciado</span>
        </span>
      );
    case "ABANDONED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 ${className}`}
        >
          {showIcon && <XCircle className="w-3 h-3 text-rose-400" />}
          <span>Abandonado</span>
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700 ${className}`}
        >
          <span>{status}</span>
        </span>
      );
  }
}
