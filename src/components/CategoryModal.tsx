"use client";

import React, { useState } from "react";
import { CategoryItem, GameItem } from "@/types/game";
import {
  FolderPlus,
  X,
  Trash2,
  Plus,
  Check,
  Sparkles,
  Loader2,
} from "lucide-react";

interface CategoryModalProps {
  isOpen: boolean;
  categories: CategoryItem[];
  games: GameItem[];
  selectedGameIds?: string[];
  assignMode?: boolean;
  onClose: () => void;
  onCreateCategory: (name: string, icon?: string, color?: string) => Promise<void>;
  onDeleteCategory: (id: string, name: string) => Promise<void>;
  onAssignToCategory?: (categoryName: string) => Promise<void>;
  onAutoFranchises?: () => Promise<void>;
}

const PRESET_ICONS = ["📁", "🎮", "👥", "🔥", "🏆", "🕹️", "🌟", "👑", "🎯", "💎", "📦", "💀", "🚀"];
const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
];

export function CategoryModal({
  isOpen,
  categories,
  games,
  selectedGameIds = [],
  assignMode = false,
  onClose,
  onCreateCategory,
  onDeleteCategory,
  onAssignToCategory,
  onAutoFranchises,
}: CategoryModalProps) {
  const [newCatName, setNewCatName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📁");
  const [selectedColor, setSelectedColor] = useState("#6366f1");
  const [isCreating, setIsCreating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isAutoFranchising, setIsAutoFranchising] = useState(false);

  if (!isOpen) return null;

  // Compute game counts per category
  const categoryGameCounts: Record<string, number> = {};
  games.forEach((g) => {
    if (g.customCategories) {
      g.customCategories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .forEach((c) => {
          categoryGameCounts[c] = (categoryGameCounts[c] || 0) + 1;
        });
    }
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateCategory(newCatName.trim(), selectedIcon, selectedColor);

      if (assignMode && onAssignToCategory && selectedGameIds.length > 0) {
        await onAssignToCategory(newCatName.trim());
        onClose();
      }

      setNewCatName("");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar categoria.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectToAssign = async (catName: string) => {
    if (!onAssignToCategory) return;
    setIsAssigning(true);
    try {
      await onAssignToCategory(catName);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao atribuir categoria.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAutoFranchises = async () => {
    if (!onAutoFranchises) return;
    setIsAutoFranchising(true);
    try {
      await onAutoFranchises();
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar franquias automáticas.");
    } finally {
      setIsAutoFranchising(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {assignMode ? "Adicionar a Categoria" : "Gerir Categorias Personalizadas"}
                </h2>
                {assignMode && selectedGameIds.length > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                    {selectedGameIds.length} jogos selecionados
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                Organização 100% manual e personalizada ao teu gosto.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Create New Category Form */}
          <form onSubmit={handleCreate} className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl space-y-3">
            <label className="text-zinc-200 font-semibold block text-[11px]">
              + Criar Nova Categoria:
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome da categoria (ex: Buzz PS2, Favoritos, Co-op...)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                disabled={isCreating || !newCatName.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer shrink-0"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{assignMode ? "Criar e Atribuir" : "Criar"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Icon & Color selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
              {/* Preset Icons */}
              <div className="flex items-center gap-1">
                <span className="text-zinc-500 text-[10px] mr-1">Ícone:</span>
                {PRESET_ICONS.slice(0, 8).map((ico) => (
                  <button
                    key={ico}
                    type="button"
                    onClick={() => setSelectedIcon(ico)}
                    className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer ${
                      selectedIcon === ico
                        ? "bg-indigo-600/30 border border-indigo-500 scale-110"
                        : "hover:bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {ico}
                  </button>
                ))}
              </div>

              {/* Preset Colors */}
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 text-[10px] mr-1">Cor:</span>
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`w-4 h-4 rounded-full transition-all cursor-pointer ${
                      selectedColor === col ? "ring-2 ring-white scale-125" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </form>

          {/* Auto Franchise Discovery Banner */}
          {!assignMode && onAutoFranchises && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-purple-950/40 to-zinc-950 border border-indigo-500/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm shrink-0">
                  ✨
                </div>
                <div>
                  <span className="font-bold text-zinc-100 text-xs block">Gerar Franquias Automáticas</span>
                  <span className="text-[10px] text-zinc-400">
                    Deteta e agrupa sagas (Assassin&apos;s Creed, Batman, BioShock, Hitman, Witcher, etc.)
                  </span>
                </div>
              </div>
              <button
                type="button"
                disabled={isAutoFranchising}
                onClick={handleAutoFranchises}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isAutoFranchising ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>A Organizar...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                    <span>Auto-Gerar Sagas</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Existing Categories List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>Categorias Existentes ({categories.length})</span>
              {assignMode && (
                <span className="text-indigo-400">Clica numa categoria para atribuir:</span>
              )}
            </div>

            {categories.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950/40 border border-zinc-800/60 rounded-2xl text-zinc-500 text-xs">
                Ainda não tens categorias personalizadas. Cria a primeira acima!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const count = categoryGameCounts[cat.name] || 0;
                  return (
                    <div
                      key={cat.id}
                      className={`group p-3 rounded-2xl border transition-all flex items-center justify-between ${
                        assignMode
                          ? "hover:border-indigo-500 hover:bg-indigo-950/20 cursor-pointer bg-zinc-950/60 border-zinc-800/80"
                          : "bg-zinc-950/50 border-zinc-800/80"
                      }`}
                      onClick={() => {
                        if (assignMode) handleSelectToAssign(cat.name);
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg">{cat.icon || "📁"}</span>
                        <div className="truncate">
                          <div className="font-bold text-zinc-100 truncate flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: cat.color || "#6366f1" }}
                            />
                            <span>{cat.name}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500">
                            {count} jogo{count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {assignMode ? (
                          <button
                            type="button"
                            disabled={isAssigning}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Atribuir</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Remover categoria "${cat.name}"? Os jogos não serão apagados.`)) {
                                onDeleteCategory(cat.id, cat.name);
                              }
                            }}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                            title="Remover categoria"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-end bg-zinc-950/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
