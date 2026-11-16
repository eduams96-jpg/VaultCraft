"use client";

import React, { useState } from "react";
import {
  X,
  FolderSearch,
  Loader2,
  Check,
  HardDrive,
  Gamepad2,
  ExternalLink,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react";
import type { ScannedGameCandidate } from "@/app/api/games/scan/route";
import { playUiSound } from "@/lib/ui-sfx";

interface GameScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export function GameScanModal({
  isOpen,
  onClose,
  onImportSuccess,
}: GameScanModalProps) {
  const [folderPath, setFolderPath] = useState("D:\\Jogos");
  const [defaultPlatform, setDefaultPlatform] = useState("PC");
  const [defaultOrigin, setDefaultOrigin] = useState("REPACK");
  const [defaultStatus, setDefaultStatus] = useState("AVAILABLE");
  const [markInstalled, setMarkInstalled] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [items, setItems] = useState<ScannedGameCandidate[]>([]);
  const [selectedSet, setSelectedSet] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderPath.trim()) return;

    setIsScanning(true);
    setErrorMsg(null);
    setItems([]);
    setSelectedSet(new Set());

    try {
      const res = await fetch("/api/games/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderPath: folderPath.trim(),
          defaultPlatform,
          defaultOrigin,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao escanear pasta de jogos.");
      }

      const scanned: ScannedGameCandidate[] = data.items || [];
      setItems(scanned);

      const initialSelected = new Set<number>();
      scanned.forEach((it, idx) => {
        if (!it.alreadyInVault) initialSelected.add(idx);
      });
      setSelectedSet(initialSelected);
      playUiSound("switch");
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro ao ler pasta.");
    } finally {
      setIsScanning(false);
    }
  };

  const toggleIndex = (idx: number) => {
    playUiSound("toggle");
    setSelectedSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleAllNew = () => {
    playUiSound("toggle");
    const newIndices = items
      .map((it, idx) => (!it.alreadyInVault ? idx : -1))
      .filter((idx) => idx >= 0);

    const allSelected = newIndices.every((idx) => selectedSet.has(idx));
    if (allSelected) {
      setSelectedSet(new Set());
    } else {
      setSelectedSet(new Set(newIndices));
    }
  };

  const updateItemField = (
    idx: number,
    field: keyof ScannedGameCandidate,
    value: any
  ) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it))
    );
  };

  const handleImportSelected = async () => {
    const selectedItems = items.filter((_, idx) => selectedSet.has(idx));
    if (selectedItems.length === 0) return;

    setIsImporting(true);
    setErrorMsg(null);
    try {
      const payloadItems = selectedItems.map((it) => ({
        finalTitle: it.cleanTitle,
        platform: it.platform || defaultPlatform,
        originType: it.originType || defaultOrigin,
        repackGroup: it.repackGroup,
        status: defaultStatus,
        coverUrl: it.coverUrl,
        bannerUrl: it.bannerUrl,
        releaseYear: it.releaseYear,
        genres: it.genres,
        storageLocation: it.fullPath,
        executablePath: it.executablePath,
        gameVersion: it.gameVersion,
        diskSpace: it.diskSpace,
        externalLink: it.externalLink,
        isInstalled: markInstalled,
      }));

      const res = await fetch("/api/batch-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          items: payloadItems,
          platform: defaultPlatform,
          originType: defaultOrigin,
          status: defaultStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao importar jogos.");
      }

      playUiSound("platinum");
      onImportSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro ao guardar jogos.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderSearch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                Scanner de Pasta de Jogos (PC / NAS / Repacks / ROMs)
              </h2>
              <p className="text-[11px] text-zinc-400">
                Deteta subpastas, executáveis (.exe), ROMs, tamanho em disco, grupo de Repack e capas da Steam automaticamente
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Scan Configuration Form */}
          <form onSubmit={handleScan} className="space-y-3 bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Caminho da Pasta no Computador ou NAS:
                </label>
                <input
                  type="text"
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  placeholder="Ex: D:\Jogos ou \\NAS\Jogos\Repacks"
                  className="w-full h-9 px-3.5 bg-zinc-900 border border-zinc-700 focus:border-indigo-500 rounded-xl text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <div className="sm:w-40">
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Plataforma Padrão:
                </label>
                <select
                  value={defaultPlatform}
                  onChange={(e) => setDefaultPlatform(e.target.value)}
                  className="w-full h-9 px-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="PC">PC</option>
                  <option value="Steam Deck">Steam Deck</option>
                  <option value="PlayStation 5">PlayStation 5</option>
                  <option value="PlayStation 4">PlayStation 4</option>
                  <option value="PlayStation 3">PlayStation 3</option>
                  <option value="PlayStation 2">PlayStation 2</option>
                  <option value="Nintendo Switch">Nintendo Switch</option>
                </select>
              </div>

              <div className="sm:w-40">
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Origem Padrão:
                </label>
                <select
                  value={defaultOrigin}
                  onChange={(e) => setDefaultOrigin(e.target.value)}
                  className="w-full h-9 px-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="REPACK">Repack / Pirata</option>
                  <option value="STEAM">Steam</option>
                  <option value="GOG">GOG (DRM-Free)</option>
                  <option value="EPIC">Epic Games</option>
                  <option value="EMULATOR">ROM / Emulador</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isScanning || !folderPath.trim()}
                  className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>A Escanear...</span>
                    </>
                  ) : (
                    <>
                      <FolderSearch className="w-4 h-4" />
                      <span>Escanear Pasta</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Path Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-zinc-500">Atalhos rápidos:</span>
              {["D:\\Jogos", "C:\\Games", "D:\\Repacks", "D:\\ROMs"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFolderPath(preset)}
                  className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 font-mono transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </form>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Scanned Results List */}
          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950/60 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleAllNew}
                    className="flex items-center gap-1.5 text-indigo-300 hover:text-white font-semibold cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Alternar Novos</span>
                  </button>
                  <span className="text-zinc-400">
                    Encontrados: <strong className="text-white">{items.length}</strong> • Selecionados:{" "}
                    <strong className="text-indigo-400">{selectedSet.size}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={markInstalled}
                      onChange={(e) => setMarkInstalled(e.target.checked)}
                      className="rounded bg-zinc-900 border-zinc-700 text-indigo-600"
                    />
                    <span>Marcar como Instalado</span>
                  </label>

                  <select
                    value={defaultStatus}
                    onChange={(e) => setDefaultStatus(e.target.value)}
                    className="h-7 px-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200"
                  >
                    <option value="AVAILABLE">Estado: Disponível</option>
                    <option value="BACKLOG">Estado: Backlog</option>
                    <option value="PLAYING">Estado: A Jogar</option>
                    <option value="COMPLETED">Estado: Concluído</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
                {items.map((item, idx) => {
                  const isSelected = selectedSet.has(idx);
                  return (
                    <div
                      key={item.fullPath}
                      className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                        item.alreadyInVault
                          ? "bg-zinc-950/40 border-zinc-800/60 opacity-60"
                          : isSelected
                          ? "bg-indigo-950/20 border-indigo-500/40"
                          : "bg-zinc-950/60 border-zinc-800"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleIndex(idx)}
                        className="text-indigo-400 hover:text-indigo-300 cursor-pointer shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 fill-indigo-600 text-white" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-600" />
                        )}
                      </button>

                      {/* Mini Cover */}
                      <div className="w-10 h-14 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 case-poster">
                        {item.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.coverUrl}
                            alt={item.cleanTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Gamepad2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Editable Title & Detected Metadata */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.cleanTitle}
                            onChange={(e) => updateItemField(idx, "cleanTitle", e.target.value)}
                            className="flex-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs font-bold text-white focus:outline-none"
                          />
                          {item.alreadyInVault && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                              Já na coleção
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 font-mono">
                          <span className="truncate max-w-[260px]" title={item.fullPath}>
                            {item.folderName}
                          </span>
                          {item.diskSpace && (
                            <span className="px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-emerald-300">
                              {item.diskSpace}
                            </span>
                          )}
                          {item.repackGroup && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
                              {item.repackGroup}
                            </span>
                          )}
                          {item.gameVersion && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300">
                              {item.gameVersion}
                            </span>
                          )}
                          {item.executablePath && (
                            <span
                              className="px-1.5 py-0.2 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 truncate max-w-[160px]"
                              title={item.executablePath}
                            >
                              .exe detetado ✓
                            </span>
                          )}
                          {item.externalLink && (
                            <a
                              href={item.externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-0.5"
                              title="Link oficial Steam detetado"
                            >
                              <span>Steam</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isImporting || selectedSet.size === 0}
                  onClick={handleImportSelected}
                  className="h-9 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>A Importar...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Importar {selectedSet.size} Jogos Selecionados</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
