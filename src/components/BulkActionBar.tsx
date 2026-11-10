"use client";

import React from "react";
import {
  CheckSquare,
  Square,
  Edit3,
  Trash2,
  Archive,
  FolderPlus,
  X,
  Crown,
  Save,
  Trophy,
} from "lucide-react";

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
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex items-center justify-center px-4 pointer-events-none animate-in slide-in-from-bottom-5 duration-300">
      <div className="pointer-events-auto bg-zinc-900/95 border border-indigo-500/50 shadow-2xl shadow-black/80 rounded-2xl px-4 py-2.5 backdrop-blur-xl flex flex-wrap items-center gap-2 sm:gap-3 max-w-4xl text-xs">
        {/* Selected Counter & Toggle All */}
        <div className="flex items-center gap-2 pr-2 border-r border-zinc-800">
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="p-1 rounded-lg hover:bg-zinc-800 text-indigo-400 cursor-pointer flex items-center gap-1.5 font-bold"
            title={allSelected ? "Desmarcar todos" : "Selecionar todos os jogos visíveis"}
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 fill-indigo-600 text-white" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span className="text-white">
              {selectedCount}{" "}
              <span className="text-zinc-400 font-normal hidden sm:inline">
                de {totalFilteredCount}
              </span>
            </span>
          </button>
        </div>

        {/* Action: Add to Category */}
        <button
          type="button"
          onClick={onOpenCategoryAssign}
          className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
          title="Atribuir a uma categoria personalizada"
        >
          <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Categoria</span>
        </button>

        {/* Action: Bulk Archive Toggle */}
        <button
          type="button"
          onClick={onBulkToggleArchive}
          className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
          title="Marcar / Desmarcar como Arquivado"
        >
          <Archive className="w-3.5 h-3.5 text-amber-400" />
          <span>Arquivar</span>
        </button>

        {/* Action: Bulk Platinum */}
        {onBulkTogglePlatinum && (
          <button
            type="button"
            onClick={onBulkTogglePlatinum}
            className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 hidden md:flex"
            title="Marcar como Platinado / 100%"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Platinar</span>
          </button>
        )}

        {/* Action: Bulk Edit (Full Modal) */}
        <button
          type="button"
          onClick={onOpenBulkEdit}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
          title="Abrir editor completo em lote"
        >
          <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Editar ({selectedCount})</span>
        </button>

        {/* Action: Bulk Delete */}
        <button
          type="button"
          onClick={onBulkDelete}
          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
          title="Remover jogos selecionados da biblioteca"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Remover</span>
        </button>

        {/* Clear Selection button */}
        <button
          type="button"
          onClick={onClearSelection}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer ml-auto"
          title="Limpar seleção"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
