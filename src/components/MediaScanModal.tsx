"use client";

import React, { useState } from "react";
import { MediaType, getMediaTypeBadge, MEDIA_CATEGORIES } from "@/types/media";
import {
  X,
  FolderSearch,
  Check,
  Loader2,
  HardDrive,
  Film,
  Tv,
  Sparkles,
  Layers,
  AlertCircle,
} from "lucide-react";

interface MediaScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => Promise<void>;
}

export function MediaScanModal({
  isOpen,
  onClose,
  onImportSuccess,
}: MediaScanModalProps) {
  const [folderPath, setFolderPath] = useState("");
  const [defaultType, setDefaultType] = useState<MediaType>("MOVIE");
  const [isScanning, setIsScanning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scannedItems, setScannedItems] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleScan = async () => {
    if (!folderPath.trim()) return;
    setIsScanning(true);
    setErrorMsg(null);
    setScannedItems([]);
    setSelectedIds([]);

    try {
      const res = await fetch("/api/media/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderPath: folderPath.trim(),
          defaultType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao escanear pasta.");

      if (data.items.length === 0) {
        setErrorMsg("Nenhum ficheiro de vídeo ou pasta encontrado no caminho indicado.");
      } else {
        setScannedItems(data.items);
        setSelectedIds(data.items.map((it: any) => it.id));
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao comunicar com o sistema.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === scannedItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(scannedItems.map((it) => it.id));
    }
  };

  const handleBulkImport = async () => {
    const itemsToImport = scannedItems.filter((it) => selectedIds.includes(it.id));
    if (itemsToImport.length === 0) return;

    setIsImporting(true);
    try {
      const res = await fetch("/api/media/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToImport }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na importação.");

      await onImportSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao importar títulos.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <FolderSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Scanner Automático de Vídeos & Pastas (PC / NAS)
              </h3>
              <p className="text-xs text-zinc-400">
                Lê os ficheiros e pastas do teu disco, limpa nomes e obtém capas automaticamente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Controls */}
        <div className="p-6 pb-4 space-y-4 shrink-0 bg-zinc-950/40 border-b border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Folder Path */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                <span>Caminho da Pasta no Computador / NAS</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: D:\Filmes, E:\Series, D:\Filmes Portugueses..."
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  disabled={isScanning || !folderPath.trim()}
                  onClick={handleScan}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>A Analisar...</span>
                    </>
                  ) : (
                    <>
                      <FolderSearch className="w-4 h-4" />
                      <span>Analisar Pasta</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Default Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Categoria de Destino</label>
              <select
                value={defaultType}
                onChange={(e) => setDefaultType(e.target.value as MediaType)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="MOVIE">🎬 Filmes</option>
                <option value="SERIES">📺 Séries</option>
                <option value="ANIMATION_MOVIE">🎨 Filmes Animação</option>
                <option value="CARTOON">🧸 Desenhos Animados</option>
                <option value="PT_MOVIE">🇵🇹 Filmes Portugueses</option>
                <option value="PT_SERIES">🇵🇹 Séries Portuguesas</option>
                <option value="ANIME">🎌 Animes</option>
              </select>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
            <span className="text-zinc-500">Exemplos rápidos:</span>
            {["D:\\Filmes", "D:\\Series", "E:\\Filmes", "D:\\Desenhos Animados"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setFolderPath(p)}
                className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {scannedItems.length > 0 && (
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedIds.length === scannedItems.length && scannedItems.length > 0}
                  onChange={handleSelectAll}
                  className="rounded accent-purple-500 cursor-pointer"
                />
                <label htmlFor="select-all" className="font-semibold text-zinc-300 cursor-pointer">
                  Selecionar Todos ({selectedIds.length} de {scannedItems.length})
                </label>
              </div>
              <span className="text-zinc-500">Clica em qualquer item para editar ou desmarcar</span>
            </div>
          )}

          {scannedItems.length === 0 && !isScanning && !errorMsg && (
            <div className="py-20 text-center flex flex-col items-center justify-center text-zinc-500 gap-2">
              <FolderSearch className="w-12 h-12 text-zinc-600" />
              <p className="text-sm font-medium text-zinc-400">
                Insere a pasta onde tens os teus filmes ou séries e clica em "Analisar Pasta".
              </p>
              <p className="text-xs text-zinc-600 max-w-sm">
                O analisador remove tags de releases (1080p, x264, etc.), deteta o ano e pesquisa automaticamente as capas oficiais.
              </p>
            </div>
          )}

          {isScanning && (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <p className="text-sm">A analisar ficheiros e a obter capas online...</p>
            </div>
          )}

          {scannedItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const badge = getMediaTypeBadge(item.type);

            return (
              <div
                key={item.id}
                onClick={() => handleToggleSelect(item.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                  isSelected
                    ? "bg-purple-950/30 border-purple-500/50 shadow-md"
                    : "bg-zinc-950/60 hover:bg-zinc-900 border-zinc-800 opacity-60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleSelect(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded accent-purple-500 cursor-pointer"
                />

                {/* Poster */}
                <div className="w-10 h-14 bg-zinc-950 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                  {item.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">🎬</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm truncate">{item.title}</span>
                    {item.releaseYear && (
                      <span className="text-xs text-zinc-400 font-mono">({item.releaseYear})</span>
                    )}
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${badge.color}`}>
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>
                    <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-zinc-800 text-amber-300">
                      {item.quality}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-500 font-mono truncate mt-0.5" title={item.storageLocation}>
                    {item.storageLocation}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-950/90 border-t border-zinc-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-400">
            {scannedItems.length > 0 && `${selectedIds.length} títulos selecionados para importação`}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isImporting || selectedIds.length === 0}
              onClick={handleBulkImport}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A Importar...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Importar {selectedIds.length} Títulos</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
