import React from "react";
import { Save, Trophy, Crown } from "lucide-react";

interface GameFeaturesBadgesProps {
  hasSavefile?: boolean;
  hasAchievements?: boolean;
  isPlatinum?: boolean;
  interactive?: boolean;
  onToggleSavefile?: () => void;
  onToggleAchievements?: () => void;
  onTogglePlatinum?: () => void;
  className?: string;
}

export function GameFeaturesBadges({
  hasSavefile,
  hasAchievements,
  isPlatinum,
  interactive = false,
  onToggleSavefile,
  onToggleAchievements,
  onTogglePlatinum,
  className = "",
}: GameFeaturesBadgesProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Savefile indicator */}
      {(hasSavefile || interactive) && (
        <span
          onClick={interactive ? onToggleSavefile : undefined}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
            hasSavefile
              ? "bg-sky-500/15 border-sky-500/40 text-sky-300"
              : "bg-zinc-800/60 border-zinc-700/60 text-zinc-500 hover:text-sky-300"
          } ${interactive ? "cursor-pointer active:scale-95" : ""}`}
          title={hasSavefile ? "Ficheiro de Save guardado" : "Sem ficheiro de save"}
        >
          <Save className="w-2.5 h-2.5 shrink-0" />
          <span className="hidden sm:inline">Save</span>
        </span>
      )}

      {/* Achievements indicator */}
      {(hasAchievements || interactive) && (
        <span
          onClick={interactive ? onToggleAchievements : undefined}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
            hasAchievements
              ? "bg-purple-500/15 border-purple-500/40 text-purple-300"
              : "bg-zinc-800/60 border-zinc-700/60 text-zinc-500 hover:text-purple-300"
          } ${interactive ? "cursor-pointer active:scale-95" : ""}`}
          title={
            hasAchievements
              ? "Ficheiro de Conquistas / Achievements guardado"
              : "Sem ficheiro de conquistas"
          }
        >
          <Trophy className="w-2.5 h-2.5 shrink-0" />
          <span className="hidden sm:inline">Conquistas</span>
        </span>
      )}

      {/* Platinado indicator */}
      {(isPlatinum || interactive) && (
        <span
          onClick={interactive ? onTogglePlatinum : undefined}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
            isPlatinum
              ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-950/40"
              : "bg-zinc-800/60 border-zinc-700/60 text-zinc-500 hover:text-amber-300"
          } ${interactive ? "cursor-pointer active:scale-95" : ""}`}
          title={isPlatinum ? "Platinado / 100% Concluído!" : "Não platinado"}
        >
          <Crown className="w-2.5 h-2.5 shrink-0" />
          <span>Platinado</span>
        </span>
      )}
    </div>
  );
}
