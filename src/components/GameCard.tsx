"use client";

import React, { useState } from "react";
import { GameItem } from "@/types/game";
import { OriginBadge } from "./OriginBadge";
import { StatusBadge } from "./StatusBadge";
import { ArchiveBadge } from "./ArchiveBadge";
import { GameFeaturesBadges } from "./GameFeaturesBadges";
import { Star, HardDrive, Clock, MoreVertical, Edit, Trash2, Check } from "lucide-react";

interface GameCardProps {
  game: GameItem;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleArchive?: (game: GameItem) => void;
  onToggleInstalled?: (game: GameItem) => void;
  onToggleFavorite?: (game: GameItem) => void;
  onQuickUpdateStatus?: (game: GameItem, newStatus: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (game: GameItem, e: React.MouseEvent) => void;
}

export function GameCard({
  game,
  onClick,
  onEdit,
  onDelete,
  onToggleArchive,
  onToggleInstalled,
  onToggleFavorite,
  onQuickUpdateStatus,
  isSelected = false,
  onToggleSelect,
}: GameCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`group relative bg-zinc-900 border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 ${
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-500/70 shadow-indigo-950/60 bg-indigo-950/10"
          : game.isArchived
          ? "border-amber-500/30 hover:border-amber-500/60"
          : "border-zinc-800 hover:border-zinc-600"
      }`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full bg-zinc-950 overflow-hidden">
        {game.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.coverUrl}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-zinc-800 to-zinc-950">
            <span className="text-3xl mb-2">🎮</span>
            <span className="text-sm font-semibold text-zinc-300 line-clamp-3">
              {game.title}
            </span>
          </div>
        )}

        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/60 opacity-90 group-hover:opacity-80 transition-opacity" />

        {/* Top Floating Controls */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-start justify-between gap-1 pointer-events-none z-10">
          {/* Left: Multi-select Checkbox & Status */}
          <div className="flex flex-col gap-1.5 pointer-events-auto">
            {onToggleSelect && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(game, e);
                }}
                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer shadow-md ${
                  isSelected
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-indigo-600/50 scale-105"
                    : "bg-black/60 border-zinc-500/80 text-transparent opacity-0 group-hover:opacity-100 hover:border-indigo-400 backdrop-blur-md"
                }`}
                title={isSelected ? "Desmarcar jogo" : "Selecionar jogo"}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            )}

            {/* Quick Status Popover (1-click status change!) */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusMenuOpen(!statusMenuOpen);
                }}
                className="hover:scale-105 active:scale-95 transition-transform cursor-pointer text-left"
                title="Clica para mudar o estado em 1 clique"
              >
                <StatusBadge status={game.status} />
              </button>

              {statusMenuOpen && onQuickUpdateStatus && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatusMenuOpen(false);
                    }}
                  />
                  <div className="absolute left-0 top-full mt-1.5 w-40 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1 z-40 text-xs animate-in fade-in zoom-in-95">
                    {[
                      { key: "AVAILABLE", label: "Disponível", icon: "📦" },
                      { key: "BACKLOG", label: "Backlog", icon: "⏳" },
                      { key: "PLAYING", label: "A Jogar", icon: "🎮" },
                      { key: "COMPLETED", label: "Concluído", icon: "✅" },
                      { key: "PLATINUM", label: "Platinado", icon: "🏆" },
                      { key: "PAUSED", label: "Em Pausa", icon: "⏸️" },
                      { key: "NOT_STARTED", label: "Não Iniciado", icon: "⚪" },
                    ].map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusMenuOpen(false);
                          onQuickUpdateStatus(game, s.key);
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between transition-colors ${
                          game.status === s.key
                            ? "bg-indigo-600/30 text-indigo-200 font-bold"
                            : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{s.icon}</span>
                          <span>{s.label}</span>
                        </span>
                        {game.status === s.key && <Check className="w-3 h-3 text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {game.isArchived && (
              <ArchiveBadge
                isArchived={true}
                interactive={Boolean(onToggleArchive)}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleArchive?.(game);
                }}
              />
            )}
          </div>

          {/* Right: Quick Star (Hall of Fame) & Quick Menu Buttons */}
          <div className="pointer-events-auto flex items-center gap-1">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(game);
                }}
                className={`p-1.5 rounded-lg transition-all backdrop-blur-md cursor-pointer ${
                  game.isFavorite
                    ? "bg-amber-500/25 text-amber-300 border border-amber-500/40 opacity-100 shadow-md shadow-amber-500/20"
                    : "bg-black/60 text-zinc-400 hover:text-amber-300 opacity-0 group-hover:opacity-100"
                }`}
                title={game.isFavorite ? "Remover do Hall of Fame" : "Fixar no Hall of Fame"}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    game.isFavorite ? "fill-amber-400 text-amber-400" : ""
                  }`}
                />
              </button>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div className="absolute right-0 top-full mt-1 w-44 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1 z-30 text-xs">
                  {onToggleFavorite && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onToggleFavorite(game);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-zinc-800 text-amber-300"
                    >
                      <Star className={`w-3.5 h-3.5 ${game.isFavorite ? "fill-amber-400" : ""}`} />
                      <span>{game.isFavorite ? "Remover do Hall of Fame" : "Fixar no Hall of Fame"}</span>
                    </button>
                  )}
                  {onToggleArchive && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onToggleArchive(game);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-zinc-800 text-amber-300"
                    >
                      <span className="text-xs">📦</span>
                      {game.isArchived ? "Remover do Arquivo" : "Marcar Arquivado"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onEdit();
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-zinc-800 text-zinc-200"
                  >
                    <Edit className="w-3.5 h-3.5 text-indigo-400" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      if (confirm(`Remover "${game.title}" da coleção?`)) {
                        onDelete();
                      }
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-rose-950/40 text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

        {/* Origin Badge overlay bottom-right of image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <OriginBadge
            originType={game.originType}
            repackGroup={game.repackGroup}
            className="backdrop-blur-md pointer-events-auto shadow-md"
          />

          {game.rating && (
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-amber-500/40 text-amber-300 font-bold text-xs">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{game.rating}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <h3 className="font-bold text-zinc-100 text-sm group-hover:text-indigo-300 transition-colors line-clamp-1">
            {game.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
            <span>{game.platform}</span>
            {game.releaseYear && (
              <>
                <span>•</span>
                <span>{game.releaseYear}</span>
              </>
            )}
            {game.gameVersion && (
              <>
                <span>•</span>
                <span className="font-mono text-purple-300 font-semibold text-[10px]">{game.gameVersion}</span>
              </>
            )}
            {game.isUpToDate === false && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse ml-auto" title="Nova atualização oficial disponível!">
                Update
              </span>
            )}
          </div>

          {/* Custom Categories Chips */}
          {game.customCategories && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {game.customCategories
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
                .slice(0, 2)
                .map((cat, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 truncate max-w-[110px]"
                    title={`Categoria: ${cat}`}
                  >
                    📁 {cat}
                  </span>
                ))}
            </div>
          )}

          {/* Savefile, Achievements & Platinado Badges */}
          {(game.hasSavefile || game.hasAchievements || game.isPlatinum || game.status === "PLATINUM") && (
            <div className="pt-1.5">
              <GameFeaturesBadges
                hasSavefile={game.hasSavefile}
                hasAchievements={game.hasAchievements}
                isPlatinum={game.isPlatinum || game.status === "PLATINUM"}
              />
            </div>
          )}
        </div>

        {/* Footer Info: Installed, Archive toggle & Hours */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
          <button
            type="button"
            onClick={(e) => {
              if (onToggleInstalled) {
                e.stopPropagation();
                onToggleInstalled(game);
              }
            }}
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            title={game.storageLocation || (game.isInstalled ? "Instalado no computador (clica para alterar)" : "Não instalado")}
          >
            {game.isInstalled ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <HardDrive className="w-3 h-3" />
                <span>Instalado</span>
              </span>
            ) : (
              <span className="text-zinc-500 hover:text-zinc-400">Desinstalado</span>
            )}
          </button>

          <div className="flex items-center gap-2">
            {!game.isArchived && onToggleArchive && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleArchive(game);
                }}
                className="opacity-0 group-hover:opacity-100 text-[10px] text-zinc-500 hover:text-amber-300 transition-all flex items-center gap-1"
                title="Marcar como arquivado"
              >
                <span>📦</span>
                <span>Arquivar</span>
              </button>
            )}

            {game.hoursPlayed > 0 && (
              <div className="flex items-center gap-1 text-zinc-400 font-mono">
                <Clock className="w-3 h-3 text-zinc-500" />
                <span>{game.hoursPlayed}h</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
