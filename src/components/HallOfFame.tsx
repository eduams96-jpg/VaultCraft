"use client";

import React, { useState } from "react";
import { GameItem } from "@/types/game";
import { StatusBadge } from "./StatusBadge";
import { Star, Trophy, Sparkles, ChevronDown, ChevronUp, Clock, Gamepad2, Award } from "lucide-react";
import { playUiSound } from "@/lib/ui-sfx";

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
  const [collapsed, setCollapsed] = useState(true);

  const favorites = games.filter((g) => !g.isWishlist && g.isFavorite);

  if (favorites.length === 0 && !onAutoPickTopGames) return null;

  const RANK_STYLES = [
    { label: "#1", color: "text-amber-300 border-amber-400/60 bg-amber-950/80" },
    { label: "#2", color: "text-zinc-200 border-zinc-400/60 bg-zinc-900/80" },
    { label: "#3", color: "text-orange-300 border-orange-500/60 bg-orange-950/80" },
    { label: "#4", color: "text-indigo-300 border-indigo-500/50 bg-indigo-950/80" },
    { label: "#5", color: "text-indigo-300 border-indigo-500/50 bg-indigo-950/80" },
  ];

  return (
    <div className="mb-5 rounded-2xl bg-gradient-to-r from-amber-950/25 via-zinc-900/90 to-indigo-950/25 border border-amber-500/30 p-3.5 sm:p-4 shadow-xl relative overflow-hidden backdrop-blur-md">
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div
          onClick={() => {
            playUiSound("click");
            setCollapsed(!collapsed);
          }}
          className="flex items-center gap-3 cursor-pointer flex-1"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40 shadow-inner shrink-0">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-xs sm:text-sm text-white tracking-wide flex items-center gap-2">
                <span>Hall of Fame • Destaques</span>
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {favorites.length}/5
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Os teus jogos de eleição destacados na coleção e no teu Gamer Card.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {favorites.length === 0 && onAutoPickTopGames && (
            <button
              type="button"
              onClick={() => {
                playUiSound("platinum");
                onAutoPickTopGames();
                setCollapsed(false);
              }}
              className="h-7 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer shadow-sm"
              title="Fixar os 3 jogos com mais horas jogadas"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Auto-Fixar Top 3</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              playUiSound("click");
              setCollapsed(!collapsed);
            }}
            className="h-7 px-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
            title={collapsed ? "Expandir Vitrina" : "Recolher Vitrina"}
          >
            <span className="hidden md:inline text-[11px]">{collapsed ? "Expandir" : "Recolher"}</span>
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="relative z-10 mt-3.5 pt-3.5 border-t border-zinc-800/80 animate-in fade-in duration-200">
          {favorites.length === 0 ? (
            <div className="p-5 text-center bg-zinc-950/60 border border-dashed border-amber-500/30 rounded-2xl">
              <p className="text-xs text-zinc-300 font-medium mb-1">
                Ainda não tens jogos fixados no teu Hall of Fame.
              </p>
              <p className="text-[11px] text-zinc-500 max-w-md mx-auto mb-3">
                Clica no ícone de estrela em qualquer jogo para o destacar no topo da tua biblioteca.
              </p>
              {onAutoPickTopGames && (
                <button
                  type="button"
                  onClick={() => {
                    playUiSound("platinum");
                    onAutoPickTopGames();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Fixar Top 3 Mais Jogados Agora
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {favorites.slice(0, 5).map((game, idx) => {
                const rank = RANK_STYLES[idx] || RANK_STYLES[4];
                return (
                  <div
                    key={game.id}
                    onClick={() => {
                      playUiSound("click");
                      onSelectGame(game);
                    }}
                    className="group relative bg-zinc-950/85 hover:bg-zinc-900 border border-amber-500/40 foil-border rounded-2xl p-2.5 transition-all duration-200 cursor-pointer shadow-md flex items-center sm:flex-col gap-3 hover:-translate-y-0.5"
                  >
                    {/* Rank Badge */}
                    <div
                      className={`absolute top-2 left-2 z-10 flex items-center gap-1 backdrop-blur-md px-2 py-0.5 rounded-lg border text-[10px] font-mono font-extrabold shadow-md ${rank.color}`}
                    >
                      <Award className="w-3 h-3" />
                      <span>{rank.label}</span>
                    </div>

                    {/* Unfavorite Button (1-click) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playUiSound("click");
                        onToggleFavorite(game);
                      }}
                      className="absolute top-2 right-2 z-10 p-1 rounded-lg bg-black/70 hover:bg-rose-950/80 text-amber-400 hover:text-rose-400 border border-amber-500/30 transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
                      title="Remover do Hall of Fame"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </button>

                    {/* Poster */}
                    <div className="w-16 h-24 sm:w-full sm:aspect-[2/3] sm:h-auto rounded-xl bg-zinc-900 overflow-hidden flex-shrink-0 relative border border-zinc-800 case-poster">
                      {game.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={game.coverUrl}
                          alt={game.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-indigo-400">
                          <Gamepad2 className="w-6 h-6" />
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
                        {game.rating && (
                          <span className="flex items-center gap-0.5 font-mono text-amber-400 font-bold">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            {game.rating}
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
