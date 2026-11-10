"use client";

import React, { useState } from "react";
import { GoalItem } from "@/types/game";
import {
  X,
  Target,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Sparkles,
  Trophy,
  Clock,
  Loader2,
} from "lucide-react";

interface BacklogGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: GoalItem[];
  onCreateGoal: (title: string, targetCount: number, category?: string) => Promise<void>;
  onUpdateGoal: (id: string, currentCount: number, isCompleted?: boolean) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
}

export function BacklogGoalsModal({
  isOpen,
  onClose,
  goals,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
}: BacklogGoalsModalProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState<number>(3);
  const [newCategory, setNewCategory] = useState("CUSTOM");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateGoal(newTitle.trim(), newTarget, newCategory);
      setNewTitle("");
      setNewTarget(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPreset = async (title: string, target: number, category: string) => {
    setIsSubmitting(true);
    try {
      await onCreateGoal(title, target, category);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Metas & Desafios de Backlog</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  {activeGoals.length} ativas
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Define objetivos pessoais para manter o foco e abater a tua lista de jogos.
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
          {/* Quick Presets Bar */}
          <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              ⚡ 1-Clique: Adicionar Desafios Pré-Feitos
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { title: "Terminar 3 Jogos Curtos (< 10h)", target: 3, cat: "SHORT_GAMES", icon: "⚡" },
                { title: "Platinar 2 Jogos este Mês", target: 2, cat: "PLATINUM", icon: "🏆" },
                { title: "Passar 5 Jogos do Backlog", target: 5, cat: "BACKLOG", icon: "⏳" },
                { title: "Alcançar 10 Jogos Fechados", target: 10, cat: "COMPLETED", icon: "🎯" },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleAddPreset(p.title, p.target, p.cat)}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{p.icon}</span>
                  <span>{p.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Create Goal Form */}
          <form onSubmit={handleCreate} className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl space-y-3">
            <label className="text-zinc-200 font-semibold block text-[11px]">
              + Criar Meta Personalizada:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Terminar a trilogia Batman, Jogar 3 RPGs..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-xl px-2.5">
                <span className="text-[10px] text-zinc-500">Alvo:</span>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={newTarget}
                  onChange={(e) => setNewTarget(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 bg-transparent text-center font-bold text-indigo-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !newTitle.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer shrink-0"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Adicionar</span>
              </button>
            </div>
          </form>

          {/* Active Goals List */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
              Metas em Progresso ({activeGoals.length})
            </span>

            {activeGoals.length === 0 ? (
              <div className="p-6 text-center bg-zinc-950/40 border border-zinc-800/60 rounded-2xl text-zinc-500 text-xs">
                Não tens metas ativas no momento. Cria uma acima ou clica num dos desafios pré-feitos!
              </div>
            ) : (
              activeGoals.map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentCount / goal.targetCount) * 100));
                return (
                  <div
                    key={goal.id}
                    className="p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl space-y-2 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-bold text-zinc-100 text-xs truncate">
                        {goal.title}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* 1-click increment/decrement buttons */}
                        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateGoal(goal.id, Math.max(0, goal.currentCount - 1))}
                            className="px-2 py-0.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-bold"
                            title="-1 no progresso"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono font-bold text-indigo-400 text-xs">
                            {goal.currentCount}/{goal.targetCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = goal.currentCount + 1;
                              onUpdateGoal(goal.id, next, next >= goal.targetCount);
                            }}
                            className="px-2 py-0.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-bold"
                            title="+1 no progresso"
                          >
                            +
                          </button>
                        </div>

                        {/* Complete Checkbox */}
                        <button
                          type="button"
                          onClick={() => onUpdateGoal(goal.id, goal.targetCount, true)}
                          className="p-1 rounded-lg bg-zinc-900 hover:bg-emerald-950/60 text-zinc-400 hover:text-emerald-400 border border-zinc-800"
                          title="Marcar como Concluída"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onDeleteGoal(goal.id)}
                          className="p-1 rounded-lg hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400"
                          title="Eliminar meta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span>Progresso</span>
                        <span className="font-mono font-bold text-zinc-400">{percent}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Metas Concluídas ({completedGoals.length})
              </span>
              <div className="space-y-1.5 opacity-75">
                {completedGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-2.5 bg-zinc-950/50 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs"
                  >
                    <span className="line-through text-zinc-400 truncate flex items-center gap-2">
                      <span>🎉</span>
                      <span>{goal.title}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1 text-zinc-600 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
