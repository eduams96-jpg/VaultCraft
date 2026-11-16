"use client";

import React, { useState } from "react";
import { GameItem } from "@/types/game";
import {
  X,
  Flame,
  Clock,
  Crown,
  Sparkles,
  Calendar,
  Layers,
  Copy,
  Check,
  Gamepad2,
} from "lucide-react";
import { playUiSound } from "@/lib/ui-sfx";

interface GamerWrapUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: GameItem[];
}

export function GamerWrapUpModal({
  isOpen,
  onClose,
  games,
}: GamerWrapUpModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // ==========================================
  // GAMES REPLAY METRICS
  // ==========================================
  const collection = games.filter((g) => !g.isWishlist);
  const totalGames = collection.length;

  const totalHours =
    Math.round(collection.reduce((acc, g) => acc + (g.hoursPlayed || 0), 0) * 10) / 10;
  const totalDays = Math.round((totalHours / 24) * 10) / 10;

  const topPlayed = [...collection]
    .sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0))
    .slice(0, 5);

  const genreCounts: Record<string, number> = {};
  collection.forEach((g) => {
    if (g.genres) {
      g.genres
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((genre) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
    }
  });

  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const eraCounts = {
    "2020s (Geração Atual)": 0,
    "2010s (Era Dourada HD)": 0,
    "2000s (Clássicos PS2/PC)": 0,
    "Anos 90 & Retro": 0,
  };

  collection.forEach((g) => {
    if (g.releaseYear) {
      if (g.releaseYear >= 2020) eraCounts["2020s (Geração Atual)"]++;
      else if (g.releaseYear >= 2010) eraCounts["2010s (Era Dourada HD)"]++;
      else if (g.releaseYear >= 2000) eraCounts["2000s (Clássicos PS2/PC)"]++;
      else eraCounts["Anos 90 & Retro"]++;
    }
  });

  const completedCount = collection.filter((g) => g.status === "COMPLETED").length;
  const platinumCount = collection.filter((g) => g.isPlatinum || g.status === "PLATINUM").length;
  const playingCount = collection.filter((g) => g.status === "PLAYING").length;
  const backlogCount = collection.filter((g) => g.status === "BACKLOG").length;
  const finishRate =
    totalGames > 0 ? Math.round(((completedCount + platinumCount) / totalGames) * 100) : 0;

  const handleCopyText = () => {
    playUiSound("success");
    const text =
      `🎮 MEU RESUMO GAMER (VAULTCRAFT REPLAY)
━━━━━━━━━━━━━━━━━━━━
🕹️ Total de Jogos: ${totalGames}
⏱️ Horas Jogadas: ${totalHours}h (~${totalDays} dias de jogo)
🏆 Taxa de Conclusão: ${finishRate}% (${completedCount + platinumCount} jogos terminados, ${platinumCount} platinas)

🔥 TOP 3 MAIS JOGADOS:
1. ${topPlayed[0] ? `${topPlayed[0].title} (${topPlayed[0].hoursPlayed}h)` : "N/A"}
2. ${topPlayed[1] ? `${topPlayed[1].title} (${topPlayed[1].hoursPlayed}h)` : "N/A"}
3. ${topPlayed[2] ? `${topPlayed[2].title} (${topPlayed[2].hoursPlayed}h)` : "N/A"}

🧬 GÉNERO DOMINANTE: ${sortedGenres[0] ? `${sortedGenres[0][0]} (${sortedGenres[0][1]} jogos)` : "Variado"}
━━━━━━━━━━━━━━━━━━━━
Gerado via VaultCraft Studio`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Banner Hero */}
        <div className="relative p-6 sm:p-7 border-b border-zinc-800 flex flex-col gap-4 bg-gradient-to-br from-indigo-950 via-purple-950/60 to-zinc-950">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-white/10 text-white border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Gamer Wrap-Up (Replay)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                O Teu Perfil Gamer em Revista
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300">
                Uma viagem panorâmica pelas tuas horas, conquistas e vícios favoritos.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs text-zinc-300">
            {/* 3 Metric Hero Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Tempo de Vida no Jogo
                </span>
                <div className="text-2xl font-black text-indigo-400 font-mono">
                  {totalHours.toLocaleString()}h
                </div>
                <span className="text-[10px] text-zinc-500 block">
                  ≈ {totalDays} dias ininterruptos
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                  Biblioteca Total
                </span>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {totalGames}
                </div>
                <span className="text-[10px] text-zinc-500 block">
                  {playingCount} a jogar • {backlogCount} em backlog
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  Taxa de Conclusão
                </span>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {finishRate}%
                </div>
                <span className="text-[10px] text-zinc-500 block">
                  {completedCount + platinumCount} fechados ({platinumCount} platinas)
                </span>
              </div>
            </div>

            {/* Top 5 Most Played List */}
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  Os Teus 5 Maiores Vícios Históricos
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Por horas registadas</span>
              </div>

              <div className="space-y-2.5">
                {topPlayed.map((game, idx) => {
                  const percent =
                    totalHours > 0 ? Math.round(((game.hoursPlayed || 0) / totalHours) * 100) : 0;
                  return (
                    <div key={game.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-200 truncate flex items-center gap-2">
                          <span className="text-amber-400 font-black font-mono">#{idx + 1}</span>
                          <span>{game.title}</span>
                        </span>
                        <span className="font-mono text-zinc-400 font-semibold shrink-0">
                          {game.hoursPlayed}h ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(5, percent * 2.5))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DNA Gamer (Genres) & Eras */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-400" />
                  O Teu ADN Gamer (Géneros)
                </span>
                <div className="space-y-2">
                  {sortedGenres.map(([genre, count], i) => (
                    <div key={genre} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-500">{i + 1}.</span>
                        <span>{genre}</span>
                      </span>
                      <span className="text-purple-300 font-mono font-bold bg-purple-500/15 px-2 py-0.5 rounded-md border border-purple-500/30">
                        {count} jogos
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Viagem Pelas Épocas
                </span>
                <div className="space-y-2">
                  {Object.entries(eraCounts).map(([era, count]) => (
                    <div key={era} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300">{era}</span>
                      <span className="text-cyan-300 font-mono font-bold bg-cyan-500/15 px-2 py-0.5 rounded-md border border-cyan-500/30">
                        {count} jogos
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/90 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyText}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copiado para o Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copiar Ficha em Texto</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-white font-bold text-xs transition-colors cursor-pointer shadow-lg bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
