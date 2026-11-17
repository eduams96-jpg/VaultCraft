"use client";

import React, { useState, useRef, useEffect, useSyncExternalStore } from "react";
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
  FolderSearch,
  Volume2,
  VolumeX,
  Search,
} from "lucide-react";
import { VaultCraftLogo } from "@/components/CraftIcons";
import { isSfxMuted, subscribeSfxMuted, toggleSfxMuted, playUiSound } from "@/lib/ui-sfx";

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
  onOpenScanGamesModal?: () => void;
  onOpenSpotlight?: () => void;
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
  onOpenScanGamesModal,
  onOpenSpotlight,
  totalGames,
  wishlistCount,
}: NavbarProps) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const sfxMuted = useSyncExternalStore(subscribeSfxMuted, isSfxMuted, () => false);
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
    <header className="sticky top-0 z-40 bg-zinc-950/85 backdrop-blur-2xl border-b border-white/[0.07]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left: Minimalist Single-Line Studio Brand */}
        <button
          type="button"
          onClick={() => onSelectTab && onSelectTab("COLLECTION")}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0 whitespace-nowrap focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-zinc-900/90 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-indigo-400/50 transition-all shrink-0">
            <VaultCraftLogo className="w-7 h-7" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-white">
              Vault
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Craft
              </span>
            </span>
            <span className="hidden xl:inline-flex text-[9px] uppercase font-bold tracking-[0.14em] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
              Studio
            </span>
          </div>
        </button>

        {/* Center: Games Vault Badge */}
        <div className="flex items-center gap-1.5 bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-white/[0.08] shrink-0">
          <Gamepad2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-xs font-semibold text-white">Cofre de Jogos</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md font-mono bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
            {totalGames}
          </span>
        </div>

        {/* Right: Unified Utility Dock + Primary CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenSpotlight && (
            <button
              type="button"
              onClick={() => {
                playUiSound("open");
                onOpenSpotlight();
              }}
              title="Spotlight Global — Pesquisar Jogos e Comandos (Ctrl+K)"
              className="h-10 px-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-white/[0.08] hover:border-indigo-500/40 text-zinc-300 hover:text-white flex items-center gap-2 text-xs font-medium transition-all cursor-pointer shrink-0"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="hidden xl:inline text-zinc-400">Spotlight</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/50 border border-white/10 text-[10px] font-mono text-zinc-400">
                Ctrl+K
              </kbd>
            </button>
          )}
          <div className="flex items-center gap-0.5 bg-zinc-900/90 p-1 rounded-xl border border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                playUiSound("click");
                if (onSelectTab) {
                  onSelectTab(activeTab === "WISHLIST" ? "COLLECTION" : "WISHLIST");
                } else {
                  onOpenWishlistModal();
                }
              }}
              className={`h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "WISHLIST"
                  ? "bg-pink-600 text-white shadow-sm"
                  : "text-zinc-300 hover:text-white hover:bg-white/[0.05]"
              }`}
              title="Wishlist e Radar de Jogos"
            >
              <Bookmark className={`w-3.5 h-3.5 shrink-0 ${activeTab === "WISHLIST" ? "text-white" : "text-pink-400"}`} />
              <span className="hidden md:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold font-mono ${
                    activeTab === "WISHLIST" ? "bg-black/25 text-white" : "bg-pink-500/20 text-pink-300"
                  }`}
                >
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                playUiSound("click");
                onOpenBatchModal();
              }}
              className="h-8 px-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.05] flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer"
              title="Importar Lista de Jogos em Lote"
            >
                  <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="hidden lg:inline">Importar Lote</span>
                </button>
                {onOpenScanGamesModal && (
                  <button
                    type="button"
                    onClick={() => {
                      playUiSound("click");
                      onOpenScanGamesModal();
                    }}
                    className="h-8 px-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.05] flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer"
                    title="Escanear Pasta Local de Jogos / Repacks / ROMs"
                  >
                    <FolderSearch className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="hidden lg:inline">Scanner</span>
                  </button>
                )}

            {/* Tools Dropdown */}
            <div className="relative" ref={toolsRef}>
              <button
                type="button"
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  toolsOpen
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-300 hover:text-white hover:bg-white/[0.05]"
                }`}
                title="Ferramentas Adicionais (Metas, Gamer Card, Stats, Backup)"
              >
                <Wrench className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="hidden sm:inline">Ferramentas</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform shrink-0 ${
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

          {/* Sound SFX Toggle (inside unified dock) */}
          <button
            type="button"
            onClick={() => toggleSfxMuted()}
            title={sfxMuted ? "Ativar Micro-Sons de Interface" : "Silenciar Micro-Sons de Interface"}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              sfxMuted
                ? "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                : "text-indigo-300 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            {sfxMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          </div>

          {/* Add Game Button (Primary, Single-Line) */}
          <button
            type="button"
            onClick={() => {
              playUiSound("click");
              onOpenAddModal();
            }}
            title="Adicionar Novo Jogo (Alt+N)"
            className="h-9 px-3.5 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-md active:scale-95 transition-all cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/25"
          >
            <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
            <span>Novo Jogo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
