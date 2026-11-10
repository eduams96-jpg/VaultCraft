import React from "react";
import { OriginType } from "@/types/game";
import { Disc, Gamepad2, Laptop, ShieldAlert, Zap, Layers } from "lucide-react";

interface OriginBadgeProps {
  originType: OriginType | string;
  repackGroup?: string | null;
  className?: string;
}

export function OriginBadge({ originType, repackGroup, className = "" }: OriginBadgeProps) {
  switch (originType) {
    case "REPACK":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 ${className}`}
          title={repackGroup ? `Repack: ${repackGroup}` : "Cópia Não-Oficial / Repack"}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>{repackGroup ? repackGroup : "Repack / Pirata"}</span>
        </span>
      );
    case "STEAM":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 ${className}`}
        >
          <Gamepad2 className="w-3.5 h-3.5 text-sky-400" />
          <span>Steam</span>
        </span>
      );
    case "GOG":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 ${className}`}
        >
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>GOG (DRM-Free)</span>
        </span>
      );
    case "EPIC":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-neutral-700/80 text-zinc-200 border border-zinc-600 ${className}`}
        >
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span>Epic Games</span>
        </span>
      );
    case "EMULATOR":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 ${className}`}
        >
          <Laptop className="w-3.5 h-3.5 text-emerald-400" />
          <span>ROM / Emulador</span>
        </span>
      );
    case "PHYSICAL":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/30 ${className}`}
        >
          <Disc className="w-3.5 h-3.5 text-blue-400" />
          <span>Cópia Física</span>
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 ${className}`}
        >
          <Gamepad2 className="w-3.5 h-3.5 text-zinc-400" />
          <span>{originType || "Outro"}</span>
        </span>
      );
  }
}
