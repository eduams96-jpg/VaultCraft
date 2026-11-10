"use client";

import React, { useState } from "react";
import { GameItem } from "@/types/game";
import { StatusBadge } from "./StatusBadge";
import { Star, Trophy, Sparkles, ChevronDown, ChevronUp, Clock, Hourglass } from "lucide-react";

interface HallOfFameProps {
  games: GameItem[];
  onSelectGame: (game: GameItem) => void;
  onToggleFavorite: (game: GameItem) => void;
  onAutoPickTopGames?: () => void;
}

export function HallOfFame({
  games,
  onSelectGame,
  onToggleFavorite,
  onAutoPickTopGames,
}: HallOfFameProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Filter favorite games
  const favorites = games.filter((g) => !g.isWishlist && g.isFavorite);

  // If no favorites and no auto-picker, don't show
  if (favorites.length === 0 && !onAutoPickTopGames) return null;

  const RANK_BADGES = [
    { label: "1º", icon: "🥇", ring: "ring-amber-400 border-amber-400/80 shadow-amber-500/25" },
    { label: "2º", icon: "🥈", ring: "ring-zinc-300 border-zinc-300/80 shadow-zinc-400/25" },
    { label: "3º", icon: "🥉", ring: "ring-amber-700 border-amber-600/80 shadow-amber-700/25" },
    { label: "4º", icon: "⭐", ring: "ring-indigo-400 border-indigo-400/60 shadow-indigo-500/20" },
    { label: "5º", icon: "⭐", ring: "ring-indigo-400 border-indigo-400/60 shadow-indigo-500/20" },
  ];

  return (
    <div className="mb-6 rounded-3xl bg-gradient-to-r from-amber-950/30 via-zinc-900 to-indigo-950/30 border border-amber-500/30 p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Background glow */}
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10 mb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-lg border border-amber-500/40 shadow-inner">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide flex items-center gap-1.5">
                <span>Hall of Fame & Vitrina de Destaques</span>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {favorites.length}/5
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-zinc-400">
              Os teus jogos de eleição e foco absoluto — destacados na tua coleção e no teu Gamer Card.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {favorites.length === 0 && onAutoPickTopGames && (
            <button
              type="button"
              onClick={onAutoPickTopGames}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Fixar os 3 jogos com mais horas jogadas"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Auto-Fixar Mais Jogados</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            title={collapsed ? "Expandir Vitrina" : "Recolher Vitrina"}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="relative z-10 animate-in fade-in duration-200">
          {favorites.length === 0 ? (
            <div className="p-6 text-center bg-zinc-950/60 border border-dashed border-amber-500/30 rounded-2xl">
              <p className="text-xs text-zinc-300 font-medium mb-1">
                Ainda não tens jogos fixados no teu Hall of Fame.
              </p>
              <p className="text-[11px] text-zinc-500 max-w-md mx-auto mb-3">
                Clica na estrela ⭐ de qualquer jogo (no cartão ou na lista) para o destacar no topo da tua biblioteca!
              </p>
              {onAutoPickTopGames && (
                <button
                  type="button"
                  onClick={onAutoPickTopGames}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Fixar Top 3 Mais Jogados Agora
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {favorites.slice(0, 5).map((game, idx) => {
                const badge = RANK_BADGES[idx] || RANK_BADGES[4];
                return (
                  <div
                    key={game.id}
                    onClick={() => onSelectGame(game)}
                    className="group relative bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-2xl p-2.5 transition-all duration-200 cursor-pointer shadow-md flex items-center sm:flex-col gap-3 hover:-translate-y-0.5"
                  >
                    {/* Rank Number */}
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-amber-500/40 text-[11px] font-extrabold text-amber-300 shadow-md">
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </div>

                    {/* Unfavorite Button (1-click) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(game);
                      }}
                      className="absolute top-2 right-2 z-10 p-1 rounded-lg bg-black/70 hover:bg-rose-950/80 text-amber-400 hover:text-rose-400 border border-amber-500/30 transition-all opacity-80 group-hover:opacity-100"
                      title="Remover do Hall of Fame"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </button>

                    {/* Poster */}
                    <div className="w-16 h-24 sm:w-full sm:aspect-[2/3] sm:h-auto rounded-xl bg-zinc-900 overflow-hidden flex-shrink-0 relative border border-zinc-800">
                      {game.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={game.coverUrl}
                          alt={game.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🎮
                        </div>
                      )}
                    </div>

                    {/* Game Details */}
                    <div className="flex-1 min-w-0 sm:w-full sm:text-center space-y-1">
                      <h4 className="font-bold text-xs text-white group-hover:text-amber-300 truncate transition-colors">
                        {game.title}
                      </h4>

                      <div className="flex items-center sm:justify-center gap-2 text-[10px] text-zinc-400">
                        {game.hoursPlayed > 0 && (
                          <span className="flex items-center gap-1 font-mono text-amber-300/90 font-semibold">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {game.hoursPlayed}h
                          </span>
                        )}
                        {game.releaseYear && <span>{game.releaseYear}</span>}
                      </div>

                      <div className="pt-0.5 flex sm:justify-center">
                        <StatusBadge status={game.status} className="scale-90 origin-left sm:origin-center" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
