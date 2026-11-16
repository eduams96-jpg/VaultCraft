"use client";

import React from "react";
import { CategoryItem } from "@/types/game";
import { Folder, Layers, Plus, Settings2 } from "lucide-react";
import { playUiSound } from "@/lib/ui-sfx";

interface CategoryFilterTabsProps {
  categories: CategoryItem[];
  activeCategory: string; // "ALL" or category name
  onSelectCategory: (name: string) => void;
  onOpenManageModal: () => void;
  categoryCounts: Record<string, number>;
  totalGamesCount: number;
}

export function CategoryFilterTabs({
  categories,
  activeCategory,
  onSelectCategory,
  onOpenManageModal,
  categoryCounts,
  totalGamesCount,
}: CategoryFilterTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 mb-3.5 scrollbar-none text-xs">
      {/* "Todos" Tab */}
      <button
        type="button"
        onClick={() => {
          playUiSound("click");
          onSelectCategory("ALL");
        }}
        className={`h-8 px-3 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 cursor-pointer ${
          activeCategory === "ALL"
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
            : "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
        }`}
      >
        <Layers className="w-3.5 h-3.5 text-indigo-300" />
        <span>Todos os Jogos</span>
        <span
          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            activeCategory === "ALL"
              ? "bg-white/20 text-white font-bold"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {totalGamesCount}
        </span>
      </button>

      {/* Category Tabs */}
      {categories.map((cat) => {
        const count = categoryCounts[cat.name] || 0;
        const isActive = activeCategory === cat.name;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              playUiSound("click");
              onSelectCategory(cat.name);
            }}
            className={`h-8 px-3 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              isActive
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/50"
                : "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800"
            }`}
          >
            {cat.icon ? (
              <span>{cat.icon}</span>
            ) : (
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>{cat.name}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}

      {/* Manage / Add Category Button */}
      <button
        type="button"
        onClick={() => {
          playUiSound("open");
          onOpenManageModal();
        }}
        className="h-8 px-3 rounded-xl text-zinc-400 hover:text-indigo-300 hover:bg-indigo-950/30 border border-dashed border-zinc-700 hover:border-indigo-500/50 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer text-[11px] font-medium"
        title="Criar ou gerir categorias personalizadas"
      >
        <Plus className="w-3.5 h-3.5 text-indigo-400" />
        <span>Categorias</span>
        <Settings2 className="w-3 h-3 opacity-60" />
      </button>
    </div>
  );
}
