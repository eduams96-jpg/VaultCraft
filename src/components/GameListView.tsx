"use client";

import React from "react";
import { GameItem } from "@/types/game";
import { OriginBadge } from "./OriginBadge";
import { StatusBadge } from "./StatusBadge";
import { ArchiveBadge } from "./ArchiveBadge";
import { GameFeaturesBadges } from "./GameFeaturesBadges";
import {
  Star,
  HardDrive,
  Edit,
  Trash2,
  Check,
  CheckSquare,
  Square,
  Play,
  FolderOpen,
  ExternalLink,
  Gamepad2,
} from "lucide-react";
import { playUiSound } from "@/lib/ui-sfx";
import { requestGameLaunch } from "@/lib/game-actions";

interface GameListViewProps {
  games: GameItem[];
  onSelectGame: (game: GameItem) => void;
  onEditGame: (game: GameItem) => void;
  onDeleteGame: (game: GameItem) => void;
  onToggleArchive?: (game: GameItem) => void;
  onToggleFavorite?: (game: GameItem) => void;
  onQuickUpdateStatus?: (game: GameItem, newStatus: string) => void;
  selectedGameIds?: string[];
  onToggleSelectGame?: (game: GameItem, e: React.MouseEvent) => void;
  onToggleSelectAll?: () => void;
  allSelected?: boolean;
}

export function GameListView({
  games,
  onSelectGame,
  onEditGame,
  onDeleteGame,
  onToggleArchive,
  onToggleFavorite,
  onQuickUpdateStatus,
  selectedGameIds = [],
  onToggleSelectGame,
  onToggleSelectAll,
  allSelected = false,
}: GameListViewProps) {
  if (games.length === 0) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800 uppercase tracking-wider text-[11px]">
            <tr>
              {onToggleSelectGame && (
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={onToggleSelectAll}
                    className="p-1 rounded hover:bg-zinc-800 text-indigo-400 cursor-pointer"
                    title={allSelected ? "Desmarcar todos" : "Selecionar todos"}
                  >
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 fill-indigo-600 text-white" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
                    )}
                  </button>
                </th>
              )}
              <th className="py-3 px-4">Jogo</th>
              <th className="py-3 px-4">Plataforma</th>
              <th className="py-3 px-4">Origem / Cópia</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Arquivo</th>
              <th className="py-3 px-4">Categoria</th>
              <th className="py-3 px-4">Nota</th>
              <th className="py-3 px-4">Instalação / Disco</th>
              <th className="py-3 px-4">Horas</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {games.map((game) => {
              const isSelected = selectedGameIds.includes(game.id);

              return (
                <tr
                  key={game.id}
                  onClick={() => onSelectGame(game)}
                  className={`hover:bg-zinc-800/40 cursor-pointer transition-colors ${
                    isSelected ? "bg-indigo-950/20 hover:bg-indigo-950/30" : ""
                  }`}
                >
                  {/* Select Checkbox */}
                  {onToggleSelectGame && (
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => onToggleSelectGame(game, e)}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-all cursor-pointer mx-auto ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-400 text-white shadow-sm"
                            : "border-zinc-700 bg-zinc-950 text-transparent hover:border-zinc-500"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </td>
                  )}

                  {/* Game Title & Cover */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {onToggleFavorite && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(game);
                          }}
                          className={`p-1 rounded-lg transition-colors cursor-pointer ${
                            game.isFavorite
                              ? "text-amber-400 bg-amber-500/15 border border-amber-500/30"
                              : "text-zinc-600 hover:text-amber-400"
                          }`}
                          title={game.isFavorite ? "Remover do Hall of Fame" : "Fixar no Hall of Fame"}
                        >
                          <Star className={`w-3.5 h-3.5 ${game.isFavorite ? "fill-amber-400" : ""}`} />
                        </button>
                      )}
                      <div className="case-poster w-10 h-14 bg-zinc-950 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-800">
                        {game.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={game.coverUrl}
                            alt={game.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-indigo-400">
                            <Gamepad2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-100 hover:text-indigo-300 flex items-center gap-2 flex-wrap">
                          <span>{game.title}</span>
                          {game.gameVersion && (
                            <span className="font-mono text-purple-300 font-semibold text-[10px] px-1.5 py-0.2 bg-purple-950/40 border border-purple-500/30 rounded">
                              {game.gameVersion}
                            </span>
                          )}
                          {game.isUpToDate === false && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                              Update
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {game.genres || (game.releaseYear ? `${game.releaseYear}` : "")}
                        </div>
                        {(game.hasSavefile || game.hasAchievements || game.isPlatinum || game.status === "PLATINUM") && (
                          <div className="mt-1">
                            <GameFeaturesBadges
                              hasSavefile={game.hasSavefile}
                              hasAchievements={game.hasAchievements}
                              isPlatinum={game.isPlatinum || game.status === "PLATINUM"}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="py-3 px-4 font-medium text-zinc-300">
                    {game.platform}
                  </td>

                  {/* Origin */}
                  <td className="py-3 px-4">
                    <OriginBadge
                      originType={game.originType}
                      repackGroup={game.repackGroup}
                    />
                  </td>

                  {/* Status (1-click changer) */}
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    {onQuickUpdateStatus ? (
                      <select
                        value={game.status}
                        onChange={(e) => onQuickUpdateStatus(game, e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors"
                      >
                        <option value="AVAILABLE">Disponível</option>
                        <option value="BACKLOG">Backlog</option>
                        <option value="PLAYING">A Jogar</option>
                        <option value="COMPLETED">Concluído</option>
                        <option value="PLATINUM">Platinado</option>
                        <option value="PAUSED">Em Pausa</option>
                        <option value="NOT_STARTED">Não Iniciado</option>
                      </select>
                    ) : (
                      <StatusBadge status={game.status} />
                    )}
                  </td>

                  {/* Archive Badge Column */}
                  <td className="py-3 px-4">
                    <ArchiveBadge
                      isArchived={Boolean(game.isArchived)}
                      interactive={Boolean(onToggleArchive)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleArchive?.(game);
                      }}
                    />
                  </td>

                  {/* Custom Category */}
                  <td className="py-3 px-4">
                    {game.customCategories ? (
                      <div className="flex flex-wrap gap-1">
                        {game.customCategories
                          .split(",")
                          .map((c) => c.trim())
                          .filter(Boolean)
                          .map((cat, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                            >
                              {cat}
                            </span>
                          ))}
                      </div>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>

                  {/* Rating */}
                  <td className="py-3 px-4">
                    {game.rating ? (
                      <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{game.rating}/10</span>
                      </div>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>

                  {/* Location / Installed */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 max-w-[200px] truncate">
                      {game.isInstalled ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <HardDrive className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{game.storageLocation || "Instalado"}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-500 truncate">
                          {game.storageLocation || "Desinstalado"}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Hours */}
                  <td className="py-3 px-4 font-mono text-zinc-300">
                    {game.hoursPlayed > 0 ? `${game.hoursPlayed}h` : "-"}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div
                      className="flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(game.executablePath || game.storageLocation) && (
                        <button
                          type="button"
                          onClick={async () => {
                            playUiSound("launch");
                            await requestGameLaunch(game.id, "launch");
                          }}
                          className="p-1.5 text-emerald-400 hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                          title={game.executablePath ? "Jogar Agora" : "Abrir Pasta do Jogo"}
                        >
                          {game.executablePath ? <Play className="w-3.5 h-3.5 fill-current" /> : <FolderOpen className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      {game.externalLink && (
                        <a
                          href={game.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-zinc-400 hover:text-sky-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                          title="Abrir Link Externo"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => onEditGame(game)}
                        className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remover "${game.title}" da coleção?`)) {
                            onDeleteGame(game);
                          }
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
