import React, { useState } from "react";
import { Download, Upload, X, Loader2, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess: () => void;
}

export function BackupModal({ isOpen, onClose, onRestoreSuccess }: BackupModalProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  if (!isOpen) return null;

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
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Cópia de Segurança & Restauro</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Box */}
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-100">Exportar Coleção (Download)</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Descarrega um ficheiro `.json` com todos os teus jogos, capas, notas de instalação, progresso e caminhos locais.
            </p>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-zinc-700"
            >
              <Download className="w-4 h-4" />
              Descarregar Backup (.json)
            </button>
          </div>

          {/* Import Box */}
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-zinc-100">Restaurar de Ficheiro</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Se mudares de PC ou formatares, escolhe o teu ficheiro `.json` para recuperar toda a coleção sem duplicar os existentes.
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
