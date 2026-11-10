"use client";

import React, { useState, useEffect } from "react";
import { GameItem } from "@/types/game";
import { OriginBadge } from "./OriginBadge";
import { StatusBadge } from "./StatusBadge";
import { ArchiveBadge } from "./ArchiveBadge";
import { GameFeaturesBadges } from "./GameFeaturesBadges";
import {
  X,
  Star,
  HardDrive,
  Clock,
  Calendar,
  Layers,
  Edit,
  Trash2,
  Copy,
  Check,
  FolderOpen,
  Hourglass,
  Save,
  Cpu,
  Tag,
  FolderArchive,
  RefreshCw,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface GameDetailModalProps {
  game: GameItem | null;
  onClose: () => void;
  onEdit: (game: GameItem) => void;
  onDelete: (game: GameItem) => void;
  onUpdateStatus: (game: GameItem, newStatus: string) => Promise<void>;
  onToggleArchive?: (game: GameItem) => void;
  onToggleSavefile?: (game: GameItem) => void;
  onToggleAchievements?: (game: GameItem) => void;
  onTogglePlatinum?: (game: GameItem) => void;
  onToggleFavorite?: (game: GameItem) => void;
  onGameUpdated?: (updated: GameItem) => void;
}

export function GameDetailModal({
  game,
  onClose,
  onEdit,
  onDelete,
  onUpdateStatus,
  onToggleArchive,
  onToggleSavefile,
  onToggleAchievements,
  onTogglePlatinum,
  onToggleFavorite,
  onGameUpdated,
}: GameDetailModalProps) {
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [saveBackupStatus, setSaveBackupStatus] = useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateCheckMsg, setUpdateCheckMsg] = useState<string | null>(null);
  const [localGame, setLocalGame] = useState<GameItem | null>(game);
  const [currentTimestamp, setCurrentTimestamp] = useState<number | null>(null);

  useEffect(() => {
    setCurrentTimestamp(Date.now());
  }, []);

  useEffect(() => {
    setLocalGame(game);
    setUpdateCheckMsg(null);
  }, [game]);

  if (!game) return null;

  const activeGame = localGame || game;

  const copyNotesToClipboard = () => {
    if (activeGame.installNotes) {
      navigator.clipboard.writeText(activeGame.installNotes);
      setCopiedNotes(true);
      setTimeout(() => setCopiedNotes(false), 2000);
    }
  };

  const handleOpenSaves = async () => {
    try {
      const res = await fetch(`/api/games/${activeGame.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "open" }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBackupSaves = async () => {
    try {
      setSaveBackupStatus("A criar backup...");
      const res = await fetch(`/api/games/${activeGame.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "backup" }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        setSaveBackupStatus(null);
      } else {
        setSaveBackupStatus("Backup criado!");
        setTimeout(() => setSaveBackupStatus(null), 3000);
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
      setSaveBackupStatus(null);
    }
  };

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateCheckMsg(null);
    try {
      const res = await fetch(`/api/games/${activeGame.id}/check-update`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao verificar atualizações.");

      if (data.game) {
        setLocalGame(data.game);
        onGameUpdated?.(data.game);
      }
      setUpdateCheckMsg(data.message || "Verificação concluída!");
    } catch (err: any) {
      setUpdateCheckMsg(err.message || "Erro ao verificar atualizações.");
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleMarkAsUpdated = async () => {
    try {
      const now = new Date().toISOString();
      const res = await fetch(`/api/games/${activeGame.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isUpToDate: true,
          versionDate: now,
          gameVersion: activeGame.latestKnownVersion || activeGame.gameVersion,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLocalGame(updated);
        onGameUpdated?.(updated);
        setUpdateCheckMsg("✅ Jogo marcado como em dia!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const daysSinceUpdate = currentTimestamp
    ? activeGame.latestVersionDate
      ? Math.max(0, Math.floor((currentTimestamp - new Date(activeGame.latestVersionDate).getTime()) / (1000 * 60 * 60 * 24)))
      : activeGame.versionDate
      ? Math.max(0, Math.floor((currentTimestamp - new Date(activeGame.versionDate).getTime()) / (1000 * 60 * 60 * 24)))
      : null
    : null;

  const tagList = activeGame.tags
    ? activeGame.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Banner Hero */}
        <div className="relative h-48 sm:h-64 w-full bg-zinc-950 overflow-hidden">
          {activeGame.bannerUrl || activeGame.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeGame.bannerUrl || activeGame.coverUrl || ""}
              alt={activeGame.title}
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-950 via-zinc-900 to-zinc-950" />
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-black/60" />

          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white backdrop-blur-md transition-colors absolute top-4 right-4 cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 -mt-24 sm:-mt-32 relative z-10">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Box Art Poster */}
            <div className="w-36 sm:w-44 aspect-[2/3] bg-zinc-950 rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-2xl flex-shrink-0">
              {activeGame.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeGame.coverUrl}
                  alt={activeGame.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-3xl">
                  🎮
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0 pt-2 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <OriginBadge
                  originType={activeGame.originType}
                  repackGroup={activeGame.repackGroup}
                />
                <StatusBadge status={activeGame.status} />
                <ArchiveBadge
                  isArchived={Boolean(activeGame.isArchived)}
                  interactive={Boolean(onToggleArchive)}
                  onClick={() => onToggleArchive?.(activeGame)}
                />
                <GameFeaturesBadges
                  hasSavefile={activeGame.hasSavefile}
                  hasAchievements={activeGame.hasAchievements}
                  isPlatinum={activeGame.isPlatinum || activeGame.status === "PLATINUM"}
                  interactive={Boolean(onToggleSavefile || onToggleAchievements || onTogglePlatinum)}
                  onToggleSavefile={() => onToggleSavefile?.(activeGame)}
                  onToggleAchievements={() => onToggleAchievements?.(activeGame)}
                  onTogglePlatinum={() => onTogglePlatinum?.(activeGame)}
                />
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {activeGame.platform}
                </span>

                {activeGame.gameVersion && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-purple-950/50 text-purple-300 border border-purple-500/30">
                    📦 {activeGame.gameVersion}
                  </span>
                )}

                {activeGame.isUpToDate === false && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    🟡 Update Disponível
                  </span>
                )}

                {activeGame.diskSpace && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-800/80 text-zinc-400 border border-zinc-700">
                    💾 {activeGame.diskSpace}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeGame.title}
              </h1>

              {/* Subtitle / Meta */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                {activeGame.releaseYear && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Lançamento: {activeGame.releaseYear}</span>
                  </div>
                )}
                {activeGame.genres && (
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{activeGame.genres}</span>
                  </div>
                )}
              </div>

              {/* Tags Badges */}
              {tagList.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Tag className="w-3 h-3 text-zinc-500 mr-0.5" />
                  {tagList.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-950/40 text-indigo-300 border border-indigo-500/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Custom Categories Badges */}
              {activeGame.customCategories && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <FolderOpen className="w-3 h-3 text-indigo-400 mr-0.5" />
                  {activeGame.customCategories
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean)
                    .map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-600/20 text-indigo-200 border border-indigo-500/40"
                      >
                        📁 {cat}
                      </span>
                    ))}
                </div>
              )}

              {/* Score, Hours & Launch */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {activeGame.rating && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{activeGame.rating} / 10</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-sm font-mono">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span>{activeGame.hoursPlayed}h jogadas</span>
                </div>

                {activeGame.timeToBeat && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                    <Hourglass className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Duração: {activeGame.timeToBeat}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Status Bar */}
          <div className="mt-6 p-3 bg-zinc-950/60 border border-zinc-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-zinc-400">Alterar estado rápido:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: "AVAILABLE", label: "Disponível" },
                { key: "BACKLOG", label: "Backlog" },
                { key: "PLAYING", label: "A Jogar" },
                { key: "COMPLETED", label: "Concluído" },
                { key: "PLATINUM", label: "Platinado" },
                { key: "PAUSED", label: "Em Pausa" },
                { key: "NOT_STARTED", label: "Não Iniciado" },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => onUpdateStatus(activeGame, s.key)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeGame.status === s.key
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Storage & Saves Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Storage Box */}
            <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-indigo-400" />
                  Instalação no Computador
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    activeGame.isInstalled
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {activeGame.isInstalled ? "Instalado" : "Não Instalado"}
                </span>
              </div>

              <div className="text-xs text-zinc-400 mt-2">
                <span className="text-zinc-500 block mb-0.5">Pasta do Jogo:</span>
                <div className="p-2.5 bg-zinc-900/90 rounded-xl font-mono text-[11px] text-zinc-200 border border-zinc-800 flex items-center gap-2 break-all">
                  <FolderOpen className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                  <span>{activeGame.storageLocation || "Não especificado"}</span>
                </div>
              </div>
            </div>

            {/* Savegame Manager Box */}
            <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Save className="w-4 h-4 text-emerald-400" />
                  Gestor de Saves (Savegames)
                </span>
                {saveBackupStatus && (
                  <span className="text-[11px] text-emerald-400 font-semibold animate-pulse">
                    {saveBackupStatus}
                  </span>
                )}
              </div>

              <div className="text-xs text-zinc-400 mt-2">
                <span className="text-zinc-500 block mb-0.5">Local dos Saves:</span>
                <div className="p-2.5 bg-zinc-900/90 rounded-xl font-mono text-[11px] text-zinc-200 border border-zinc-800 flex items-center gap-2 break-all">
                  <FolderArchive className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{activeGame.saveLocation || "Não configurado (ex: %APPDATA%\\...)"}</span>
                </div>
              </div>

              {activeGame.saveLocation && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenSaves}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    Abrir Pasta de Saves
                  </button>
                  <button
                    type="button"
                    onClick={handleBackupSaves}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Criar Backup do Save
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Version & Patch Status Box */}
          <div className="mt-4 p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-purple-400" />
                <span>Versão do Jogo & Estado de Atualizações</span>
              </span>

              {/* Status Pill */}
              {activeGame.isUpToDate === true ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Em Dia</span>
                </span>
              ) : activeGame.isUpToDate === false ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  <span>Atualização Disponível</span>
                </span>
              ) : daysSinceUpdate !== null && daysSinceUpdate >= 365 ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1">
                  <span>💤 Jogo Estável (&gt; 1 ano sem patches)</span>
                </span>
              ) : null}
            </div>

            {/* Highlighted Update Status Banner */}
            {activeGame.latestVersionDate ? (
              <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                activeGame.isUpToDate === false
                  ? "bg-amber-950/40 border-amber-500/50 text-amber-200"
                  : daysSinceUpdate !== null && daysSinceUpdate >= 365
                  ? "bg-indigo-950/40 border-indigo-500/40 text-indigo-200"
                  : "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl shrink-0">
                    {activeGame.isUpToDate === false ? "⚠️" : daysSinceUpdate !== null && daysSinceUpdate >= 365 ? "💤" : "✅"}
                  </span>
                  <div>
                    <span className="font-bold block text-white">
                      {activeGame.isUpToDate === false
                        ? "Atualização Mais Recente Disponível!"
                        : daysSinceUpdate !== null && daysSinceUpdate >= 365
                        ? "Jogo Estável & Finalizado"
                        : "Jogo em Dia"}
                    </span>
                    <span className="text-[11px] opacity-90 block">
                      {daysSinceUpdate !== null && daysSinceUpdate < 7
                        ? `Novo patch oficial lançado há ${daysSinceUpdate} dias (${new Date(activeGame.latestVersionDate).toLocaleDateString("pt-PT")}).`
                        : daysSinceUpdate !== null && daysSinceUpdate >= 365
                        ? `Último patch oficial lançado há ${Math.floor(daysSinceUpdate / 365)} ano(s) (${new Date(activeGame.latestVersionDate).toLocaleDateString("pt-PT")}). Sem novos updates previstos — ideal para jogar sem quebra de mods ou saves.`
                        : daysSinceUpdate !== null
                        ? `Último update oficial: há ${Math.floor(daysSinceUpdate / 30) || 1} mês(es) (${new Date(activeGame.latestVersionDate).toLocaleDateString("pt-PT")}).`
                        : `Data do último patch: ${new Date(activeGame.latestVersionDate).toLocaleDateString("pt-PT")}.`}
                    </span>
                  </div>
                </div>

                {activeGame.latestPatchNotesUrl && (
                  <a
                    href={activeGame.latestPatchNotesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-black/40 hover:bg-black/70 border border-white/10 text-white font-semibold text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <span>Notas do Patch</span>
                    <ExternalLink className="w-3 h-3 text-sky-400" />
                  </a>
                )}
              </div>
            ) : (
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-400 flex flex-wrap items-center justify-between gap-2">
                <span>💡 Ainda não verificaste updates oficiais da Steam para este jogo.</span>
                <span className="text-[11px] text-purple-300 font-semibold">Clica em "Verificar Atualizações na Steam" abaixo ↘</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Installed Version */}
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Versão do Jogo:</span>
                <div className="font-mono text-sm font-bold text-white flex items-center gap-2">
                  <span>{activeGame.gameVersion || "Não especificada"}</span>
                </div>
                {activeGame.versionDate ? (
                  <span className="text-[11px] text-zinc-400 block">
                    Data: {new Date(activeGame.versionDate).toLocaleDateString("pt-PT")}
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-600 block italic">Podes editar para indicar a versão/patch</span>
                )}
              </div>

              {/* Latest Known Patch */}
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Último Patch Oficial:</span>
                <div className="text-xs font-semibold text-zinc-200 truncate" title={activeGame.latestPatchTitle || ""}>
                  {activeGame.latestPatchTitle || activeGame.latestKnownVersion || "Ainda não verificado"}
                </div>
                {activeGame.latestVersionDate ? (
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
                    <span>
                      {new Date(activeGame.latestVersionDate).toLocaleDateString("pt-PT")}
                      {daysSinceUpdate !== null && (
                        <strong className="text-purple-300 ml-1">
                          (há {daysSinceUpdate < 30 ? `${daysSinceUpdate} dias` : daysSinceUpdate < 365 ? `${Math.floor(daysSinceUpdate / 30)} meses` : `${Math.floor(daysSinceUpdate / 365)} anos`})
                        </strong>
                      )}
                    </span>
                    {activeGame.latestPatchNotesUrl && (
                      <a
                        href={activeGame.latestPatchNotesUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:text-sky-300 font-semibold underline flex items-center gap-1"
                        title="Abrir Patch Notes oficiais"
                      >
                        <span>Patch Notes</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-zinc-500">Clica em "Verificar Atualizações" para procurar</span>
                )}
              </div>
            </div>

            {/* Actions for checking / marking */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/80">
              <span className="text-[11px] text-zinc-400 flex-1 min-w-[200px]">
                {updateCheckMsg || (daysSinceUpdate !== null && daysSinceUpdate >= 365 ? "Este jogo não recebe updates há mais de 1 ano. Ciclo de desenvolvimento estável." : "Pesquisa se os desenvolvedores lançaram patches mais recentes na Steam.")}
              </span>

              <div className="flex items-center gap-2">
                {activeGame.isUpToDate === false && (
                  <button
                    type="button"
                    onClick={handleMarkAsUpdated}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Marcar como Atualizado</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={isCheckingUpdate}
                  onClick={handleCheckUpdate}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isCheckingUpdate ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>A verificar Steam...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                      <span>Verificar Atualizações na Steam</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* PC Requirements if available */}
          {activeGame.pcRequirements && (
            <div className="mt-4 p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-2">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Requisitos de Sistema & Espaço Necessário:
              </span>
              <div className="p-3 bg-zinc-900/90 rounded-xl text-xs font-mono text-zinc-400 whitespace-pre-wrap leading-relaxed border border-zinc-800">
                {activeGame.pcRequirements}
              </div>
            </div>
          )}

          {/* Notes & Patches Box */}
          {activeGame.installNotes && (
            <div className="mt-4 p-4 bg-zinc-950/80 border border-amber-500/20 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  📝 Notas de Instalação, Crack, Fixes & Modding:
                </span>
                <button
                  type="button"
                  onClick={copyNotesToClipboard}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
                >
                  {copiedNotes ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar notas</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-zinc-900/90 rounded-xl text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed border border-zinc-800">
                {activeGame.installNotes}
              </div>
            </div>
          )}

          {/* User Review / Mini-Review Box */}
          {activeGame.userReview && (
            <div className="mt-4 p-4 bg-zinc-950/80 border border-indigo-500/30 rounded-2xl space-y-2">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                💬 Análise & Opinião Pessoal:
              </span>
              <div className="p-3 bg-zinc-900/90 rounded-xl text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed border border-zinc-800">
                {activeGame.userReview}
              </div>
            </div>
          )}

          {/* Screenshots Gallery if available */}
          {activeGame.screenshots && (
            <div className="mt-4 p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-2">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                📸 Screenshots & Momentos:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {activeGame.screenshots
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-indigo-500 transition-colors block group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Screenshot ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Tens a certeza que queres eliminar "${activeGame.title}" da coleção?`)) {
                  onDelete(activeGame);
                  onClose();
                }
              }}
              className="px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar Jogo
            </button>

            <div className="flex items-center gap-2">
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite(activeGame)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeGame.isFavorite
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 shadow-md shadow-amber-500/10"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  }`}
                  title="Destaque no Hall of Fame"
                >
                  <Star className={`w-3.5 h-3.5 ${activeGame.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                  <span>{activeGame.isFavorite ? "Hall of Fame ⭐" : "Destacar"}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onEdit(activeGame);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Editar Dados
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
