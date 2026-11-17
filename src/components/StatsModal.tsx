"use client";

import React, { useState } from "react";
import { GameItem } from "@/types/game";
import { OriginVectorIcon } from "./CraftIcons";
import { playUiSound } from "@/lib/ui-sfx";
import {
  BarChart3,
  X,
  Clock,
  Trophy,
  PiggyBank,
  Gamepad2,
  Star,
  CheckCircle2,
  Layers,
  HardDrive,
  Archive,
  HelpCircle,
  Sparkles,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: GameItem[];
}

export function StatsModal({
  isOpen,
  onClose,
  games,
}: StatsModalProps) {
  const [isSyncingSteam, setIsSyncingSteam] = useState(false);
  const [liveSteamStats, setLiveSteamStats] = useState<{ totalValue: number; gamesPriced: number } | null>(null);

  if (!isOpen) return null;

  // ============================================================================
  // GAMES STATS
  // ============================================================================
  const collectionGames = games.filter((g) => !g.isWishlist);
  const total = collectionGames.length;
  const totalHours = collectionGames.reduce((acc, g) => acc + (g.hoursPlayed || 0), 0);

  const availableCount = collectionGames.filter((g) => g.status === "AVAILABLE").length;
  const playingCount = collectionGames.filter((g) => g.status === "PLAYING").length;
  const backlogCount = collectionGames.filter((g) => g.status === "BACKLOG").length;
  const completedCount = collectionGames.filter((g) => g.status === "COMPLETED").length;
  const platinumCount = collectionGames.filter((g) => g.isPlatinum || g.status === "PLATINUM").length;
  const pausedCount = collectionGames.filter((g) => g.status === "PAUSED").length;
  const notStartedCount = collectionGames.filter((g) => g.status === "NOT_STARTED").length;

  const allFinished = completedCount + platinumCount;
  const completionRate = total > 0 ? Math.round((allFinished / total) * 100) : 0;

  const archivedCount = collectionGames.filter((g) => g.isArchived).length;
  const savefilesCount = collectionGames.filter((g) => g.hasSavefile).length;

  let totalDiskGb = 0;
  collectionGames.forEach((g) => {
    if (g.diskSpace) {
      const match = g.diskSpace.match(/(\d+(?:\.\d+)?)\s*(GB|MB|TB)/i);
      if (match) {
        const val = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        if (unit === "GB") totalDiskGb += val;
        else if (unit === "MB") totalDiskGb += val / 1024;
        else if (unit === "TB") totalDiskGb += val * 1024;
      }
    }
  });

  let repackSavings = 0;
  let retroPreservationValue = 0;
  let officialInvestment = 0;

  collectionGames.forEach((g) => {
    const year = g.releaseYear || 2020;
    if (g.originType === "REPACK") {
      if (year >= 2023) repackSavings += 65;
      else if (year >= 2016) repackSavings += 35;
      else repackSavings += 20;
    } else if (g.originType === "EMULATOR") {
      retroPreservationValue += 25;
    } else if (g.originType === "STEAM" || g.originType === "GOG" || g.originType === "PHYSICAL") {
      if (year >= 2023) officialInvestment += 50;
      else if (year >= 2016) officialInvestment += 30;
      else officialInvestment += 15;
    }
  });

  const totalEstimatedSavings = repackSavings + retroPreservationValue;

  const handleSyncSteamPrices = async () => {
    setIsSyncingSteam(true);
    try {
      let totalVal = 0;
      let count = 0;
      const gamesToSample = collectionGames.slice(0, 30);
      for (const g of gamesToSample) {
        try {
          const res = await fetch(`/api/steam/price?query=${encodeURIComponent(g.title)}`);
          const data = await res.json();
          if (data.found && data.finalPrice > 0) {
            totalVal += data.finalPrice;
            count++;
          }
        } catch {}
      }
      playUiSound("success");
      setLiveSteamStats({
        totalValue: Math.round(totalVal * 100) / 100,
        gamesPriced: count,
      });
    } finally {
      setIsSyncingSteam(false);
    }
  };

  const platformCounts: Record<string, number> = {};
  collectionGames.forEach((g) => {
    const plat = g.platform || "PC";
    platformCounts[plat] = (platformCounts[plat] || 0) + 1;
  });
  const topPlatforms = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const originCounts: Record<string, number> = {};
  collectionGames.forEach((g) => {
    const org = g.originType || "OTHER";
    originCounts[org] = (originCounts[org] || 0) + 1;
  });

  const genreCounts: Record<string, number> = {};
  collectionGames.forEach((g) => {
    if (g.genres) {
      g.genres
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((genre) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
    }
  });
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Estatísticas Avançadas VaultCraft
              </h2>
              <p className="text-[11px] text-zinc-400">
                Métricas de progresso, poupança, preservação e armazenamento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Top Big Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Total Hours */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-left">
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span className="text-[11px] font-semibold uppercase">Horas Jogadas</span>
                  <Clock className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">{totalHours}h</div>
                <span className="text-[10px] text-zinc-500">tempo investido</span>
              </div>

              {/* Completion Rate */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-left">
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span className="text-[11px] font-semibold uppercase">Conclusão</span>
                  <Trophy className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-2xl font-black text-white">{completionRate}%</div>
                <span className="text-[10px] text-zinc-500">
                  {allFinished} terminados ({platinumCount} platinas)
                </span>
              </div>

              {/* Preserved Games */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-left">
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span className="text-[11px] font-semibold uppercase">Preservação</span>
                  <Archive className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-300">{archivedCount}</div>
                <span className="text-[10px] text-zinc-500">{savefilesCount} com saves salvos</span>
              </div>

              {/* Estimated Money Saved */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-left">
                <div className="flex items-center justify-between text-emerald-400 mb-1">
                  <span className="text-[11px] font-semibold uppercase flex items-center gap-1">
                    <span>Poupança Est.</span>
                    <span
                      title="Calculado com base no ano de lançamento e formato (Repacks PC recentes ~65€, catálogo ~35€, emuladores ~25€ de valor vintage)"
                      className="inline-flex cursor-help"
                    >
                      <HelpCircle className="w-3 h-3 text-emerald-500/80" />
                    </span>
                  </span>
                  <PiggyBank className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-300 font-mono">
                  ~{totalEstimatedSavings}€
                </div>
                <span className="text-[10px] text-emerald-400/80">
                  {repackSavings > 0 ? `Repacks: ~${repackSavings}€` : "preservação digital"}
                </span>
              </div>
            </div>

            {/* Savings & Economy Detailed Breakdown */}
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <PiggyBank className="w-4 h-4 text-emerald-400" />
                  <span>Como é Calculada a Poupança da Coleção?</span>
                </h3>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Total: <strong className="text-emerald-400">~{totalEstimatedSavings}€</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
                    <OriginVectorIcon origin="REPACK" className="w-3.5 h-3.5" />
                    <span>Repacks PC</span>
                  </div>
                  <div className="text-base font-bold text-white font-mono">~{repackSavings}€</div>
                  <div className="text-[10px] text-zinc-500">
                    Jogos recentes avaliados a 65€; títulos anteriores a 35€ / 20€
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                    <OriginVectorIcon origin="EMULATOR" className="w-3.5 h-3.5" />
                    <span>Emuladores / ROMs</span>
                  </div>
                  <div className="text-base font-bold text-white font-mono">~{retroPreservationValue}€</div>
                  <div className="text-[10px] text-zinc-500">
                    Valor médio de mercado vintage de colecionador (~25€ por título)
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="text-[11px] font-semibold text-sky-400 flex items-center gap-1.5">
                    <OriginVectorIcon origin="STEAM" className="w-3.5 h-3.5" />
                    <span>Steam & Oficiais</span>
                  </div>
                  <div className="text-base font-bold text-white font-mono">~{officialInvestment}€</div>
                  <div className="text-[10px] text-zinc-500">
                    Valor estimado do investimento em cópias compradas
                  </div>
                </div>
              </div>

              {/* Live Steam Store Price Lookup Bar */}
              <div className="mt-2 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Cotação em Tempo Real (Loja Steam Portugal):</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {liveSteamStats
                      ? `Foram consultados ${liveSteamStats.gamesPriced} jogos com preço oficial na Steam Store PT.`
                      : "Consulta a API oficial da Steam para obter o preço de mercado exato em Euros."}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {liveSteamStats && (
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono">Valor de Mercado:</span>
                      <span className="text-base font-black text-sky-400 font-mono">
                        {liveSteamStats.totalValue.toFixed(2)}€
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isSyncingSteam}
                    onClick={handleSyncSteamPrices}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-sky-600/25 transition-all cursor-pointer"
                  >
                    {isSyncingSteam ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>A consultar Steam...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{liveSteamStats ? "Recalcular Cotação" : "Consultar Preços Steam"}</span>
                      </>
                    )}
                  </button>

                  <a
                    href="https://steamdb.info/calculator/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-zinc-700 transition-all cursor-pointer"
                    title="Abrir a calculadora pública oficial do SteamDB"
                  >
                    <span>SteamDB</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                </div>
              </div>
            </div>

            {/* Progress / Status Distribution Bar (7 States) */}
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  Distribuição pelos 7 Estados
                </h3>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {total} jogos catalogados
                </span>
              </div>

              <div className="w-full h-3.5 bg-zinc-800/80 rounded-full overflow-hidden flex shadow-inner">
                {availableCount > 0 && (
                  <div
                    style={{ width: `${(availableCount / total) * 100}%` }}
                    className="h-full bg-cyan-500"
                    title={`Disponível: ${availableCount}`}
                  />
                )}
                {playingCount > 0 && (
                  <div
                    style={{ width: `${(playingCount / total) * 100}%` }}
                    className="h-full bg-emerald-500"
                    title={`A Jogar: ${playingCount}`}
                  />
                )}
                {backlogCount > 0 && (
                  <div
                    style={{ width: `${(backlogCount / total) * 100}%` }}
                    className="h-full bg-indigo-500"
                    title={`Backlog: ${backlogCount}`}
                  />
                )}
                {completedCount > 0 && (
                  <div
                    style={{ width: `${(completedCount / total) * 100}%` }}
                    className="h-full bg-teal-500"
                    title={`Concluído: ${completedCount}`}
                  />
                )}
                {platinumCount > 0 && (
                  <div
                    style={{ width: `${(platinumCount / total) * 100}%` }}
                    className="h-full bg-amber-400"
                    title={`Platinado: ${platinumCount}`}
                  />
                )}
                {pausedCount > 0 && (
                  <div
                    style={{ width: `${(pausedCount / total) * 100}%` }}
                    className="h-full bg-yellow-500"
                    title={`Em Pausa: ${pausedCount}`}
                  />
                )}
                {notStartedCount > 0 && (
                  <div
                    style={{ width: `${(notStartedCount / total) * 100}%` }}
                    className="h-full bg-zinc-600"
                    title={`Não Iniciado: ${notStartedCount}`}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-zinc-400 pt-1">
                <span className="flex items-center gap-1.5 p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span>Disponível:</span>
                  <strong className="text-zinc-100 font-mono ml-auto">{availableCount}</strong>
                </span>
                <span className="flex items-center gap-1.5 p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>A Jogar:</span>
                  <strong className="text-zinc-100 font-mono ml-auto">{playingCount}</strong>
                </span>
                <span className="flex items-center gap-1.5 p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Backlog:</span>
                  <strong className="text-zinc-100 font-mono ml-auto">{backlogCount}</strong>
                </span>
                <span className="flex items-center gap-1.5 p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <span>Concluído:</span>
                  <strong className="text-zinc-100 font-mono ml-auto">{completedCount}</strong>
                </span>
                <span className="flex items-center gap-1.5 p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Platinado:</span>
                  <strong className="text-amber-300 font-mono ml-auto">{platinumCount}</strong>
                </span>
                <span className="flex items-center gap-1.5 p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span>Em Pausa:</span>
                  <strong className="text-zinc-100 font-mono ml-auto">{pausedCount}</strong>
                </span>
                <span className="flex items-center gap-1.5 p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                  <span>Não Iniciado:</span>
                  <strong className="text-zinc-100 font-mono ml-auto">{notStartedCount}</strong>
                </span>
                {totalDiskGb > 0 && (
                  <span className="flex items-center gap-1.5 p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                    <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Espaço:</span>
                    <strong className="text-zinc-100 font-mono ml-auto">~{Math.round(totalDiskGb)} GB</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Top Platforms & Origins */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2.5">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-indigo-400" />
                  Consolas / Plataformas
                </h3>
                <div className="space-y-1.5">
                  {topPlatforms.map(([plat, count]) => {
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={plat} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300">{plat}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full bg-indigo-500 rounded-full"
                            />
                          </div>
                          <span className="font-mono text-zinc-400 w-12 text-right">
                            {count} ({pct}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2.5">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-pink-400" />
                  Origem da Coleção
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: "REPACK", label: "Repack", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
                    { key: "STEAM", label: "Steam", color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
                    { key: "GOG", label: "GOG", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
                    { key: "EPIC", label: "Epic", color: "text-zinc-300 bg-zinc-800 border-zinc-700" },
                    { key: "EMULATOR", label: "Emulador", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
                    { key: "PHYSICAL", label: "Físico", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
                  ].map((org) => {
                    const count = originCounts[org.key] || 0;
                    if (count === 0) return null;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div
                        key={org.key}
                        className={`p-2 rounded-xl border flex items-center justify-between ${org.color}`}
                      >
                        <span className="font-semibold text-[11px] truncate flex items-center gap-1.5">
                          <OriginVectorIcon origin={org.key} className="w-3.5 h-3.5 shrink-0" />
                          <span>{org.label}</span>
                        </span>
                        <span className="font-mono font-bold text-[11px]">
                          {count} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {topGenres.length > 0 && (
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2.5">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  Géneros com Maior Presença
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topGenres.map(([genre, count]) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg font-medium flex items-center gap-1.5"
                    >
                      <span>{genre}</span>
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-mono">
                        {count} jogos
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
