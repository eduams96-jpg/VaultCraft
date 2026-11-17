import React from "react";
import { Archive } from "lucide-react";

interface ArchiveBadgeProps {
  isArchived: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  interactive?: boolean;
}

export function ArchiveBadge({
  isArchived,
  onClick,
  className = "",
  interactive = false,
}: ArchiveBadgeProps) {
  if (isArchived) {
    return (
      <span
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950/40 ${
          interactive ? "hover:bg-amber-500/30 cursor-pointer active:scale-95 transition-all" : ""
        } ${className}`}
        title="Jogo guardado no arquivo"
      >
        <Archive className="w-3 h-3 text-amber-400 shrink-0" />
        <span>Arquivado</span>
      </span>
    );
  }

  if (interactive) {
    return (
      <span
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-900/80 text-zinc-400 border border-zinc-800 hover:border-amber-500/40 hover:text-amber-300 cursor-pointer transition-all active:scale-95 ${className}`}
        title="Clica para marcar como arquivado"
      >
        <Archive className="w-3 h-3 text-zinc-500 hover:text-amber-400 shrink-0" />
        <span>Por Arquivar</span>
      </span>
    );
  }

  return null;
}
