"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GameItem } from "@/types/game";
import { OriginBadge } from "./OriginBadge";
import { playUiSound } from "@/lib/ui-sfx";
import { requestGameLaunch } from "@/lib/game-actions";
import {
  Dices,
  RefreshCw,
  X,
  Sparkles,
  Clock,
  Gamepad2,
  HardDrive,
  Play,
  Star,
} from "lucide-react";

interface RandomPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: GameItem[];
  onSelectGame: (game: GameItem) => void;
}

const SPIN_TICKS = 16;
const SPIN_INTERVAL_MS = 65;

const PENDING_STATUSES = new Set(["BACKLOG", "PLAYING", "AVAILABLE", "NOT_STARTED"]);

function filterCandidates(
  games: GameItem[],
  opts: { onlyBacklog: boolean; onlyShortGames: boolean; onlyInstalled: boolean }
): GameItem[] {
  return games.filter((g) => {
    if (g.isWishlist) return false;
    if (opts.onlyBacklog && !PENDING_STATUSES.has(g.status)) return false;
    if (opts.onlyInstalled && !g.isInstalled) return false;
    if (opts.onlyShortGames) {
      if (!g.timeToBeat) return false;
      const match = g.timeToBeat.match(/(\d+(?:\.\d+)?)\s*h/i);
      if (!match || parseFloat(match[1]) > 15) return false;
    }
    return true;
  });
}

export function RandomPickerModal({
  isOpen,
  onClose,
  games,
  onSelectGame,
}: RandomPickerModalProps) {
  const [onlyBacklog, setOnlyBacklog] = useState(true);
  const [onlyShortGames, setOnlyShortGames] = useState(false);
  const [onlyInstalled, setOnlyInstalled] = useState(false);

  const [spunGame, setSpunGame] = useState<GameItem | null>(null);
  const [spinActive, setSpinActive] = useState(false);
  const [spinRequest, setSpinRequest] = useState(0);

  const candidateGames = useMemo(
    () => filterCandidates(games, { onlyBacklog, onlyShortGames, onlyInstalled }),
    [games, onlyBacklog, onlyShortGames, onlyInstalled]
  );

  // Sem candidatos não há resultado nem animação, mesmo que um sorteio tenha sido interrompido
  const selectedGame = candidateGames.length > 0 ? spunGame : null;
  const isSpinning = spinActive && candidateGames.length > 0;

  // Animação do sorteio: arranca ao abrir, quando um filtro muda ou em "Sortear Outro".
  // O estado só muda dentro do callback do intervalo e o cleanup pára sempre o
  // temporizador (fechar o modal a meio já não deixa sons a tocar por trás).
  useEffect(() => {
    if (!isOpen || candidateGames.length === 0) return;
    const pool = candidateGames;
    let counter = 0;
    const id = setInterval(() => {
      setSpunGame(pool[Math.floor(Math.random() * pool.length)]);
      counter++;
      if (counter === 1) setSpinActive(true);
      if (counter % 2 === 1) playUiSound("click");
      if (counter >= SPIN_TICKS) {
        clearInterval(id);
        setSpinActive(false);
        playUiSound("platinum");
      }
    }, SPIN_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isOpen, candidateGames, spinRequest]);

  const spinWheel = () => setSpinRequest((n) => n + 1);

  if (!isOpen) return null;

  const currentCandidatesCount = candidateGames.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 text-center space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2.5 rounded-2xl border bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
            >
              <Dices className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Roleta de Decisão VaultCraft
              </h2>
              <p className="text-[11px] text-zinc-400">
                Não sabes o que jogar hoje? Deixa o destino escolher!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => {
                playUiSound("toggle");
                setOnlyBacklog((v) => !v);
              }}
              className={`h-7 px-3 rounded-xl font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                onlyBacklog
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                  : "bg-zinc-950/70 text-zinc-400 border-zinc-800 hover:text-zinc-200"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Apenas Pendentes</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playUiSound("toggle");
                setOnlyShortGames((v) => !v);
              }}
              className={`h-7 px-3 rounded-xl font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                onlyShortGames
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-zinc-950/70 text-zinc-400 border-zinc-800 hover:text-zinc-200"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Curtos (&le; 15h)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playUiSound("toggle");
                setOnlyInstalled((v) => !v);
              }}
              className={`h-7 px-3 rounded-xl font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                onlyInstalled
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-zinc-950/70 text-zinc-400 border-zinc-800 hover:text-zinc-200"
              }`}
            >
              <HardDrive className="w-3 h-3" />
              <span>Instalados no PC</span>
            </button>
          </div>

        {/* Selected Result Display */}
        {selectedGame ? (
            <div
              className={`p-4 bg-zinc-950/90 border rounded-2xl transition-all duration-300 ${
                isSpinning
                  ? "border-indigo-500/40 scale-[0.98] blur-[0.5px]"
                  : "border-indigo-500/80 shadow-xl shadow-indigo-950/50 scale-100"
              }`}
            >
              <div className="flex gap-4 items-center text-left">
                <div className="case-poster w-24 sm:w-28 aspect-[2/3] bg-zinc-900 rounded-xl overflow-hidden border border-white/10 shadow-lg flex-shrink-0">
                  {selectedGame.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedGame.coverUrl}
                      alt={selectedGame.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <Gamepad2 className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <OriginBadge
                      originType={selectedGame.originType}
                      repackGroup={selectedGame.repackGroup}
                    />
                    {selectedGame.rating && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold font-mono inline-flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        {selectedGame.rating}
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-white text-lg truncate">
                    {selectedGame.title}
                  </h3>
                  <div className="text-xs text-zinc-400">
                    {selectedGame.platform}
                    {selectedGame.releaseYear ? ` • ${selectedGame.releaseYear}` : ""}
                  </div>

                  {selectedGame.timeToBeat && (
                    <div className="text-[11px] text-indigo-300 bg-indigo-950/50 px-2.5 py-0.5 rounded-lg border border-indigo-500/30 inline-flex items-center gap-1.5 font-mono">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      <span>{selectedGame.timeToBeat}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-zinc-500 text-xs bg-zinc-950/50 rounded-2xl border border-zinc-800/60">
              Nenhum jogo encontrado com os filtros selecionados ({currentCandidatesCount} candidatos).
            </div>
          )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2.5 pt-1">
          <button
            type="button"
            disabled={isSpinning || currentCandidatesCount === 0}
            onClick={spinWheel}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
            <span>Sortear Outro ({currentCandidatesCount})</span>
          </button>

          {selectedGame && (
            <>
              {(selectedGame.executablePath || selectedGame.storageLocation) && (
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={async () => {
                    playUiSound("launch");
                    await requestGameLaunch(selectedGame.id, "launch");
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Jogar Agora</span>
                </button>
              )}

              <button
                type="button"
                disabled={isSpinning}
                onClick={() => {
                  playUiSound("open");
                  onSelectGame(selectedGame);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ver Ficha</span>
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
