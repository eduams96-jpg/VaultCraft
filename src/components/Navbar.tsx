"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Gamepad2,
  ShieldCheck,
  Dices,
  BarChart3,
  Bookmark,
  Layers,
  ChevronDown,
  Wrench,
  FolderPlus,
  Target,
  Sparkles,
  Share2,
  Wand2,
  RefreshCw,
  Loader2,
  Radio,
} from "lucide-react";

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenBatchModal: () => void;
  onOpenBackupModal: () => void;
  onOpenRandomModal: () => void;
  onOpenStatsModal: () => void;
  onOpenWishlistModal: () => void;
  onOpenCategoryModal?: () => void;
  onOpenGoalsModal?: () => void;
  onOpenWrapUpModal?: () => void;
  onOpenGamerCardModal?: () => void;
  onOpenVersionRadarModal?: () => void;
  onEnrichMetadata?: () => void;
  onSyncSteamHours?: () => void;
  isEnriching?: boolean;
  isSyncingSteam?: boolean;
  activeTab?: "COLLECTION" | "WISHLIST";
  onSelectTab?: (tab: "COLLECTION" | "WISHLIST") => void;
  totalGames: number;
  wishlistCount: number;
}

export function Navbar({
  onOpenAddModal,
  onOpenBatchModal,
  onOpenBackupModal,
  onOpenRandomModal,
  onOpenStatsModal,
  onOpenWishlistModal,
  onOpenCategoryModal,
  onOpenGoalsModal,
  onOpenWrapUpModal,
  onOpenGamerCardModal,
  onOpenVersionRadarModal,
  onEnrichMetadata,
  onSyncSteamHours,
  isEnriching = false,
  isSyncingSteam = false,
  activeTab = "COLLECTION",
  onSelectTab,
  totalGames,
  wishlistCount,
}: NavbarProps) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => onSelectTab && onSelectTab("COLLECTION")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0 group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                Game<span className="text-indigo-400">Tracker</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Vault
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Gestão de Coleção (Originais, Repacks, ROMs & Físicos)
            </p>
          </div>
        </div>

        {/* Right Actions: Organized & Streamlined */}
        <div className="flex items-center gap-2">
          {/* Wishlist / Radar */}
          <button
            type="button"
            onClick={() => {
              if (onSelectTab) {
                onSelectTab(activeTab === "WISHLIST" ? "COLLECTION" : "WISHLIST");
              } else {
                onOpenWishlistModal();
              }
            }}
            className={`px-3 py-2 border text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer relative ${
              activeTab === "WISHLIST"
                ? "bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-600/30"
                : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white"
            }`}
            title="Wishlist e Radar de Jogos"
          >
            <Bookmark className={`w-4 h-4 ${activeTab === "WISHLIST" ? "text-white" : "text-pink-400"}`} />
            <span className="hidden sm:inline">Wishlist</span>
            {wishlistCount > 0 && (
              <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                activeTab === "WISHLIST" ? "bg-white text-pink-600" : "bg-pink-500 text-white"
              }`}>
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Metas & Desafios Button (1-Click) */}
          {onOpenGoalsModal && (
            <button
              type="button"
              onClick={onOpenGoalsModal}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/50 text-indigo-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Metas & Desafios de Backlog"
            >
              <Target className="w-4 h-4 text-indigo-400" />
              <span className="hidden lg:inline">Metas</span>
            </button>
          )}

          {/* Gamer Card Button (1-Click) */}
          {onOpenGamerCardModal && (
            <button
              type="button"
              onClick={onOpenGamerCardModal}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 text-amber-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Gamer Card & Exportar (CSV/PDF)"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline">Gamer Card</span>
            </button>
          )}

          {/* Batch Import Button (Prominent) */}
          <button
            type="button"
            onClick={onOpenBatchModal}
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/50 text-indigo-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            title="Importar Lista de Jogos em Lote com Capas Automáticas"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Importar em Lote</span>
          </button>

          {/* Tools Dropdown (Roleta, Stats, Scan, Backup) */}
          <div className="relative" ref={toolsRef}>
            <button
              type="button"
              onClick={() => setToolsOpen(!toolsOpen)}
              className={`px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                toolsOpen
                  ? "border-indigo-500 text-white bg-zinc-800"
                  : "border-zinc-800 text-zinc-300 hover:text-white"
              }`}
              title="Ferramentas Adicionais"
            >
              <Wrench className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden md:inline">Ferramentas</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
                  toolsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {toolsOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Gamer Wrap-Up (Steam Replay) */}
                {onOpenWrapUpModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setToolsOpen(false);
                      onOpenWrapUpModal();
                    }}
                    className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-zinc-800/80 text-zinc-200 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Gamer Wrap-Up (Replay)</div>
                      <div className="text-[10px] text-zinc-400">Resumo visual do teu perfil</div>
                    </div>
                  </button>
                )}

                {/* Backlog Goals */}
                {onOpenGoalsModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setToolsOpen(false);
                      onOpenGoalsModal();
                    }}
                    className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-zinc-800/80 text-zinc-200 transition-colors cursor-pointer"
                  >
                    <Target className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Metas de Backlog</div>
                      <div className="text-[10px] text-zinc-400">Objetivos e desafios pessoais</div>
                    </div>
                  </button>
                )}

                {/* Gamer Card & Export */}
                {onOpenGamerCardModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setToolsOpen(false);
                      onOpenGamerCardModal();
                    }}
                    className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-zinc-800/80 text-zinc-200 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Gamer Card & Exportar</div>
                      <div className="text-[10px] text-zinc-400">Partilha e exportação (CSV/PDF)</div>
                    </div>
                  </button>
                )}

                <div className="my-1 border-t border-zinc-800" />

                {/* Random Picker */}
                <button
                  type="button"
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenRandomModal();
                  }}
                  className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-zinc-800/80 text-zinc-200 transition-colors cursor-pointer"
                >
                  <Dices className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Roleta do Backlog</div>
                    <div className="text-[10px] text-zinc-400">Sortear jogo para jogar</div>
                  </div>
                </button>

                {/* Stats */}
                <button
                  type="button"
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenStatsModal();
                  }}
                  className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-zinc-800/80 text-zinc-200 transition-colors cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Estatísticas & Poupança</div>
                    <div className="text-[10px] text-zinc-400">Horas e dinheiro poupado</div>
                  </div>
                </button>

                {/* Custom Categories */}
                {onOpenCategoryModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setToolsOpen(false);
                      onOpenCategoryModal();
                    }}
                    className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-zinc-800/80 text-zinc-200 transition-colors cursor-pointer"
                  >
                    <FolderPlus className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Categorias Personalizadas</div>
                      <div className="text-[10px] text-zinc-400">Gerir coleções manuais</div>
                    </div>
                  </button>
                )}

                {/* Auto-Enrich HLTB & Metadata */}
                {onEnrichMetadata && (
                  <button
                    type="button"
                    disabled={isEnriching}
                    onClick={() => {
                      setToolsOpen(false);
                      onEnrichMetadata();
                    }}
                    className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-zinc-800/80 text-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isEnriching ? (
                      <Loader2 className="w-4 h-4 text-pink-400 animate-spin shrink-0" />
                    ) : (
                      <Wand2 className="w-4 h-4 text-pink-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-white">Auto-Completar HLTB</div>
                      <div className="text-[10px] text-zinc-400">Preencher durações e géneros em falta</div>
                    </div>
                  </button>
                )}

                {/* Steam Hours Sync */}
                {onSyncSteamHours && (
                  <button
                    type="button"
                    disabled={isSyncingSteam}
                    onClick={() => {
                      setToolsOpen(false);
                      onSyncSteamHours();
                    }}
                    className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-zinc-800/80 text-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSyncingSteam ? (
                      <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-sky-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-white">Sincronizar Horas Steam</div>
                      <div className="text-[10px] text-zinc-400">Atualizar horas jogadas da Steam</div>
                    </div>
                  </button>
                )}

                {/* Radar de Versões & Patches */}
                {onOpenVersionRadarModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setToolsOpen(false);
                      onOpenVersionRadarModal();
                    }}
                    className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-zinc-800/80 text-zinc-200 transition-colors cursor-pointer"
                  >
                    <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Radar de Versões & Patches</div>
                      <div className="text-[10px] text-zinc-400">Verificar versões e atualizações da coleção</div>
                    </div>
                  </button>
                )}

                <div className="my-1 border-t border-zinc-800" />

                {/* Backup & Restore */}
                <button
                  type="button"
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenBackupModal();
                  }}
                  className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-zinc-800/80 text-zinc-200 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Backup & Restauro</div>
                    <div className="text-[10px] text-zinc-400">Exportar/importar dados JSON</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Add Game Button (Primary) */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
