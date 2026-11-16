"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  Edit3,
  Trash2,
  Archive,
  FolderPlus,
  X,
  Crown,
  CheckCircle2,
  ChevronUp,
} from "lucide-react";
import { playUiSound } from "@/lib/ui-sfx";

interface BulkActionBarProps {
  selectedCount: number;
  totalFilteredCount: number;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onOpenBulkEdit: () => void;
  onOpenCategoryAssign: () => void;
  onBulkDelete: () => void;
  onBulkToggleArchive: () => void;
  onBulkTogglePlatinum?: () => void;
  onBulkUpdateStatus?: (newStatus: string) => void;
}

export function BulkActionBar({
  selectedCount,
  totalFilteredCount,
  allSelected,
  onToggleSelectAll,
  onClearSelection,
  onOpenBulkEdit,
  onOpenCategoryAssign,
  onBulkDelete,
  onBulkToggleArchive,
  onBulkTogglePlatinum,
  onBulkUpdateStatus,
}: BulkActionBarProps) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex items-center justify-center px-4 pointer-events-none animate-in slide-in-from-bottom-5 duration-300">
      <div className="pointer-events-auto bg-zinc-900/95 border border-indigo-500/50 shadow-2xl shadow-black/80 rounded-2xl px-4 py-2.5 backdrop-blur-xl flex flex-wrap items-center gap-2 sm:gap-2.5 max-w-4xl text-xs">
        {/* Selected Counter & Toggle All */}
        <div className="flex items-center gap-2 pr-2 border-r border-zinc-800">
          <button
            type="button"
            onClick={() => {
              playUiSound("click");
              onToggleSelectAll();
            }}
            className="p-1 rounded-lg hover:bg-zinc-800 text-indigo-400 cursor-pointer flex items-center gap-1.5 font-bold whitespace-nowrap"
            title={allSelected ? "Desmarcar todos" : "Selecionar todos os jogos visíveis"}
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 fill-indigo-600 text-white" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span className="text-white font-mono">
              {selectedCount}{" "}
              <span className="text-zinc-400 font-normal hidden sm:inline">
                de {totalFilteredCount}
              </span>
            </span>
          </button>
        </div>

        {/* 1-Click Quick Status Menu */}
        {onBulkUpdateStatus && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                playUiSound("click");
                setStatusMenuOpen(!statusMenuOpen);
              }}
              className="h-8 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Estado</span>
              <ChevronUp className="w-3 h-3 text-indigo-400" />
            </button>

            {statusMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setStatusMenuOpen(false)} />
                <div className="absolute left-0 bottom-full mb-2 w-44 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    Mudar Estado Para:
                  </div>
                  {[
                    { key: "AVAILABLE", label: "Disponível", dot: "bg-cyan-400" },
                    { key: "BACKLOG", label: "Backlog", dot: "bg-indigo-400" },
                    { key: "PLAYING", label: "A Jogar", dot: "bg-emerald-400" },
                    { key: "COMPLETED", label: "Concluído", dot: "bg-teal-400" },
                    { key: "PLATINUM", label: "Platinado", dot: "bg-amber-400" },
                    { key: "PAUSED", label: "Em Pausa", dot: "bg-yellow-400" },
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => {
                        setStatusMenuOpen(false);
                        playUiSound(s.key === "PLATINUM" ? "platinum" : "toggle");
                        onBulkUpdateStatus(s.key);
                      }}
                      className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 text-zinc-200 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Action: Add to Category */}
        <button
          type="button"
          onClick={() => {
            playUiSound("open");
            onOpenCategoryAssign();
          }}
          className="h-8 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all"
          title="Atribuir a uma categoria personalizada"
        >
          <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Categoria</span>
        </button>

        {/* Action: Bulk Archive Toggle */}
        <button
          type="button"
          onClick={() => {
            playUiSound("click");
            onBulkToggleArchive();
          }}
          className="h-8 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all"
          title="Marcar / Desmarcar como Arquivado"
        >
          <Archive className="w-3.5 h-3.5 text-amber-400" />
          <span>Arquivar</span>
        </button>

        {/* Action: Bulk Platinum */}
        {onBulkTogglePlatinum && (
          <button
            type="button"
            onClick={() => {
              playUiSound("platinum");
              onBulkTogglePlatinum();
            }}
            className="h-8 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all hidden md:flex"
            title="Marcar como Platinado / 100%"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Platinar</span>
          </button>
        )}

        {/* Action: Bulk Edit (Full Modal) */}
        <button
          type="button"
          onClick={() => {
            playUiSound("open");
            onOpenBulkEdit();
          }}
          className="h-8 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all"
          title="Abrir editor completo em lote"
        >
          <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Editar ({selectedCount})</span>
        </button>

        {/* Action: Bulk Delete */}
        <button
          type="button"
          onClick={onBulkDelete}
          className="h-8 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all"
          title="Remover jogos selecionados da biblioteca"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Remover</span>
        </button>

        {/* Clear Selection button */}
        <button
          type="button"
          onClick={() => {
            playUiSound("click");
            onClearSelection();
          }}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer ml-auto"
          title="Limpar seleção"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
