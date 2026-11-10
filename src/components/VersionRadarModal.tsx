"use client";

import React, { useState, useMemo, useEffect } from "react";
import { GameItem } from "@/types/game";
import {
  X,
  Tag,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Loader2,
  Calendar,
  Sparkles,
  Layers,
  Archive,
} from "lucide-react";

interface VersionRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: GameItem[];
  onSelectGame: (game: GameItem) => void;
  onRefreshGames: () => Promise<void>;
}

export function VersionRadarModal({
  isOpen,
  onClose,
  games,
  onSelectGame,
  onRefreshGames,
}: VersionRadarModalProps) {
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "UPDATES_AVAILABLE" | "STABLE" | "UP_TO_DATE">("ALL");
  const [isCheckingBulk, setIsCheckingBulk] = useState(false);
  const [bulkStatusMsg, setBulkStatusMsg] = useState<string | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<number | null>(null);

  // Defer Date.now() to client mount to prevent Next.js blocking prerender error
  useEffect(() => {
    setCurrentTimestamp(Date.now());
  }, []);

  const collection = useMemo(() => games.filter((g) => !g.isWishlist), [games]);

  // Calculate days since update for each game
  const gamesWithMeta = useMemo(() => {
    return collection.map((g) => {
      const targetDate = g.latestVersionDate
        ? new Date(g.latestVersionDate)
        : g.versionDate
        ? new Date(g.versionDate)
        : null;

      const daysSince = targetDate && currentTimestamp
        ? Math.max(0, Math.floor((currentTimestamp - targetDate.getTime()) / (1000 * 60 * 60 * 24)))
        : null;

      const isStable = daysSince !== null && daysSince >= 365;
      const hasUpdate = g.isUpToDate === false;
      const isUpToDate = g.isUpToDate === true;

      return {
        ...g,
        daysSince,
        isStable,
        hasUpdate,
        isUpToDate,
      };
    });
  }, [collection, currentTimestamp]);

  // Counts
  const stats = useMemo(() => {
    const updatesAvailable = gamesWithMeta.filter((g) => g.hasUpdate).length;
    const stableCount = gamesWithMeta.filter((g) => g.isStable).length;
    const upToDateCount = gamesWithMeta.filter((g) => g.isUpToDate).length;
    const withVersionCount = gamesWithMeta.filter((g) => g.gameVersion || g.latestPatchTitle).length;
    return {
      total: gamesWithMeta.length,
      updatesAvailable,
      stableCount,
      upToDateCount,
      withVersionCount,
    };
  }, [gamesWithMeta]);

  // Filtered games
  const filteredGames = useMemo(() => {
    return gamesWithMeta
      .filter((g) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          if (
            !g.title.toLowerCase().includes(q) &&
            !g.gameVersion?.toLowerCase().includes(q) &&
            !g.latestPatchTitle?.toLowerCase().includes(q)
          ) {
            return false;
          }
        }

        if (filterTab === "UPDATES_AVAILABLE") return g.hasUpdate;
        if (filterTab === "STABLE") return g.isStable;
        if (filterTab === "UP_TO_DATE") return g.isUpToDate;
        return true;
      })
      .sort((a, b) => {
        // Prioritize updates available, then by days since update descending
        if (a.hasUpdate && !b.hasUpdate) return -1;
        if (!a.hasUpdate && b.hasUpdate) return 1;
        return (b.daysSince ?? -1) - (a.daysSince ?? -1);
      });
  }, [gamesWithMeta, search, filterTab]);

  if (!isOpen) return null;

  const handleBulkCheck = async () => {
    setIsCheckingBulk(true);
    setBulkStatusMsg("A verificar anúncios e patches oficiais na Steam...");
    try {
      const res = await fetch("/api/games/check-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 30 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao verificar em lote.");

      await onRefreshGames();
      setBulkStatusMsg(data.message || "Verificação concluída!");
    } catch (err: any) {
      setBulkStatusMsg(err.message || "Erro ao verificar.");
    } finally {
      setIsCheckingBulk(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-950/60 via-zinc-900 to-indigo-950/60 border-b border-zinc-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              <span>Version Radar & Patch Tracker</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Radar de Versões & Atualizações
            </h2>
            <p className="text-xs text-zinc-300 max-w-xl">
              Controla que versão tens instalada, descobre se saíram novos patches na Steam e identifica jogos que já não recebem updates há anos (estáveis e finais).
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats & Bulk Action Bar */}
        <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2">
              <span className="text-zinc-400">Total de Jogos:</span>
              <strong className="text-white font-mono">{stats.total}</strong>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-amber-300">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Updates Novos:</span>
              <strong className="font-mono">{stats.updatesAvailable}</strong>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-2 text-indigo-300">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Estáveis (&gt;1 ano):</span>
              <strong className="font-mono">{stats.stableCount}</strong>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Em Dia:</span>
              <strong className="font-mono">{stats.upToDateCount}</strong>
            </div>
          </div>

          <button
            type="button"
            disabled={isCheckingBulk}
            onClick={handleBulkCheck}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isCheckingBulk ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>A consultar Steam...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Verificar Todos os Jogos na Steam</span>
              </>
            )}
          </button>
        </div>

        {bulkStatusMsg && (
          <div className="px-5 py-2 bg-purple-950/40 border-b border-purple-500/30 text-purple-200 text-xs flex items-center gap-2 animate-in fade-in">
            <span>ℹ️</span>
            <span>{bulkStatusMsg}</span>
          </div>
        )}

        {/* Search & Tabs */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Pesquisar por título de jogo, versão..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            {[
              { key: "ALL", label: "Todos" },
              { key: "UPDATES_AVAILABLE", label: `🟡 Updates (${stats.updatesAvailable})` },
              { key: "STABLE", label: `💤 Estáveis (>1 ano)` },
              { key: "UP_TO_DATE", label: `🟢 Em Dia` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterTab(tab.key as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterTab === tab.key
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Games Table List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs">
          {filteredGames.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 space-y-2">
              <div className="text-3xl">🔍</div>
              <p className="text-sm font-medium">Nenhum jogo encontrado para este filtro.</p>
            </div>
          ) : (
            filteredGames.map((game) => {
              return (
                <div
                  key={game.id}
                  onClick={() => {
                    onClose();
                    onSelectGame(game);
                  }}
                  className="p-3 bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800 hover:border-purple-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all cursor-pointer group"
                >
                  {/* Left: Thumbnail & Title */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-14 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 shrink-0">
                      {game.coverUrl ? (
                        <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">🎮</div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors truncate">
                          {game.title}
                        </h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 shrink-0">
                          {game.platform}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-zinc-400 text-[11px] mt-0.5">
                        {game.gameVersion ? (
                          <span className="text-indigo-300 font-mono font-semibold">
                            Instalada: {game.gameVersion}
                          </span>
                        ) : (
                          <span className="text-zinc-500 italic">Sem versão registada</span>
                        )}

                        {game.versionDate && (
                          <span>• Data: {new Date(game.versionDate).toLocaleDateString("pt-PT")}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Latest Patch Information */}
                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <div className="text-right">
                      {game.latestPatchTitle ? (
                        <>
                          <span className="font-semibold text-zinc-200 block truncate max-w-[220px]">
                            {game.latestPatchTitle}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {game.latestVersionDate && (
                              <>
                                {new Date(game.latestVersionDate).toLocaleDateString("pt-PT")}
                                {game.daysSince !== null && (
                                  <strong className="text-purple-300 ml-1">
                                    (há {game.daysSince < 30 ? `${game.daysSince}d` : game.daysSince < 365 ? `${Math.floor(game.daysSince / 30)}m` : `${Math.floor(game.daysSince / 365)}a`})
                                  </strong>
                                )}
                              </>
                            )}
                          </span>
                        </>
                      ) : (
                        <span className="text-zinc-500 text-[11px] italic">Patch oficial não verificado</span>
                      )}
                    </div>

                    {/* Status Pill */}
                    {game.hasUpdate ? (
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        <span>Update Novo</span>
                      </span>
                    ) : game.isStable ? (
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1" title="Sem updates há mais de 1 ano">
                        <span>💤 Estável</span>
                      </span>
                    ) : game.isUpToDate ? (
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>Em Dia</span>
                      </span>
                    ) : null}

                    {game.latestPatchNotesUrl && (
                      <a
                        href={game.latestPatchNotesUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition-colors"
                        title="Abrir Patch Notes oficiais na Steam"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
