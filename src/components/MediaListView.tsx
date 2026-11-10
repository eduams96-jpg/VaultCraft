"use client";

import React from "react";
import { MediaItem, getMediaTypeBadge } from "@/types/media";
import {
  Star,
  Film,
  Tv,
  Edit,
  Trash2,
  HardDrive,
  Clock,
  Plus,
} from "lucide-react";

interface MediaListViewProps {
  mediaItems: MediaItem[];
  onSelectMedia: (media: MediaItem) => void;
  onEditMedia: (media: MediaItem) => void;
  onDeleteMedia: (media: MediaItem) => void;
  onToggleFavorite?: (media: MediaItem) => void;
  onUpdateStatus?: (media: MediaItem, newStatus: string) => void;
  onIncrementEpisode?: (media: MediaItem) => void;
}

export function MediaListView({
  mediaItems,
  onSelectMedia,
  onEditMedia,
  onDeleteMedia,
  onToggleFavorite,
  onUpdateStatus,
  onIncrementEpisode,
}: MediaListViewProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "WATCHING":
        return { label: "👀 A Assistir", color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" };
      case "COMPLETED":
        return { label: "✅ Visto", color: "text-blue-400 bg-blue-500/15 border-blue-500/30" };
      case "PAUSED":
        return { label: "⏸️ Em Pausa", color: "text-amber-400 bg-amber-500/15 border-amber-500/30" };
      case "DROPPED":
        return { label: "🚫 Abandonado", color: "text-rose-400 bg-rose-500/15 border-rose-500/30" };
      case "PLAN_TO_WATCH":
      default:
        return { label: "🍿 Para Ver", color: "text-zinc-300 bg-zinc-800 border-zinc-700" };
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
            <th className="py-3 px-3 w-10 text-center">⭐</th>
            <th className="py-3 px-3">Título</th>
            <th className="py-3 px-3">Tipo</th>
            <th className="py-3 px-3">Ano / Duração</th>
            <th className="py-3 px-3">Qualidade</th>
            <th className="py-3 px-3">Episódios</th>
            <th className="py-3 px-3">Nota</th>
            <th className="py-3 px-3">Estado</th>
            <th className="py-3 px-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {mediaItems.map((item) => {
            const badge = getMediaTypeBadge(item.type);
            const statusInfo = getStatusLabel(item.status);
            const isSeries = item.type === "SERIES" || item.type === "CARTOON" || item.type === "PT_SERIES" || item.type === "ANIME";

            return (
              <tr
                key={item.id}
                onClick={() => onSelectMedia(item)}
                className="hover:bg-zinc-800/60 transition-colors cursor-pointer group"
              >
                {/* Favorite Star */}
                <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                  {onToggleFavorite && (
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(item)}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        item.isFavorite
                          ? "text-amber-400 bg-amber-500/15 border border-amber-500/30"
                          : "text-zinc-600 hover:text-amber-400"
                      }`}
                      title={item.isFavorite ? "Remover dos Favoritos" : "Marcar como Favorito"}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.isFavorite ? "fill-amber-400" : ""}`} />
                    </button>
                  )}
                </td>

                {/* Poster & Title */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-12 bg-zinc-950 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                      {item.posterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px]">
                          {badge.icon}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-zinc-100 group-hover:text-purple-300 transition-colors truncate max-w-xs sm:max-w-md">
                        {item.title}
                      </div>
                      {item.genres && (
                        <div className="text-[10px] text-zinc-500 truncate max-w-xs">
                          {item.genres}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Type Badge */}
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border inline-flex items-center gap-1 ${badge.color}`}>
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                  </span>
                </td>

                {/* Year / Duration */}
                <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap">
                  <span>{item.releaseYear || "—"}</span>
                  {item.durationMinutes && (
                    <span className="text-[11px] text-zinc-500 ml-1.5 font-mono">
                      ({item.durationMinutes}m)
                    </span>
                  )}
                </td>

                {/* Quality */}
                <td className="py-2.5 px-3 whitespace-nowrap">
                  {item.quality ? (
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-zinc-950 text-amber-300 border border-zinc-800">
                      {item.quality}
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>

                {/* Episodes & Seasons (for series/cartoons) */}
                <td className="py-2.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  {isSeries ? (
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 font-semibold">
                        T{item.currentSeason || 1} E{item.currentEpisode || 0}
                      </span>
                      {onIncrementEpisode && (
                        <button
                          type="button"
                          onClick={() => onIncrementEpisode(item)}
                          className="px-1.5 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 font-bold text-[10px] transition-colors cursor-pointer"
                          title="Marcar próximo episódio (+1)"
                        >
                          +1
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>

                {/* Rating */}
                <td className="py-2.5 px-3 whitespace-nowrap">
                  {item.rating ? (
                    <span className="font-bold text-amber-300 font-mono">
                      ⭐ {item.rating}/10
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>

                {/* Status Dropdown */}
                <td className="py-2.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  {onUpdateStatus ? (
                    <select
                      value={item.status}
                      onChange={(e) => onUpdateStatus(item, e.target.value)}
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] border cursor-pointer focus:outline-none bg-zinc-950 ${statusInfo.color}`}
                    >
                      <option value="PLAN_TO_WATCH">🍿 Para Ver</option>
                      <option value="WATCHING">👀 A Assistir</option>
                      <option value="COMPLETED">✅ Visto</option>
                      <option value="PAUSED">⏸️ Em Pausa</option>
                      <option value="DROPPED">🚫 Abandonado</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEditMedia(item)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-purple-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remover "${item.title}" da coleção?`)) {
                          onDeleteMedia(item);
                        }
                      }}
                      className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
