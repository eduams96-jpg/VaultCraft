"use client";

import React, { useState } from "react";
import { MediaItem, getMediaTypeBadge } from "@/types/media";
import {
  Star,
  Film,
  Tv,
  Sparkles,
  Plus,
  Check,
  MoreVertical,
  Edit,
  Trash2,
  HardDrive,
  FolderOpen,
} from "lucide-react";

interface MediaCardProps {
  media: MediaItem;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite?: (media: MediaItem) => void;
  onUpdateStatus?: (media: MediaItem, newStatus: string) => void;
  onIncrementEpisode?: (media: MediaItem) => void;
  compact?: boolean;
}

export function MediaCard({
  media,
  onClick,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdateStatus,
  onIncrementEpisode,
  compact = false,
}: MediaCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const getStatusBadge = () => {
    switch (media.status) {
      case "WATCHING":
        return { label: "A Assistir", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
      case "COMPLETED":
        return { label: "Visto", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
      case "PAUSED":
        return { label: "Em Pausa", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
      case "DROPPED":
        return { label: "Abandonado", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" };
      case "PLAN_TO_WATCH":
      default:
        return { label: "Para Ver", color: "bg-zinc-800 text-zinc-300 border-zinc-700" };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div
      onClick={onClick}
      className="group relative bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-purple-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-purple-950/20 transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Poster Image Hero */}
      <div className="relative aspect-[2/3] w-full bg-zinc-950 overflow-hidden">
        {media.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.posterUrl}
            alt={media.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
            {media.type === "MOVIE" ? <Film className="w-10 h-10" /> : <Tv className="w-10 h-10" />}
            <span className="text-xs font-semibold">{media.type}</span>
          </div>
        )}

        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/60 pointer-events-none" />

        {/* Top Badges overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
          {/* Type Badge */}
          {(() => {
            const badge = getMediaTypeBadge(media.type);
            return (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider border backdrop-blur-md shadow-md flex items-center gap-1 ${badge.color}`}>
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </span>
            );
          })()}

          <div className="flex items-center gap-1.5">
            {/* Favorite Star Button */}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(media);
                }}
                className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                  media.isFavorite
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/50 scale-105"
                    : "bg-black/50 text-zinc-400 hover:text-amber-400 border border-white/10 opacity-0 group-hover:opacity-100"
                }`}
                title={media.isFavorite ? "Remover dos Favoritos" : "Marcar como Favorito"}
              >
                <Star className={`w-3.5 h-3.5 ${media.isFavorite ? "fill-amber-400" : ""}`} />
              </button>
            )}

            {/* Quick Context Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1.5 rounded-full bg-black/50 text-zinc-400 hover:text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-md"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                    }}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-36 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1 z-40 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit();
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-zinc-800 text-zinc-200"
                    >
                      <Edit className="w-3.5 h-3.5 text-purple-400" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        if (confirm(`Remover "${media.title}" da coleção?`)) {
                          onDelete();
                        }
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-rose-950/40 text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom overlays inside image: Quality & Rating */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          {media.quality ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/30">
              {media.quality}
            </span>
          ) : <span />}

          {media.rating && (
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-amber-500/40 text-amber-300 font-bold text-xs">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{media.rating}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <h3 className="font-bold text-zinc-100 text-sm group-hover:text-purple-300 transition-colors line-clamp-1">
            {media.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
            {media.releaseYear && <span>{media.releaseYear}</span>}
            {media.durationMinutes && (
              <>
                <span>•</span>
                <span>{media.durationMinutes} min</span>
              </>
            )}
            {media.totalSeasons && media.type !== "MOVIE" && (
              <>
                <span>•</span>
                <span>{media.totalSeasons} Temp{media.totalSeasons > 1 ? "s" : ""}</span>
              </>
            )}
          </div>

          {/* Genres Chips */}
          {media.genres && (
            <p className="text-[11px] text-zinc-500 truncate mt-1">
              {media.genres}
            </p>
          )}
        </div>

        {/* Footer: Status changer & Episode Progress */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2 text-[11px]">
          {/* Status Badge / Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setStatusMenuOpen(!statusMenuOpen);
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-transform cursor-pointer ${statusBadge.color}`}
              title="Clica para mudar o estado"
            >
              {statusBadge.label}
            </button>

            {statusMenuOpen && onUpdateStatus && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusMenuOpen(false);
                  }}
                />
                <div className="absolute left-0 bottom-full mb-1 w-36 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1 z-40 text-xs">
                  {[
                    { key: "PLAN_TO_WATCH", label: "🍿 Para Ver" },
                    { key: "WATCHING", label: "👀 A Assistir" },
                    { key: "COMPLETED", label: "✅ Visto" },
                    { key: "PAUSED", label: "⏸️ Em Pausa" },
                    { key: "DROPPED", label: "🚫 Abandonado" },
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatusMenuOpen(false);
                        onUpdateStatus(media, s.key);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${
                        media.status === s.key
                          ? "bg-purple-600/30 text-purple-200 font-bold"
                          : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Episode Progress for Series / Anime (1-Click +1 Ep!) */}
          {media.type !== "MOVIE" && (
            <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-[11px]">
              <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                T{media.currentSeason || 1} E{media.currentEpisode || 0}
              </span>

              {onIncrementEpisode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onIncrementEpisode(media);
                  }}
                  className="px-1.5 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 transition-all font-bold text-[10px] cursor-pointer"
                  title="Marcar próximo episódio visto (+1)"
                >
                  +1
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
