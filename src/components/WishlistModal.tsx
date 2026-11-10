import React, { useState } from "react";
import { GameItem } from "@/types/game";
import { Bookmark, Plus, X, ArrowRight, Trash2, Calendar, Sparkles } from "lucide-react";

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: GameItem[];
  onAddWishlistGame: () => void;
  onMoveToCollection: (game: GameItem) => Promise<void>;
  onDeleteGame: (game: GameItem) => void;
}

export function WishlistModal({
  isOpen,
  onClose,
  games,
  onAddWishlistGame,
  onMoveToCollection,
  onDeleteGame,
}: WishlistModalProps) {
  const [filterWishStatus, setFilterWishStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");

  if (!isOpen) return null;

  const wishlistGames = games.filter((g) => g.isWishlist);

  const filteredWishlist = wishlistGames.filter((g) => {
    if (filterWishStatus !== "ALL" && g.wishlistStatus !== filterWishStatus) return false;
    if (filterPriority !== "ALL" && (g.wishlistPriority || "MEDIUM") !== filterPriority) return false;
    return true;
  });

  const getWishlistBadge = (status?: string | null) => {
    switch (status) {
      case "WAITING_CRACK":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            🏴‍☠️ Aguardar Crack / Repack
          </span>
        );
      case "WAITING_SALE":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            🏷️ Aguardar Promoção
          </span>
        );
      case "WAITING_RELEASE":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            📅 Aguardar Lançamento
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
            ⭐ Na Lista de Desejos
          </span>
        );
    }
  };

  const getPriorityBadge = (priority?: string | null) => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 shadow-sm shadow-rose-950/40">
            <span>🔥 Alta Prioridade</span>
          </span>
        );
      case "LOW":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
            <span>⏳ Baixa Prioridade</span>
          </span>
        );
      case "MEDIUM":
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span>⭐ Média Prioridade</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Wishlist & Radar de Lançamentos</h2>
              <p className="text-[11px] text-zinc-400">
                Jogos que estás a acompanhar para comprar ou esperar por repack
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAddWishlistGame}
              className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-pink-600/25 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Desejo</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 bg-zinc-950/40 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-medium">Radar:</span>
              <select
                value={filterWishStatus}
                onChange={(e) => setFilterWishStatus(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200 focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value="ALL">Todos os Desejos</option>
                <option value="WAITING_CRACK">🏴‍☠️ Aguardar Crack / Repack</option>
                <option value="WAITING_SALE">🏷️ Aguardar Promoção</option>
                <option value="WAITING_RELEASE">📅 Aguardar Lançamento</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-medium">Prioridade:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200 focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value="ALL">Todas as Prioridades</option>
                <option value="HIGH">🔥 Alta Prioridade</option>
                <option value="MEDIUM">⭐ Média Prioridade</option>
                <option value="LOW">⏳ Baixa Prioridade</option>
              </select>
            </div>
          </div>

          <span className="text-[11px] text-zinc-500 font-mono">
            {filteredWishlist.length} de {wishlistGames.length} desejos
          </span>
        </div>

        {/* Wishlist Games List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {filteredWishlist.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 flex flex-col items-center justify-center space-y-2">
              <span className="text-3xl">🎯</span>
              <p className="text-sm text-zinc-300 font-bold">Nenhum jogo na wishlist</p>
              <p className="text-xs text-zinc-500 max-w-sm">
                Adiciona jogos que estás a aguardar para teres um radar de compras ou releases de repacks.
              </p>
            </div>
          ) : (
            filteredWishlist.map((game) => (
              <div
                key={game.id}
                className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
              >
                {/* Left: Thumbnail and info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-16 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex-shrink-0">
                    {game.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={game.coverUrl}
                        alt={game.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">
                        🎮
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-white text-sm truncate">{game.title}</h3>
                      {getWishlistBadge(game.wishlistStatus)}
                      {getPriorityBadge(game.wishlistPriority)}
                    </div>
                    <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-2">
                      <span>{game.platform}</span>
                      {game.releaseYear && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-zinc-500" />
                            {game.releaseYear}
                          </span>
                        </>
                      )}
                      {game.targetPrice && (
                        <>
                          <span>•</span>
                          <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                            Meta: ≤ {game.targetPrice.toFixed(2)}€
                          </span>
                        </>
                      )}
                    </div>
                    {game.installNotes && (
                      <p className="text-[11px] text-zinc-400 font-mono truncate max-w-md">
                        {game.installNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onMoveToCollection(game)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
                    title="Mover para a Coleção Ativa"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mover para Coleção</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remover "${game.title}" da wishlist?`)) {
                        onDeleteGame(game);
                      }
                    }}
                    className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
