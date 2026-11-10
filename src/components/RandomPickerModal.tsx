import React, { useState, useEffect } from "react";
import { GameItem } from "@/types/game";
import { OriginBadge } from "./OriginBadge";
import { Dices, RefreshCw, X, Sparkles, Clock } from "lucide-react";

interface RandomPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: GameItem[];
  onSelectGame: (game: GameItem) => void;
}

export function RandomPickerModal({
  isOpen,
  onClose,
  games,
  onSelectGame,
}: RandomPickerModalProps) {
  const [onlyBacklog, setOnlyBacklog] = useState(true);
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Filter pool
  const candidateGames = games.filter((g) => {
    if (g.isWishlist) return false;
    if (onlyBacklog && g.status !== "BACKLOG" && g.status !== "PLAYING" && g.status !== "AVAILABLE") return false;
    return true;
  });

  const spinWheel = () => {
    if (candidateGames.length === 0) {
      setSelectedGame(null);
      return;
    }

    setIsSpinning(true);
    let counter = 0;
    const maxSpins = 16;
    const intervalTime = 70;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * candidateGames.length);
      setSelectedGame(candidateGames[randomIndex]);
      counter++;

      if (counter >= maxSpins) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, intervalTime);
  };

  useEffect(() => {
    if (isOpen) {
      spinWheel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 text-center space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Dices className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-bold text-white">Roleta do Backlog</h2>
              <p className="text-[11px] text-zinc-400">Não sabes o que jogar? Nós escolhemos por ti!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-center gap-3 text-xs bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800">
          <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyBacklog}
              onChange={(e) => setOnlyBacklog(e.target.checked)}
              className="rounded text-indigo-600 bg-zinc-900 border-zinc-700 focus:ring-0"
            />
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Apenas Jogos Pendentes (Backlog / A Jogar / Disponíveis)
          </label>
        </div>

        {/* Selected Game Card Display */}
        {selectedGame ? (
          <div
            className={`p-4 bg-zinc-950/80 border rounded-2xl transition-all duration-300 ${
              isSpinning
                ? "border-indigo-500/50 scale-98 blur-[0.5px]"
                : "border-indigo-500 shadow-xl shadow-indigo-950/50 scale-100"
            }`}
          >
            <div className="flex gap-4 items-center text-left">
              <div className="w-24 sm:w-28 aspect-[2/3] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-700 shadow-lg flex-shrink-0">
                {selectedGame.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedGame.coverUrl}
                    alt={selectedGame.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    🎮
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <OriginBadge
                  originType={selectedGame.originType}
                  repackGroup={selectedGame.repackGroup}
                />
                <h3 className="font-extrabold text-white text-lg truncate">
                  {selectedGame.title}
                </h3>
                <div className="text-xs text-zinc-400">
                  {selectedGame.platform}
                  {selectedGame.releaseYear ? ` • ${selectedGame.releaseYear}` : ""}
                </div>

                {selectedGame.timeToBeat && (
                  <div className="text-[11px] text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/30 inline-block font-mono">
                    ⏱️ {selectedGame.timeToBeat}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-zinc-500 text-xs">
            Nenhum jogo encontrado com os filtros selecionados.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={isSpinning || candidateGames.length === 0}
            onClick={spinWheel}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
            Sortear Outro
          </button>

          {selectedGame && (
            <button
              type="button"
              disabled={isSpinning}
              onClick={() => {
                onSelectGame(selectedGame);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ver Ficha do Jogo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
