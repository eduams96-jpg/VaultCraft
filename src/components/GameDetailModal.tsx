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
  Link2,
  Play,
  Gamepad2,
  RotateCcw,
  History,
} from "lucide-react";
import { playUiSound } from "@/lib/ui-sfx";
import { requestGameLaunch } from "@/lib/game-actions";

interface SaveBackupSnapshot {
  name: string;
  createdAt: string;
  sizeKB: number;
  filesCount: number;
}

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
  const [linkInput, setLinkInput] = useState("");
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [isSavingLink, setIsSavingLink] = useState(false);
  const [saveBackups, setSaveBackups] = useState<SaveBackupSnapshot[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [restoringBackupName, setRestoringBackupName] = useState<string | null>(null);
  const [saveLocationInput, setSaveLocationInput] = useState("");
  const [isEditingSaveLoc, setIsEditingSaveLoc] = useState(false);
  const [isSavingSaveLoc, setIsSavingSaveLoc] = useState(false);
  const [isRescanningGameDisk, setIsRescanningGameDisk] = useState(false);
  const [diskRescanFeedback, setDiskRescanFeedback] = useState<string | null>(null);

  useEffect(() => {
    setCurrentTimestamp(Date.now());
  }, []);

  const gameId = game?.id ?? null;
  const gameTitle = game?.title ?? null;
  const gameExternalLink = game?.externalLink || "";
  const gameSaveLocation = game?.saveLocation || "";

  // Mantém a cópia local alinhada com o objeto do pai (toggles, edições, etc.)
  useEffect(() => {
    setLocalGame(game);
  }, [game]);

  // As mensagens de feedback só são limpas ao abrir OUTRO jogo. Antes eram limpas em cada
  // atualização do mesmo jogo, pelo que o resultado de "verificar atualizações" /
  // "verificar disco" desaparecia no mesmo instante em que era mostrado.
  useEffect(() => {
    setUpdateCheckMsg(null);
    setDiskRescanFeedback(null);
  }, [gameId]);

  useEffect(() => {
    setLinkInput(gameExternalLink);
    setIsEditingLink(!gameExternalLink);
  }, [gameId, gameExternalLink]);

  useEffect(() => {
    setSaveLocationInput(gameSaveLocation);
    setIsEditingSaveLoc(false);
  }, [gameId, gameSaveLocation]);

  // Lista de backups de saves: só recarrega quando muda o jogo (ou o título, que dá nome
  // às pastas de backup) e ignora respostas atrasadas de um jogo aberto anteriormente.
  useEffect(() => {
    if (!gameId) {
      setSaveBackups([]);
      return;
    }

    let cancelled = false;
    setIsLoadingBackups(true);
    fetch(`/api/games/${gameId}/save`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        setSaveBackups(data && Array.isArray(data.backups) ? data.backups : []);
      })
      .catch(() => {
        if (!cancelled) setSaveBackups([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBackups(false);
      });

    return () => {
      cancelled = true;
    };
  }, [gameId, gameTitle]);

  if (!game) return null;

  const activeGame = localGame || game;

  const copyNotesToClipboard = () => {
    if (activeGame.installNotes) {
      navigator.clipboard.writeText(activeGame.installNotes);
      setCopiedNotes(true);
      setTimeout(() => setCopiedNotes(false), 2000);
    }
  };

  const handleRescanGameDisk = async () => {
    if (!activeGame.executablePath && !activeGame.storageLocation) return;
    setIsRescanningGameDisk(true);
    setDiskRescanFeedback(null);
    playUiSound("click");
    try {
      const res = await fetch("/api/games/rescan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeGame.id }),
      });
      const data = await res.json();
      if (res.ok && data.game) {
        setLocalGame(data.game);
        onGameUpdated?.(data.game);
        setDiskRescanFeedback(data.message || "Disco verificado!");
        playUiSound("success");
      } else {
        setDiskRescanFeedback(data.error || "Não foi possível verificar o disco.");
      }
    } catch {
      setDiskRescanFeedback("Erro ao verificar caminho no disco.");
    } finally {
      setIsRescanningGameDisk(false);
    }
  };

  const handleOpenSaves = async () => {
    playUiSound("open");
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
      playUiSound("click");
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
        if (Array.isArray(data.backups)) {
          setSaveBackups(data.backups);
        }
        if (data.updatedGame) {
          setLocalGame(data.updatedGame);
          onGameUpdated?.(data.updatedGame);
        }
        playUiSound("success");
        setSaveBackupStatus("Backup guardado no Cofre!");
        setTimeout(() => setSaveBackupStatus(null), 3500);
      }
    } catch (e) {
      console.error(e);
      setSaveBackupStatus(null);
    }
  };

  const handleRestoreSaveBackup = async (backupName: string) => {
    if (
      !confirm(
        `Restaurar o savegame "${backupName}"?\n\nIsto irá copiar os ficheiros deste snapshot de volta para a pasta de saves do jogo (${activeGame.saveLocation}). Os saves atuais são guardados primeiro num snapshot de segurança.`
      )
    ) {
      return;
    }

    setRestoringBackupName(backupName);
    setSaveBackupStatus("A restaurar save...");
    try {
      const res = await fetch(`/api/games/${activeGame.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", backupName }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao restaurar savegame.");
        setSaveBackupStatus(null);
      } else {
        if (Array.isArray(data.backups)) {
          setSaveBackups(data.backups);
        }
        playUiSound("success");
        setSaveBackupStatus("Save restaurado com sucesso!");
        setTimeout(() => setSaveBackupStatus(null), 3500);
      }
    } catch {
      setSaveBackupStatus(null);
    } finally {
      setRestoringBackupName(null);
    }
  };

  const handleOpenBackupFolder = async (backupName?: string) => {
    playUiSound("open");
    try {
      await fetch(`/api/games/${activeGame.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "openBackup", backupName }),
      });
    } catch {}
  };

  const handleDeleteSaveBackup = async (backupName: string) => {
    if (!confirm(`Remover o backup "${backupName}" do cofre?`)) return;
    try {
      const res = await fetch(`/api/games/${activeGame.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteBackup", backupName }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.backups)) {
        setSaveBackups(data.backups);
        playUiSound("click");
      }
    } catch {}
  };

  const handleSaveSaveLocation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSaveLoc(true);
    try {
      const res = await fetch(`/api/games/${activeGame.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saveLocation: saveLocationInput.trim() || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLocalGame(updated);
        onGameUpdated?.(updated);
        setIsEditingSaveLoc(false);
        playUiSound("success");
      }
    } catch {}
    setIsSavingSaveLoc(false);
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

  const handleSaveExternalLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = linkInput.trim();
    setIsSavingLink(true);
    try {
      const res = await fetch(`/api/games/${activeGame.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalLink: trimmed || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLocalGame(updated);
        onGameUpdated?.(updated);
        setLinkInput(updated.externalLink || "");
        setIsEditingLink(!updated.externalLink);
      }
    } catch (err) {
      console.error("Erro ao guardar link:", err);
    } finally {
      setIsSavingLink(false);
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
            <div className="case-poster w-36 sm:w-44 aspect-[2/3] bg-zinc-950 rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-2xl flex-shrink-0">
              {activeGame.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeGame.coverUrl}
                  alt={activeGame.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-indigo-400">
                  <Gamepad2 className="w-10 h-10" />
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

          {/* External Link Bar (Editable right inside Game Profile) */}
          <div className="mt-4 p-3.5 bg-zinc-950/60 border border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Link do Jogo (Steam, Repack, Site Oficial, Wiki)</span>
              </span>
              {activeGame.externalLink && !isEditingLink && (
                <button
                  type="button"
                  onClick={() => {
                    setLinkInput(activeGame.externalLink || "");
                    setIsEditingLink(true);
                  }}
                  className="text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3 h-3" />
                  <span>Alterar</span>
                </button>
              )}
            </div>

            {isEditingLink || !activeGame.externalLink ? (
              <form onSubmit={handleSaveExternalLink} className="flex items-center gap-2">
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="https://store.steampowered.com/app/... ou link direto do release"
                  className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-700 focus:border-sky-500 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  disabled={isSavingLink}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isSavingLink ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Guardar Link</span>
                </button>
                {activeGame.externalLink && (
                  <button
                    type="button"
                    onClick={() => {
                      setLinkInput(activeGame.externalLink || "");
                      setIsEditingLink(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2">
                <span className="text-xs font-mono text-zinc-300 truncate flex-1">
                  {activeGame.externalLink}
                </span>
                <a
                  href={activeGame.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600/35 border border-sky-500/40 text-sky-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <span>Abrir Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Detailed Storage & Saves Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Storage Box */}
            <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between gap-2">
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

              <div className="text-xs text-zinc-400">
                <span className="text-zinc-500 block mb-0.5">Pasta / Executável:</span>
                <div className="p-2.5 bg-zinc-900/90 rounded-xl font-mono text-[11px] text-zinc-200 border border-zinc-800 flex items-center gap-2 break-all">
                  <FolderOpen className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                  <span>{activeGame.executablePath || activeGame.storageLocation || "Não especificado"}</span>
                </div>
              </div>

              {(activeGame.executablePath || activeGame.storageLocation) && (
                <div className="space-y-2 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        playUiSound("launch");
                        await requestGameLaunch(activeGame.id, "launch");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-200 text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-emerald-300" />
                      <span>Jogar Agora</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        playUiSound("open");
                        await requestGameLaunch(activeGame.id, "open");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Abrir Pasta</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRescanGameDisk}
                      disabled={isRescanningGameDisk}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/40 text-indigo-200 text-[11px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Verificar no disco se o jogo e o executável estão presentes"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-indigo-300 ${isRescanningGameDisk ? "animate-spin" : ""}`} />
                      <span>{isRescanningGameDisk ? "A verificar..." : "Re-verificar Disco"}</span>
                    </button>
                  </div>
                  {diskRescanFeedback && (
                    <div className="px-2.5 py-1.5 rounded-lg bg-indigo-950/50 border border-indigo-500/30 text-[11px] text-indigo-200 font-mono">
                      {diskRescanFeedback}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Savegame Manager Box (Cofre Real de Savegames) */}
            <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>Cofre de Savegames</span>
                  {saveBackups.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {saveBackups.length} snapshot{saveBackups.length > 1 ? "s" : ""}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {saveBackupStatus && (
                    <span className="text-[11px] text-emerald-400 font-semibold animate-pulse">
                      {saveBackupStatus}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSaveLocationInput(activeGame.saveLocation || "");
                      setIsEditingSaveLoc((prev) => !prev);
                    }}
                    className="text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3 h-3" />
                    <span>{activeGame.saveLocation ? "Alterar Caminho" : "Configurar"}</span>
                  </button>
                </div>
              </div>

              {isEditingSaveLoc ? (
                <form onSubmit={handleSaveSaveLocation} className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={saveLocationInput}
                      onChange={(e) => setSaveLocationInput(e.target.value)}
                      placeholder="Ex: %APPDATA%\EldenRing ou C:\Users\...\Saved Games"
                      className="flex-1 px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-xl text-[11px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isSavingSaveLoc}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold cursor-pointer disabled:opacity-50"
                    >
                      {isSavingSaveLoc ? "..." : "Guardar"}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {[
                      "%APPDATA%\\",
                      "%LOCALAPPDATA%\\",
                      "%USERPROFILE%\\Saved Games\\",
                      "%USERPROFILE%\\Documents\\My Games\\",
                    ].map((tpl) => (
                      <button
                        key={tpl}
                        type="button"
                        onClick={() => setSaveLocationInput(tpl)}
                        className="px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono text-zinc-400 hover:text-zinc-200 cursor-pointer"
                      >
                        {tpl}
                      </button>
                    ))}
                  </div>
                </form>
              ) : (
                <div className="text-xs text-zinc-400">
                  <span className="text-zinc-500 block mb-0.5">Local dos Saves:</span>
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl font-mono text-[11px] text-zinc-200 border border-zinc-800 flex items-center gap-2 break-all">
                    <FolderArchive className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{activeGame.saveLocation || "Não configurado (clica em Configurar acima)"}</span>
                  </div>
                </div>
              )}

              {activeGame.saveLocation && (
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={handleOpenSaves}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Abrir Pasta</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleBackupSaves}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-200 text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Criar Backup Agora</span>
                  </button>
                </div>
              )}

              {/* Historical Save Backups Vault List */}
              {isLoadingBackups ? (
                <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 pt-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>A verificar snapshots no cofre...</span>
                </div>
              ) : saveBackups.length > 0 ? (
                <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-zinc-400 flex items-center gap-1">
                      <History className="w-3 h-3 text-emerald-400" />
                      <span>Histórico de Backups no Cofre:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenBackupFolder()}
                      className="text-[10px] text-zinc-400 hover:text-emerald-300 underline cursor-pointer"
                    >
                      Abrir Cofre Geral
                    </button>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {saveBackups.map((snap) => {
                      const d = new Date(snap.createdAt);
                      const formattedDate = `${d.toLocaleDateString("pt-PT")} ${d
                        .toLocaleTimeString("pt-PT")
                        .slice(0, 5)}`;
                      const sizeLabel =
                        snap.sizeKB >= 1024
                          ? `${(snap.sizeKB / 1024).toFixed(1)} MB`
                          : `${snap.sizeKB} KB`;

                      return (
                        <div
                          key={snap.name}
                          className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800/90 flex items-center justify-between gap-2 text-[11px]"
                        >
                          <div className="min-w-0">
                            <div className="font-mono font-bold text-zinc-200 truncate">
                              {formattedDate}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              {sizeLabel} • {snap.filesCount} fich.
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {activeGame.saveLocation && (
                              <button
                                type="button"
                                onClick={() => handleRestoreSaveBackup(snap.name)}
                                disabled={restoringBackupName === snap.name}
                                className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Restaurar este snapshot para a pasta do jogo"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Restaurar</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenBackupFolder(snap.name)}
                              className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                              title="Abrir pasta deste backup"
                            >
                              <FolderOpen className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSaveBackup(snap.name)}
                              className="p-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 cursor-pointer"
                              title="Eliminar snapshot"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
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
