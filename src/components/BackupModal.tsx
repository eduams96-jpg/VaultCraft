import React, { useState, useEffect, useCallback } from "react";
import { Download, Upload, X, Loader2, CheckCircle2, ShieldCheck, AlertCircle, History, RotateCcw } from "lucide-react";

interface SnapshotItem {
  filename: string;
  createdAt: string;
  sizeKB: number;
  reason: string;
  gamesCount: number;
  mediaCount: number;
}

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess: () => void;
}

export function BackupModal({ isOpen, onClose, onRestoreSuccess }: BackupModalProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [snapshots, setSnapshots] = useState<SnapshotItem[]>([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);
  const [restoringFilename, setRestoringFilename] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const fetchSnapshots = useCallback(async () => {
    setLoadingSnapshots(true);
    try {
      const res = await fetch("/api/backup/snapshots");
      if (res.ok) {
        const data = await res.json();
        setSnapshots(data.snapshots || []);
      }
    } catch {}
    finally {
      setLoadingSnapshots(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSnapshots();
    }
  }, [isOpen, fetchSnapshots]);

  if (!isOpen) return null;

  const handleCreateSnapshotNow = async () => {
    setCreatingSnapshot(true);
    setResultMsg(null);
    try {
      const res = await fetch("/api/backup/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", reason: "manual" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar snapshot.");
      setResultMsg({ type: "success", text: `Snapshot criado (${data.snapshot?.filename})!` });
      await fetchSnapshots();
    } catch (err: any) {
      setResultMsg({ type: "error", text: err.message || "Falha ao criar snapshot." });
    } finally {
      setCreatingSnapshot(false);
    }
  };

  const handleRestoreSnapshot = async (filename: string) => {
    if (!confirm(`Restaurar os registos em falta a partir do snapshot "${filename}"?`)) return;
    setRestoringFilename(filename);
    setResultMsg(null);
    try {
      const res = await fetch("/api/backup/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", filename }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao restaurar snapshot.");
      setResultMsg({ type: "success", text: data.message });
      onRestoreSuccess();
      await fetchSnapshots();
    } catch (err: any) {
      setResultMsg({ type: "error", text: err.message || "Falha ao restaurar snapshot." });
    } finally {
      setRestoringFilename(null);
    }
  };

  // Handle Export Download
  const handleDownloadBackup = () => {
    window.location.href = "/api/backup";
  };

  // Handle Import / Restore from File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setResultMsg(null);

    try {
      const fileText = await file.text();
      const jsonData = JSON.parse(fileText);

      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao restaurar backup.");
      }

      setResultMsg({
        type: "success",
        text: data.message || `${data.importedCount} jogos restaurados com sucesso!`,
      });
      onRestoreSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setResultMsg({ type: "error", text: err.message });
      } else {
        setResultMsg({ type: "error", text: "Ficheiro JSON inválido ou corrompido." });
      }
    } finally {
      setIsRestoring(false);
      // Reset input value
      e.target.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Cópia de Segurança da Coleção</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Export Box */}
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-100">Exportar Toda a Coleção (Download JSON)</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Descarrega um ficheiro `.json` único contendo tudo: a tua biblioteca de <strong>Jogos</strong>, Categorias personalizadas, Metas de backlog e caminhos locais.
            </p>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-zinc-700"
            >
              <Download className="w-4 h-4" />
              Descarregar Backup Completo (.json)
            </button>
          </div>

          {/* Import Box */}
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-zinc-100">Restaurar Toda a Coleção de Ficheiro</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Se mudares de PC ou formatares, escolhe o teu ficheiro `.json` para recuperar os Jogos, Categorias e Metas sem duplicar os existentes.
            </p>

            <label className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-indigo-600/25">
              {isRestoring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A restaurar...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Carregar Ficheiro JSON</span>
                </>
              )}
              <input
                type="file"
                accept=".json"
                className="hidden"
                disabled={isRestoring}
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Local Auto Snapshots */}
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-zinc-100">
                  Snapshots Automáticos Locais (Pasta /backups)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCreateSnapshotNow}
                disabled={creatingSnapshot}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {creatingSnapshot ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>Criar Snapshot Agora</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-400">
              São guardadas automaticamente até 10 cópias rotativas antes de remoções em lote ou restauros.
            </p>

            {loadingSnapshots ? (
              <div className="py-4 flex items-center justify-center text-xs text-zinc-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                A carregar snapshots...
              </div>
            ) : snapshots.length === 0 ? (
              <div className="py-3 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                Ainda não existem snapshots guardados em /backups.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {snapshots.map((snap) => (
                  <div
                    key={snap.filename}
                    className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-200 truncate">
                        {new Date(snap.createdAt).toLocaleString("pt-PT")} •{" "}
                        <span className="text-amber-300 font-mono text-[11px]">{snap.reason}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono truncate">
                        {snap.gamesCount} jogos
                        {snap.mediaCount > 0 ? ` • ${snap.mediaCount} filmes/séries (legado)` : ""} • {snap.sizeKB} KB
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRestoreSnapshot(snap.filename)}
                      disabled={restoringFilename !== null}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-indigo-600 text-zinc-200 hover:text-white border border-zinc-700 text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {restoringFilename === snap.filename ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3 h-3" />
                      )}
                      <span>Restaurar</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feedback message */}
          {resultMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                resultMsg.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              {resultMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              )}
              <span>{resultMsg.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
