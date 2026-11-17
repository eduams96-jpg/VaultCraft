"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { GameItem } from "@/types/game";
import {
  Search,
  X,
  Gamepad2,
  Play,
  FolderOpen,
  Dices,
  BarChart3,
  Sparkles,
  FolderSearch,
  Plus,
  DatabaseBackup,
  ArrowRight,
  Command,
  Radio,
  Share2,
  Target,
} from "lucide-react";
import { playUiSound } from "@/lib/ui-sfx";
import { requestGameLaunch } from "@/lib/game-actions";

interface SpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  games: GameItem[];
  onSelectGame: (game: GameItem) => void;
  onOpenRandomModal: () => void;
  onOpenStatsModal: () => void;
  onOpenWrapUpModal: () => void;
  onOpenScanGamesModal: () => void;
  onOpenAddGameModal: () => void;
  onOpenBackupModal: () => void;
  onOpenVersionRadarModal?: () => void;
  onOpenGamerCardModal?: () => void;
  onOpenGoalsModal?: () => void;
}

type SpotlightEntry =
  | { kind: "game"; id: string; game: GameItem }
  | {
      kind: "command";
      id: string;
      label: string;
      subtitle: string;
      icon: React.ReactNode;
      action: () => void;
    };

/** Painel da paleta: só é montado enquanto está aberto, por isso começa sempre limpo. */
function SpotlightPanel({
  onClose,
  games,
  onSelectGame,
  onOpenRandomModal,
  onOpenStatsModal,
  onOpenWrapUpModal,
  onOpenScanGamesModal,
  onOpenAddGameModal,
  onOpenBackupModal,
  onOpenVersionRadarModal,
  onOpenGamerCardModal,
  onOpenGoalsModal,
}: Omit<SpotlightModalProps, "isOpen" | "onOpen">) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterScope, setFilterScope] = useState<"ALL" | "GAMES" | "COMMANDS">("ALL");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const commands = useMemo(
    () => [
      {
        id: "cmd-random",
        label: "Girar Roleta (O Que Jogar Hoje?)",
        subtitle: "Escolhe aleatoriamente um Jogo pendente da tua coleção",
        keywords: "roleta sorteio random jogar escolher",
        icon: <Dices className="w-4 h-4 text-amber-400" />,
        action: () => {
          onClose();
          onOpenRandomModal();
        },
      },
      {
        id: "cmd-stats",
        label: "Abrir Estatísticas Avançadas",
        subtitle: "Gráficos de Jogos, Horas, Géneros e Espaço em Disco",
        keywords: "estatisticas graficos stats horas gb tb disco",
        icon: <BarChart3 className="w-4 h-4 text-indigo-400" />,
        action: () => {
          onClose();
          onOpenStatsModal();
        },
      },
      {
        id: "cmd-wrapup",
        label: "Abrir Gamer Wrap-Up (Replay)",
        subtitle: "O teu perfil gamer em revista",
        keywords: "replay wrap up revista resumo perfil",
        icon: <Sparkles className="w-4 h-4 text-fuchsia-400" />,
        action: () => {
          onClose();
          onOpenWrapUpModal();
        },
      },
      {
        id: "cmd-scan-games",
        label: "Escanear Pasta de Jogos no PC/NAS",
        subtitle: "Deteta automaticamente jogos instalados, tamanhos e executáveis",
        keywords: "escanear scanner jogos pastas executavel",
        icon: <FolderSearch className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onClose();
          onOpenScanGamesModal();
        },
      },
      {
        id: "cmd-add-game",
        label: "Adicionar Novo Jogo",
        subtitle: "Registar um novo jogo na coleção com busca IGDB/RAWG/Steam",
        keywords: "adicionar novo jogo criar",
        icon: <Plus className="w-4 h-4 text-indigo-400" />,
        action: () => {
          onClose();
          onOpenAddGameModal();
        },
      },
      {
        id: "cmd-backup",
        label: "Backup & Restauro da Base de Dados",
        subtitle: "Exportar ou restaurar snapshots completos do VaultCraft",
        keywords: "backup restauro exportar base de dados json",
        icon: <DatabaseBackup className="w-4 h-4 text-cyan-400" />,
        action: () => {
          onClose();
          onOpenBackupModal();
        },
      },
      ...(onOpenVersionRadarModal
        ? [
            {
              id: "cmd-radar",
              label: "Radar de Versões & Patches (SteamDB / Updates)",
              subtitle: "Verificar atualizações pendentes e comparar builds instaladas",
              keywords: "radar versoes patches updates steamdb builds",
              icon: <Radio className="w-4 h-4 text-emerald-400" />,
              action: () => {
                onClose();
                onOpenVersionRadarModal();
              },
            },
          ]
        : []),
      ...(onOpenGamerCardModal
        ? [
            {
              id: "cmd-gamercard",
              label: "Abrir Holo Gamer Card (Cartão de Perfil)",
              subtitle: "Cartão visual Holográfico partilhável da tua coleção de jogos",
              keywords: "gamer card cartao perfil holo partilhar",
              icon: <Share2 className="w-4 h-4 text-amber-400" />,
              action: () => {
                onClose();
                onOpenGamerCardModal();
              },
            },
          ]
        : []),
      ...(onOpenGoalsModal
        ? [
            {
              id: "cmd-goals",
              label: "Metas de Backlog & Desafios",
              subtitle: "Gerir objetivos anuais e progresso de conclusão",
              keywords: "metas objetivos backlog desafios goals",
              icon: <Target className="w-4 h-4 text-rose-400" />,
              action: () => {
                onClose();
                onOpenGoalsModal();
              },
            },
          ]
        : []),
    ],
    [
      onClose,
      onOpenAddGameModal,
      onOpenBackupModal,
      onOpenGamerCardModal,
      onOpenGoalsModal,
      onOpenRandomModal,
      onOpenScanGamesModal,
      onOpenStatsModal,
      onOpenVersionRadarModal,
      onOpenWrapUpModal,
    ]
  );

  const entries: SpotlightEntry[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list: SpotlightEntry[] = [];

    if (filterScope === "ALL" || filterScope === "GAMES") {
      const matchedGames = games
        .filter((g) => {
          if (!q) return true;
          const hay = `${g.title} ${g.platform || ""} ${g.genres || ""} ${g.tags || ""} ${
            g.customCategories || ""
          } ${g.repackGroup || ""}`.toLowerCase();
          return hay.includes(q);
        })
        .slice(0, q ? 12 : 5);

      for (const g of matchedGames) {
        list.push({ kind: "game", id: `game-${g.id}`, game: g });
      }
    }


    if (filterScope === "ALL" || filterScope === "COMMANDS") {
      const matchedCommands = commands.filter((c) => {
        if (!q) return true;
        return `${c.label} ${c.subtitle} ${c.keywords}`.toLowerCase().includes(q);
      });

      for (const c of matchedCommands) {
        list.push({
          kind: "command",
          id: c.id,
          label: c.label,
          subtitle: c.subtitle,
          icon: c.icon,
          action: c.action,
        });
      }
    }

    return list;
  }, [query, filterScope, games, commands]);

  const updateQuery = (value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  };

  const handleActivateEntry = (entry: SpotlightEntry) => {
    playUiSound("open");
    if (entry.kind === "game") {
      onClose();
      onSelectGame(entry.game);
    } else {
      entry.action();
    }
  };

  const handleLaunchGame = async (e: React.MouseEvent, game: GameItem) => {
    e.stopPropagation();
    playUiSound("launch");
    await requestGameLaunch(game.id, "launch");
    onClose();
  };

  const handleOpenGameFolder = async (e: React.MouseEvent, game: GameItem) => {
    e.stopPropagation();
    playUiSound("open");
    await requestGameLaunch(game.id, "open");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (entries.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % entries.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + entries.length) % entries.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = entries[selectedIndex];
      if (target) handleActivateEntry(target);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center pt-14 sm:pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-zinc-900/95 border border-zinc-700/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input */}
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950/70">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4 text-indigo-300" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Pesquisa rápida em Jogos, Categorias ou Comandos..."
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-white placeholder:text-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => updateQuery("")}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Scope Filter Pills */}
        <div className="px-4 py-2 bg-zinc-950/40 border-b border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            {[
              { key: "ALL", label: "Tudo" },
              { key: "GAMES", label: `Jogos (${games.length})` },
              { key: "COMMANDS", label: "Comandos" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  playUiSound("click");
                  setFilterScope(tab.key as "ALL" | "GAMES" | "COMMANDS");
                  setSelectedIndex(0);
                  inputRef.current?.focus();
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterScope === tab.key
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
            <Command className="w-3 h-3" />
            <span>↑↓ navegar • Enter abrir</span>
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2.5 space-y-1 flex-1">
          {entries.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              Nenhum jogo ou comando encontrado para &quot;{query}&quot;.
            </div>
          ) : (
            entries.map((entry, idx) => {
              const isSelected = idx === selectedIndex;

              if (entry.kind === "game") {
                const g = entry.game;
                const hasPath = Boolean(g.executablePath || g.storageLocation);
                return (
                  <div
                    key={entry.id}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => handleActivateEntry(entry)}
                    className={`p-2.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-indigo-950/50 border-indigo-500/50 shadow-sm"
                        : "bg-transparent border-transparent hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="case-poster w-9 h-12 rounded-lg bg-zinc-950 border border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                        {g.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={g.coverUrl} alt={g.title} className="w-full h-full object-cover" />
                        ) : (
                          <Gamepad2 className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-white truncate">
                            {g.title}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                            Jogo • {g.platform}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate flex items-center gap-2">
                          <span>{g.hoursPlayed || 0}h jogadas</span>
                          {(g.customCategories || g.tags) && (
                            <span className="text-fuchsia-300 font-mono">
                              • {g.customCategories || g.tags}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasPath && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => handleLaunchGame(e, g)}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            title="Jogar Agora"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span className="hidden sm:inline">Jogar</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenGameFolder(e, g)}
                            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 cursor-pointer"
                            title="Abrir Pasta no Explorador"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                          </button>
                        </>
                      )}
                      <span className="p-1.5 text-zinc-500">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={entry.id}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleActivateEntry(entry)}
                  className={`p-2.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-zinc-800/90 border-zinc-600 shadow-sm"
                      : "bg-transparent border-transparent hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                      {entry.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
                        {entry.label}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">{entry.subtitle}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400 shrink-0">
                    Comando
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Paleta de comandos global (Ctrl/Cmd + K). O atalho vive aqui, sempre montado;
 * o painel em si só existe enquanto está aberto.
 */
export function SpotlightModal({ isOpen, onOpen, ...panelProps }: SpotlightModalProps) {
  const { onClose } = panelProps;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          playUiSound("open");
          onOpen();
        }
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onOpen]);

  return isOpen ? <SpotlightPanel {...panelProps} /> : null;
}
