"use client";

import React, { useState, useMemo } from "react";
import { GameItem } from "@/types/game";
import {
  Bookmark,
  Plus,
  ArrowRight,
  Trash2,
  Edit2,
  Search,
  Sparkles,
  Flame,
  Star,
  Clock,
  TrendingDown,
  Calendar,
  ExternalLink,
  ShieldAlert,
  Tag,
  Target,
  RefreshCw,
} from "lucide-react";
import { playUiSound } from "@/lib/ui-sfx";

interface WishlistViewProps {
  games: GameItem[];
  onOpenAddModal: () => void;
  onEditGame: (game: GameItem) => void;
  onDeleteGame: (game: GameItem) => void;
  onMoveToCollection: (game: GameItem) => Promise<void>;
  onSelectGameDetail?: (game: GameItem) => void;
}

interface SteamPriceState {
  loading: boolean;
  finalPrice?: number;
  initialPrice?: number;
  discountPercent?: number;
  formatted?: string;
  isFree?: boolean;
}

export function WishlistView({
  games,
  onOpenAddModal,
  onEditGame,
  onDeleteGame,
  onMoveToCollection,
  onSelectGameDetail,
}: WishlistViewProps) {
  const [search, setSearch] = useState("");
  const [filterRadar, setFilterRadar] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [movingId, setMovingId] = useState<string | null>(null);
  const [checkingAllPrices, setCheckingAllPrices] = useState(false);

  // Store live Steam prices cached by game ID
  const [steamPrices, setSteamPrices] = useState<Record<string, SteamPriceState>>({});

  const wishlistGames = useMemo(() => {
    return games.filter((g) => g.isWishlist);
  }, [games]);

  // Statistics
  const stats = useMemo(() => {
    const total = wishlistGames.length;
    const high = wishlistGames.filter((g) => g.wishlistPriority === "HIGH").length;
    const medium = wishlistGames.filter(
      (g) => !g.wishlistPriority || g.wishlistPriority === "MEDIUM"
    ).length;
    const low = wishlistGames.filter((g) => g.wishlistPriority === "LOW").length;

    const waitingCrack = wishlistGames.filter(
      (g) => g.wishlistStatus === "WAITING_CRACK"
    ).length;
    const waitingSale = wishlistGames.filter(
      (g) => g.wishlistStatus === "WAITING_SALE"
    ).length;
    const waitingRelease = wishlistGames.filter(
      (g) => g.wishlistStatus === "WAITING_RELEASE"
    ).length;

    const totalTargetBudget = wishlistGames.reduce(
      (acc, g) => acc + (g.targetPrice || 0),
      0
    );

    return {
      total,
      high,
      medium,
      low,
      waitingCrack,
      waitingSale,
      waitingRelease,
      totalTargetBudget,
    };
  }, [wishlistGames]);

  // Filtered games
  const filteredList = useMemo(() => {
    return wishlistGames
      .filter((g) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = g.title.toLowerCase().includes(q);
          const matchGenre = g.genres?.toLowerCase().includes(q);
          const matchPlatform = g.platform.toLowerCase().includes(q);
          if (!matchTitle && !matchGenre && !matchPlatform) return false;
        }

        if (filterRadar !== "ALL" && g.wishlistStatus !== filterRadar) {
          return false;
        }

        if (filterPriority !== "ALL") {
          const p = g.wishlistPriority || "MEDIUM";
          if (p !== filterPriority) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const prioScore = (p?: string | null) =>
          p === "HIGH" ? 3 : p === "MEDIUM" || !p ? 2 : 1;
        const diff = prioScore(b.wishlistPriority) - prioScore(a.wishlistPriority);
        if (diff !== 0) return diff;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [wishlistGames, search, filterRadar, filterPriority]);

  // Fetch live price for a specific game
  const handleCheckSteamPrice = async (game: GameItem) => {
    if (steamPrices[game.id]?.loading) return;

    setSteamPrices((prev) => ({
      ...prev,
      [game.id]: { loading: true },
    }));

    try {
      const res = await fetch(`/api/steam/price?query=${encodeURIComponent(game.title)}`);
      const data = await res.json();
      if (data.found) {
        setSteamPrices((prev) => ({
          ...prev,
          [game.id]: {
            loading: false,
            finalPrice: data.finalPrice,
            initialPrice: data.initialPrice,
            discountPercent: data.discountPercent,
            formatted: data.formatted,
            isFree: data.isFree,
          },
        }));
      } else {
        setSteamPrices((prev) => ({
          ...prev,
          [game.id]: {
            loading: false,
            formatted: "Não encontrado",
          },
        }));
      }
    } catch {
      setSteamPrices((prev) => ({
        ...prev,
        [game.id]: {
          loading: false,
          formatted: "Erro",
        },
      }));
    }
  };

  const handleCheckAllSteamPrices = async () => {
    if (checkingAllPrices || filteredList.length === 0) return;
    setCheckingAllPrices(true);
    playUiSound("click");
    try {
      for (const game of filteredList) {
        await handleCheckSteamPrice(game);
      }
      playUiSound("success");
    } finally {
      setCheckingAllPrices(false);
    }
  };

  const handleMove = async (game: GameItem) => {
    setMovingId(game.id);
    playUiSound("platinum");
    try {
      await onMoveToCollection(game);
    } finally {
      setMovingId(null);
    }
  };

  const getRadarBadge = (status?: string | null) => {
    switch (status) {
      case "WAITING_CRACK":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 backdrop-blur-md">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Aguardar Repack</span>
          </span>
        );
      case "WAITING_SALE":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 backdrop-blur-md">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aguardar Promoção</span>
          </span>
        );
      case "WAITING_RELEASE":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 backdrop-blur-md">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Aguardar Lançamento</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800/90 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 backdrop-blur-md">
            <Target className="w-3.5 h-3.5 text-pink-400" />
            <span>Radar Ativo</span>
          </span>
        );
    }
  };

  const getPriorityBadge = (priority?: string | null) => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 shadow-sm shadow-rose-950/40 backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Alta Prioridade</span>
          </span>
        );
      case "LOW":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800/90 text-zinc-400 border border-zinc-700/80 flex items-center gap-1 backdrop-blur-md">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Baixa Prioridade</span>
          </span>
        );
      case "MEDIUM":
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 backdrop-blur-md">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
            <span>Média Prioridade</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Wishlist Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Total Desejos */}
        <div
          onClick={() => {
            playUiSound("click");
            setFilterRadar("ALL");
            setFilterPriority("ALL");
          }}
          className="relative overflow-hidden bg-zinc-900/65 hover:bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all"
        >
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-pink-500 to-purple-500 opacity-75" />
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-semibold">
            <span>Total no Radar</span>
            <Bookmark className="w-3.5 h-3.5 text-pink-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-extrabold text-white">{stats.total}</div>
        </div>

        {/* Alta Prioridade */}
        <div
          onClick={() => {
            playUiSound("click");
            setFilterPriority(filterPriority === "HIGH" ? "ALL" : "HIGH");
          }}
          className={`relative overflow-hidden border rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
            filterPriority === "HIGH"
              ? "bg-rose-950/35 border-rose-500/60 shadow-lg shadow-rose-950/30"
              : "bg-zinc-900/65 hover:bg-zinc-900/90 border-zinc-800/80 hover:border-rose-500/40"
          }`}
        >
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-rose-500 to-orange-500 opacity-85" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-rose-300">
            <span>Alta Prioridade</span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-extrabold text-white">{stats.high}</div>
        </div>

        {/* Aguardar Crack */}
        <div
          onClick={() => {
            playUiSound("click");
            setFilterRadar(filterRadar === "WAITING_CRACK" ? "ALL" : "WAITING_CRACK");
          }}
          className={`relative overflow-hidden border rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
            filterRadar === "WAITING_CRACK"
              ? "bg-amber-950/35 border-amber-500/60 shadow-lg shadow-amber-950/30"
              : "bg-zinc-900/65 hover:bg-zinc-900/90 border-zinc-800/80 hover:border-amber-500/40"
          }`}
        >
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-500 to-yellow-400 opacity-85" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-amber-300">
            <span>Esperar Repack</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-extrabold text-white">{stats.waitingCrack}</div>
        </div>

        {/* Aguardar Promoção */}
        <div
          onClick={() => {
            playUiSound("click");
            setFilterRadar(filterRadar === "WAITING_SALE" ? "ALL" : "WAITING_SALE");
          }}
          className={`relative overflow-hidden border rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
            filterRadar === "WAITING_SALE"
              ? "bg-emerald-950/35 border-emerald-500/60 shadow-lg shadow-emerald-950/30"
              : "bg-zinc-900/65 hover:bg-zinc-900/90 border-zinc-800/80 hover:border-emerald-500/40"
          }`}
        >
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400 opacity-85" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-300">
            <span>Esperar Promo</span>
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-extrabold text-white">{stats.waitingSale}</div>
        </div>

        {/* Aguardar Lançamento */}
        <div
          onClick={() => {
            playUiSound("click");
            setFilterRadar(filterRadar === "WAITING_RELEASE" ? "ALL" : "WAITING_RELEASE");
          }}
          className={`relative overflow-hidden border rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
            filterRadar === "WAITING_RELEASE"
              ? "bg-indigo-950/35 border-indigo-500/60 shadow-lg shadow-indigo-950/30"
              : "bg-zinc-900/65 hover:bg-zinc-900/90 border-zinc-800/80 hover:border-indigo-500/40"
          }`}
        >
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-indigo-500 to-sky-400 opacity-85" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300">
            <span>Lançamentos</span>
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-extrabold text-white">{stats.waitingRelease}</div>
        </div>

        {/* Orçamento Alvo Total */}
        <div className="relative overflow-hidden bg-zinc-900/65 border border-zinc-800/80 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-teal-400 to-emerald-500 opacity-75" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
            <span>Orçamento Meta</span>
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-extrabold text-emerald-300">
            {stats.totalTargetBudget.toFixed(2)}€
          </div>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar desejos por título, género..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-10 pr-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Radar Status Filter */}
          <select
            value={filterRadar}
            onChange={(e) => setFilterRadar(e.target.value)}
            className="h-9 bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 focus:outline-none focus:border-pink-500 cursor-pointer"
          >
            <option value="ALL">Todos os Estados do Radar</option>
            <option value="WAITING_CRACK">Aguardar Repack / Crack</option>
            <option value="WAITING_SALE">Aguardar Promoção</option>
            <option value="WAITING_RELEASE">Aguardar Lançamento</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="h-9 bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 focus:outline-none focus:border-pink-500 cursor-pointer"
          >
            <option value="ALL">Todas as Prioridades</option>
            <option value="HIGH">Alta Prioridade</option>
            <option value="MEDIUM">Média Prioridade</option>
            <option value="LOW">Baixa Prioridade</option>
          </select>

          {/* 1-Click Check All Steam Prices */}
          {filteredList.length > 0 && (
            <button
              type="button"
              onClick={handleCheckAllSteamPrices}
              disabled={checkingAllPrices}
              className="h-9 px-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer disabled:opacity-50"
              title="Consultar preços atuais na Steam para todos os jogos da lista"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${checkingAllPrices ? "animate-spin" : ""}`} />
              <span>{checkingAllPrices ? "A Consultar Steam..." : "Ver Todos os Preços"}</span>
            </button>
          )}

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={() => {
              playUiSound("open");
              onOpenAddModal();
            }}
            className="h-9 px-4 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 whitespace-nowrap shadow-lg shadow-pink-600/30 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar ao Radar</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredList.length === 0 && (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8">
          <div className="w-16 h-16 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">
            {wishlistGames.length === 0
              ? "A tua Wishlist / Radar está vazia!"
              : "Nenhum jogo encontrado com os filtros selecionados"}
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mb-6">
            {wishlistGames.length === 0
              ? "Adiciona os títulos que queres acompanhar para saber quando saem em promoção, quando o repack fica disponível ou quando são lançados."
              : "Tenta limpar a pesquisa ou redefinir os filtros de radar e prioridade."}
          </p>
          <div className="flex items-center gap-3">
            {wishlistGames.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  playUiSound("click");
                  setSearch("");
                  setFilterRadar("ALL");
                  setFilterPriority("ALL");
                }}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Limpar Filtros
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  playUiSound("open");
                  onOpenAddModal();
                }}
                className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-pink-600/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Adicionar Primeiro Jogo ao Radar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Wishlist Games Cards Grid */}
      {filteredList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map((game) => {
            const priceInfo = steamPrices[game.id];
            const hasTargetPrice = game.targetPrice && game.targetPrice > 0;
            const targetMet =
              hasTargetPrice &&
              priceInfo?.finalPrice !== undefined &&
              priceInfo.finalPrice <= (game.targetPrice || 0);

            return (
              <div
                key={game.id}
                className="group relative bg-zinc-900 border border-zinc-800 hover:border-pink-500/40 rounded-3xl overflow-hidden shadow-xl transition-all hover:shadow-pink-950/20 flex flex-col"
              >
                {/* Banner Header Image */}
                <div
                  onClick={() => onSelectGameDetail && onSelectGameDetail(game)}
                  className="relative h-44 w-full bg-zinc-950 overflow-hidden cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={game.bannerUrl || game.coverUrl || "/placeholder-game.png"}
                    alt={game.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    {getPriorityBadge(game.wishlistPriority)}
                    {getRadarBadge(game.wishlistStatus)}
                  </div>

                  {/* Target Price Ribbon if defined */}
                  {hasTargetPrice && (
                    <div className="absolute bottom-3 left-3 bg-zinc-950/90 border border-emerald-500/40 text-emerald-300 font-bold px-2.5 py-1 rounded-xl text-xs backdrop-blur-md shadow-md flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Preço Meta:</span>
                      <span className="text-white font-mono">≤ {game.targetPrice?.toFixed(2)}€</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4
                        onClick={() => onSelectGameDetail && onSelectGameDetail(game)}
                        className="text-base font-bold text-white hover:text-pink-400 transition-colors line-clamp-1 cursor-pointer"
                        title={game.title}
                      >
                        {game.title}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                        {game.platform}
                      </span>
                    </div>

                    {game.genres && (
                      <p className="text-xs text-zinc-400 line-clamp-1">
                        {game.genres}
                      </p>
                    )}

                    {game.installNotes && (
                      <p className="mt-2 text-xs text-zinc-400 italic bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/80 line-clamp-2">
                        &ldquo;{game.installNotes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Steam Price Checker Section */}
                  <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-2xl flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-500 font-semibold block">
                        Preço Steam Oficial (Portugal):
                      </span>
                      {priceInfo?.loading ? (
                        <span className="text-zinc-400 text-xs animate-pulse">A consultar Steam...</span>
                      ) : priceInfo?.formatted ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-white text-sm">
                            {priceInfo.formatted}
                          </span>
                          {priceInfo.discountPercent ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                              -{priceInfo.discountPercent}%
                            </span>
                          ) : null}
                          {targetMet && (
                            <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold text-[10px] flex items-center gap-1 animate-bounce">
                              <Sparkles className="w-3 h-3" />
                              <span>Alvo Atingido!</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-xs">Preço não consultado</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCheckSteamPrice(game)}
                      className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                      title="Consultar preço em tempo real na Steam"
                    >
                      {priceInfo ? "Atualizar" : "Ver Preço"}
                    </button>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {game.externalLink && (
                        <a
                          href={game.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-zinc-400 hover:text-sky-400 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                          title="Abrir Link Externo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => onEditGame(game)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                        title="Editar Desejo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteGame(game)}
                        className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Remover do Radar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Move to Collection Primary Action */}
                    <button
                      type="button"
                      disabled={movingId === game.id}
                      onClick={() => handleMove(game)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <span>Mover para Coleção</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
