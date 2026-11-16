"use client";

import React, { useState } from "react";
import { GameItem } from "@/types/game";
import { VaultCraftLogo } from "./CraftIcons";
import { playUiSound } from "@/lib/ui-sfx";
import {
  X,
  Copy,
  Check,
  Printer,
  Sparkles,
  Crown,
  FileSpreadsheet,
  FileCode,
  Share2,
  Gamepad2,
  Star,
} from "lucide-react";

interface GamerCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: GameItem[];
}

export function GamerCardModal({
  isOpen,
  onClose,
  games,
}: GamerCardModalProps) {
  const [userName, setUserName] = useState("Colecionador / perfil-exemplo");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const collection = games.filter((g) => !g.isWishlist);
  const totalGames = collection.length;

  const totalHours = Math.round(
    collection.reduce((acc, g) => acc + (g.hoursPlayed || 0), 0) * 10
  ) / 10;
  const totalDays = Math.round((totalHours / 24) * 10) / 10;

  const completed = collection.filter((g) => g.status === "COMPLETED").length;
  const platinum = collection.filter((g) => g.isPlatinum || g.status === "PLATINUM").length;
  const finishRate = totalGames > 0 ? Math.round(((completed + platinum) / totalGames) * 100) : 0;

  // Favorites or Top Played for showcase
  const favorites = collection.filter((g) => g.isFavorite);
  const showcaseGames = (
    favorites.length > 0
      ? favorites
      : [...collection].sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0))
  ).slice(0, 3);

  // CSV Export
  const handleExportCSV = () => {
    playUiSound("success");
    const headers = [
      "ID",
      "Título",
      "Plataforma",
      "Origem",
      "Estado",
      "Horas Jogadas",
      "Nota (1-10)",
      "Ano",
      "Géneros",
      "Duração HLTB",
      "Categorias",
      "Arquivado",
      "Platinado",
    ];

    const rows = collection.map((g) => [
      `"${g.id}"`,
      `"${g.title.replace(/"/g, '""')}"`,
      `"${g.platform}"`,
      `"${g.originType}"`,
      `"${g.status}"`,
      g.hoursPlayed || 0,
      g.rating || "",
      g.releaseYear || "",
      `"${(g.genres || "").replace(/"/g, '""')}"`,
      `"${(g.timeToBeat || "").replace(/"/g, '""')}"`,
      `"${(g.customCategories || "").replace(/"/g, '""')}"`,
      g.isArchived ? "Sim" : "Não",
      g.isPlatinum ? "Sim" : "Não",
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `VaultCraft_Jogos_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // JSON Export
  const handleExportJSON = () => {
    playUiSound("success");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(games, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `VaultCraft_Backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Copy Markdown
  const handleCopyMarkdown = () => {
    playUiSound("success");
    const md = `### Cartão de Colecionador VaultCraft: ${userName}
- **Total de Jogos:** ${totalGames}
- **Horas de Jogo:** ${totalHours}h (~${totalDays} dias de jogo)
- **Conclusões:** ${completed} concluídos | ${platinum} platinas (${finishRate}% da biblioteca)
- **Destaques:** ${showcaseGames.map((g) => g.title).join(", ")}
*Gerado por VaultCraft Studio*`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Share2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Gamer Card & Exportação
              </h2>
              <p className="text-[11px] text-zinc-400">
                Visualiza o teu cartão de perfil e exporta a biblioteca em Excel ou PDF.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* THE GAMER CARD (Showcase View) */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 border border-amber-500/40 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Profile Bar */}
            <div className="flex items-center justify-between gap-3 relative z-10 border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <VaultCraftLogo className="w-8 h-8" />
                </div>
                <div>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="font-extrabold text-base text-white bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-amber-400 focus:outline-none transition-colors"
                    title="Clica para mudar o teu nome"
                  />
                  <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Mestre do Backlog • Colecionador VaultCraft</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Status</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">ATIVO</span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative z-10">
              <div className="p-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-center space-y-0.5">
                <span className="text-[10px] text-zinc-500 block">Jogos</span>
                <span className="text-base font-black text-white font-mono">{totalGames}</span>
              </div>
              <div className="p-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-center space-y-0.5">
                <span className="text-[10px] text-zinc-500 block">Tempo</span>
                <span className="text-base font-black text-indigo-400 font-mono">{totalHours.toLocaleString()}h</span>
              </div>
              <div className="p-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-center space-y-0.5">
                <span className="text-[10px] text-zinc-500 block">Conclusão</span>
                <span className="text-base font-black text-emerald-400 font-mono">{finishRate}%</span>
              </div>
              <div className="p-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-center space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-zinc-500 block">Platinas</span>
                <span className="text-base font-black text-amber-400 font-mono inline-flex items-center gap-1">
                  {platinum}
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                </span>
              </div>
            </div>

            {/* Showcase Games */}
            {showcaseGames.length > 0 && (
              <div className="space-y-2 relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Jogos em Destaque</span>
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {showcaseGames.map((g) => (
                    <div
                      key={g.id}
                      className="p-2 bg-zinc-950/80 border border-zinc-800 rounded-xl flex flex-col items-center text-center gap-1.5"
                    >
                      <div className="case-poster w-full aspect-[2/3] bg-zinc-900 rounded-lg overflow-hidden border border-white/10">
                        {g.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={g.coverUrl} alt={g.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Gamepad2 className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-[11px] text-zinc-200 truncate w-full">
                        {g.title}
                      </span>
                      <span className="font-mono text-[10px] text-amber-400 font-semibold">
                        {g.hoursPlayed}h
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* EXPORT OPTIONS */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
              Opções de Exportação & Partilha
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportCSV}
                className="p-3.5 rounded-2xl bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800 hover:border-emerald-500/50 flex items-center gap-3 transition-all cursor-pointer text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-zinc-100 block group-hover:text-emerald-300">
                    Exportar Excel (CSV)
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    Folha de cálculo com horas, notas, géneros e estados.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="p-3.5 rounded-2xl bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800 hover:border-indigo-500/50 flex items-center gap-3 transition-all cursor-pointer text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-zinc-100 block group-hover:text-indigo-300">
                    Backup de Jogos (JSON)
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    Ficheiro restaurável com todos os {totalGames} jogos.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="p-3.5 rounded-2xl bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800 hover:border-purple-500/50 flex items-center gap-3 transition-all cursor-pointer text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-zinc-100 block group-hover:text-purple-300">
                    Imprimir / Guardar PDF
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    Gera visualização de impressão e relatório PDF.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="p-3.5 rounded-2xl bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800 hover:border-amber-500/50 flex items-center gap-3 transition-all cursor-pointer text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </div>
                <div>
                  <span className="font-bold text-zinc-100 block group-hover:text-amber-300">
                    {copied ? "Copiado!" : "Copiar Ficha (Markdown)"}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    Texto formatado para Discord, Reddit ou fóruns.
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
