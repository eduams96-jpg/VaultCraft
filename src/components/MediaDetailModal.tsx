"use client";

import React, { useState } from "react";
import { MediaItem, getMediaTypeBadge } from "@/types/media";
import {
  X,
  Star,
  Film,
  Tv,
  Clock,
  Calendar,
  HardDrive,
  FolderOpen,
  Edit,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface MediaDetailModalProps {
  media: MediaItem | null;
  onClose: () => void;
  onEdit: (media: MediaItem) => void;
  onDelete: (media: MediaItem) => void;
  onUpdateStatus: (media: MediaItem, newStatus: string) => Promise<void>;
  onIncrementEpisode?: (media: MediaItem) => Promise<void>;
  onDecrementEpisode?: (media: MediaItem) => Promise<void>;
  onToggleFavorite?: (media: MediaItem) => void;
}

export function MediaDetailModal({
  media,
  onClose,
  onEdit,
  onDelete,
  onUpdateStatus,
  onIncrementEpisode,
  onDecrementEpisode,
  onToggleFavorite,
}: MediaDetailModalProps) {
  const [openingFolder, setOpeningFolder] = useState(false);

  if (!media) return null;

  const handleOpenStorage = async () => {
    if (!media.storageLocation) return;
    setOpeningFolder(true);
    try {
      // Re-use save location open endpoint logic or launch explorer
      const res = await fetch(`/api/games/cmw9epfxl0089fupkdgolb1kt/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "open_path", path: media.storageLocation }),
      });
    } catch {}
    setOpeningFolder(false);
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    PLAN_TO_WATCH: { label: "🍿 Para Ver (Watchlist)", color: "bg-zinc-800 text-zinc-300 border-zinc-700" },
    WATCHING: { label: "👀 A Assistir", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    COMPLETED: { label: "✅ Visto / Concluído", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    PAUSED: { label: "⏸️ Em Pausa", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    DROPPED: { label: "🚫 Abandonado", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  };

  const currentStatus = statusLabels[media.status] || statusLabels.PLAN_TO_WATCH;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Banner Hero */}
        <div className="relative h-48 sm:h-64 w-full bg-zinc-950 overflow-hidden">
          {media.backdropUrl || media.posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.backdropUrl || media.posterUrl || ""}
              alt={media.title}
              className="w-full h-full object-cover opacity-40 blur-xs scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-950 via-zinc-900 to-zinc-950" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-black/60" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white backdrop-blur-md transition-colors absolute top-4 right-4 cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 -mt-24 sm:-mt-32 relative z-10">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Poster Art */}
            <div className="w-36 sm:w-44 aspect-[2/3] bg-zinc-950 rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-2xl flex-shrink-0">
              {media.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={media.posterUrl} alt={media.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-3xl">
                  {media.type === "MOVIE" ? "🎬" : "📺"}
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0 pt-2 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {(() => {
                  const badge = getMediaTypeBadge(media.type);
                  return (
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border flex items-center gap-1.5 ${badge.color}`}>
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>
                  );
                })()}

                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${currentStatus.color}`}>
                  {currentStatus.label}
                </span>

                {media.quality && (
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {media.quality}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {media.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                {media.releaseYear && (
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    {media.releaseYear}
                  </span>
                )}
                {media.durationMinutes && (
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    {media.durationMinutes} minutos
                  </span>
                )}
                {media.genres && (
                  <span className="text-zinc-300 font-medium">
                    {media.genres}
                  </span>
                )}
              </div>

              {/* Rating & Favorite */}
              <div className="flex items-center gap-3 pt-1">
                {media.rating && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{media.rating} / 10</span>
                  </div>
                )}

                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(media)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                      media.isFavorite
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${media.isFavorite ? "fill-amber-400" : ""}`} />
                    <span>{media.isFavorite ? "Favorito" : "Marcar Favorito"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Status Bar */}
          <div className="mt-6 p-3 bg-zinc-950/60 border border-zinc-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-zinc-400">Alterar estado rápido:</span>
            <div className="flex flex-wrap items-center gap-1.5">
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
                  onClick={() => onUpdateStatus(media, s.key)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    media.status === s.key
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Series Episode Tracker */}
          {(media.type === "SERIES" || media.type === "CARTOON" || media.type === "PT_SERIES" || media.type === "ANIME") && (
            <div className="mt-4 p-4 bg-purple-950/20 border border-purple-500/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-purple-400" />
                  Progresso da Série
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  Total de Temporadas: <strong className="text-white">{media.totalSeasons || 1}</strong>
                </span>
              </div>

              <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Episódio Atual:</span>
                  <div className="text-xl font-mono font-black text-white">
                    Temporada {media.currentSeason || 1} • Episódio {media.currentEpisode || 0}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onDecrementEpisode && (
                    <button
                      type="button"
                      onClick={() => onDecrementEpisode(media)}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
                      title="Voltar 1 episódio (-1)"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}

                  {onIncrementEpisode && (
                    <button
                      type="button"
                      onClick={() => onIncrementEpisode(media)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                      title="Marcar próximo episódio (+1)"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Próximo Ep (+1)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Synopsis & Cast */}
          {media.synopsis && (
            <div className="mt-4 p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-1.5">
              <span className="text-xs font-semibold text-zinc-300 block">Sinopse</span>
              <p className="text-xs text-zinc-400 leading-relaxed">{media.synopsis}</p>
            </div>
          )}

          {media.cast && (
            <div className="mt-4 p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-1.5">
              <span className="text-xs font-semibold text-zinc-300 block">Elenco Principal</span>
              <p className="text-xs text-zinc-400">{media.cast}</p>
            </div>
          )}

          {/* Storage on PC / NAS */}
          {media.storageLocation && (
            <div className="mt-4 p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-purple-400" />
                  Localização no Computador / NAS
                </span>
              </div>
              <div className="p-2.5 bg-zinc-900/90 rounded-xl font-mono text-xs text-zinc-200 border border-zinc-800 flex items-center gap-2 break-all">
                <FolderOpen className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                <span>{media.storageLocation}</span>
              </div>
            </div>
          )}

          {/* Action Buttons: Edit / Delete */}
          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(media);
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-purple-400" />
              <span>Editar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm(`Remover "${media.title}" da coleção?`)) {
                  onDelete(media);
                  onClose();
                }
              }}
              className="px-4 py-2 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
