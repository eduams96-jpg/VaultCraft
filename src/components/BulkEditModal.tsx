"use client";

import React, { useState } from "react";
import {
  Edit3,
  X,
  Check,
  Archive,
  Save,
  Trophy,
  Crown,
  HardDrive,
  Tag,
  Loader2,
  Folder,
} from "lucide-react";

const CONSOLE_GROUPS = [
  {
    group: "PC",
    options: ["PC", "Steam Deck"],
  },
  {
    group: "Sony PlayStation",
    options: [
      "PlayStation 5",
      "PlayStation 4",
      "PlayStation 3",
      "PlayStation 2",
      "PlayStation 1",
      "PlayStation Portable (PSP)",
      "PlayStation Vita",
    ],
  },
  {
    group: "Nintendo",
    options: [
      "Nintendo Switch",
      "Nintendo Wii U",
      "Nintendo Wii",
      "Nintendo GameCube",
      "Nintendo 64",
      "Super Nintendo (SNES)",
      "Nintendo (NES)",
      "Nintendo 3DS",
      "Nintendo DS",
      "Game Boy Advance (GBA)",
      "Game Boy / Color",
    ],
  },
  {
    group: "Microsoft Xbox",
    options: [
      "Xbox Series X/S",
      "Xbox One",
      "Xbox 360",
      "Xbox Original",
    ],
  },
  {
    group: "Sega & Retro",
    options: [
      "Sega Dreamcast",
      "Sega Saturn",
      "Sega Mega Drive / Genesis",
      "Arcade / MAME",
      "Retro / Emulador Geral",
    ],
  },
];

export interface BulkEditUpdates {
  status?: string;
  platform?: string;
  originType?: string;
  isArchived?: boolean;
  isInstalled?: boolean;
  hasSavefile?: boolean;
  hasAchievements?: boolean;
  isPlatinum?: boolean;
  tags?: string;
  storageLocation?: string;
}

interface BulkEditModalProps {
  isOpen: boolean;
  selectedCount: number;
  onClose: () => void;
  onApply: (updates: BulkEditUpdates) => Promise<void>;
}

export function BulkEditModal({
  isOpen,
  selectedCount,
  onClose,
  onApply,
}: BulkEditModalProps) {
  // Enabled toggles for each field to apply
  const [enableStatus, setEnableStatus] = useState(false);
  const [statusVal, setStatusVal] = useState("BACKLOG");

  const [enablePlatform, setEnablePlatform] = useState(false);
  const [platformVal, setPlatformVal] = useState("PlayStation 2");
  const [customPlatform, setCustomPlatform] = useState("");
  const [isCustomPlatform, setIsCustomPlatform] = useState(false);

  const [enableOrigin, setEnableOrigin] = useState(false);
  const [originVal, setOriginVal] = useState("EMULATOR");

  const [enableArchive, setEnableArchive] = useState(false);
  const [archiveVal, setArchiveVal] = useState(true);

  const [enableInstalled, setEnableInstalled] = useState(false);
  const [installedVal, setInstalledVal] = useState(false);

  const [enableSavefile, setEnableSavefile] = useState(false);
  const [savefileVal, setSavefileVal] = useState(true);

  const [enableAchievements, setEnableAchievements] = useState(false);
  const [achievementsVal, setAchievementsVal] = useState(true);

  const [enablePlatinum, setEnablePlatinum] = useState(false);
  const [platinumVal, setPlatinumVal] = useState(true);

  const [enableTags, setEnableTags] = useState(false);
  const [tagsVal, setTagsVal] = useState("");

  const [enableLocation, setEnableLocation] = useState(false);
  const [locationVal, setLocationVal] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const anyFieldEnabled =
    enableStatus ||
    enablePlatform ||
    enableOrigin ||
    enableArchive ||
    enableInstalled ||
    enableSavefile ||
    enableAchievements ||
    enablePlatinum ||
    enableTags ||
    enableLocation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anyFieldEnabled) {
      alert("Ativa pelo menos um campo para aplicar as alterações.");
      return;
    }

    const updates: BulkEditUpdates = {};

    if (enableStatus) updates.status = statusVal;
    if (enablePlatform) {
      updates.platform = isCustomPlatform ? (customPlatform.trim() || "Consola") : platformVal;
    }
    if (enableOrigin) updates.originType = originVal;
    if (enableArchive) updates.isArchived = archiveVal;
    if (enableInstalled) updates.isInstalled = installedVal;
    if (enableSavefile) updates.hasSavefile = savefileVal;
    if (enableAchievements) updates.hasAchievements = achievementsVal;
    if (enablePlatinum) updates.isPlatinum = platinumVal;
    if (enableTags) updates.tags = tagsVal;
    if (enableLocation) updates.storageLocation = locationVal;

    setIsSubmitting(true);
    try {
      await onApply(updates);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao aplicar edição em lote.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Editar Jogos em Lote</h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {selectedCount} selecionados
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Ativa apenas os campos que pretendes alterar nos jogos selecionados.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Status Field */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              enableStatus ? "bg-zinc-950/80 border-indigo-500/50" : "bg-zinc-950/40 border-zinc-800/80"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-zinc-200 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableStatus}
                  onChange={(e) => setEnableStatus(e.target.checked)}
                  className="rounded border-zinc-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <span>Alterar Estado</span>
              </label>
              {enableStatus && <span className="text-[10px] text-indigo-400 font-semibold">Ativo</span>}
            </div>

            {enableStatus && (
              <select
                value={statusVal}
                onChange={(e) => setStatusVal(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="AVAILABLE">📦 Disponível</option>
                <option value="BACKLOG">⏳ Backlog</option>
                <option value="PLAYING">🎮 A Jogar</option>
                <option value="COMPLETED">✅ Concluído</option>
                <option value="PLATINUM">🏆 Platinado</option>
                <option value="PAUSED">⏸️ Em Pausa</option>
                <option value="NOT_STARTED">⚪ Não Iniciado</option>
              </select>
            )}
          </div>

          {/* Platform Field */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              enablePlatform ? "bg-zinc-950/80 border-indigo-500/50" : "bg-zinc-950/40 border-zinc-800/80"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-zinc-200 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={enablePlatform}
                  onChange={(e) => setEnablePlatform(e.target.checked)}
                  className="rounded border-zinc-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <span>Alterar Consola / Plataforma</span>
              </label>
              {enablePlatform && (
                <button
                  type="button"
                  onClick={() => setIsCustomPlatform(!isCustomPlatform)}
                  className="text-indigo-400 hover:text-indigo-300 text-[10px] underline"
                >
                  {isCustomPlatform ? "Ver lista padrão" : "+ Outra consola"}
                </button>
              )}
            </div>

            {enablePlatform && (
              <>
                {isCustomPlatform ? (
                  <input
                    type="text"
                    placeholder="Ex: PlayStation 2, Nintendo Switch, Retro..."
                    value={customPlatform}
                    onChange={(e) => setCustomPlatform(e.target.value)}
                    className="w-full bg-zinc-900 border border-indigo-500 rounded-xl px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                  />
                ) : (
                  <select
                    value={platformVal}
                    onChange={(e) => setPlatformVal(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {CONSOLE_GROUPS.map((cg) => (
                      <optgroup key={cg.group} label={cg.group}>
                        {cg.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                )}
              </>
            )}
          </div>

          {/* Origin Field */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              enableOrigin ? "bg-zinc-950/80 border-indigo-500/50" : "bg-zinc-950/40 border-zinc-800/80"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-zinc-200 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableOrigin}
                  onChange={(e) => setEnableOrigin(e.target.checked)}
                  className="rounded border-zinc-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <span>Alterar Origem / Cópia</span>
              </label>
              {enableOrigin && <span className="text-[10px] text-indigo-400 font-semibold">Ativo</span>}
            </div>

            {enableOrigin && (
              <select
                value={originVal}
                onChange={(e) => setOriginVal(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="STEAM">🎮 Steam</option>
                <option value="REPACK">🏴‍☠️ Repack / Pirata</option>
                <option value="GOG">🟣 GOG (DRM-Free)</option>
                <option value="EPIC">⚡ Epic Games</option>
                <option value="EMULATOR">👾 Emulador / ROM</option>
                <option value="PHYSICAL">📦 Cópia Física</option>
                <option value="OTHER">Outro</option>
              </select>
            )}
          </div>

          {/* Collection Badges Group (Arquivo, Savefile, Conquistas, Platinado, Instalado) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Arquivo */}
            <div
              className={`p-3 rounded-2xl border transition-all ${
                enableArchive ? "bg-zinc-950/80 border-amber-500/50" : "bg-zinc-950/40 border-zinc-800/80"
              }`}
            >
              <label className="flex items-center gap-2 text-zinc-200 font-semibold cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={enableArchive}
                  onChange={(e) => setEnableArchive(e.target.checked)}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <Archive className="w-3.5 h-3.5 text-amber-400" />
                <span>Arquivo</span>
              </label>
              {enableArchive && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setArchiveVal(true)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium cursor-pointer ${
                      archiveVal
                        ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    📦 Arquivar
                  </button>
                  <button
                    type="button"
                    onClick={() => setArchiveVal(false)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium cursor-pointer ${
                      !archiveVal
                        ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    Por Arquivar
                  </button>
                </div>
              )}
            </div>

            {/* Instalado */}
            <div
              className={`p-3 rounded-2xl border transition-all ${
                enableInstalled ? "bg-zinc-950/80 border-emerald-500/50" : "bg-zinc-950/40 border-zinc-800/80"
              }`}
            >
              <label className="flex items-center gap-2 text-zinc-200 font-semibold cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={enableInstalled}
                  onChange={(e) => setEnableInstalled(e.target.checked)}
                  className="rounded border-zinc-700 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instalação</span>
              </label>
              {enableInstalled && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setInstalledVal(true)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium cursor-pointer ${
                      installedVal
                        ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    🎮 Instalado
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstalledVal(false)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium cursor-pointer ${
                      !installedVal
                        ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    Desinstalado
                  </button>
                </div>
              )}
            </div>

            {/* Savefile */}
            <div
              className={`p-3 rounded-2xl border transition-all ${
                enableSavefile ? "bg-zinc-950/80 border-sky-500/50" : "bg-zinc-950/40 border-zinc-800/80"
              }`}
            >
              <label className="flex items-center gap-2 text-zinc-200 font-semibold cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={enableSavefile}
                  onChange={(e) => setEnableSavefile(e.target.checked)}
                  className="rounded border-zinc-700 text-sky-500 focus:ring-0 cursor-pointer"
                />
                <Save className="w-3.5 h-3.5 text-sky-400" />
                <span>Savefile</span>
              </label>
              {enableSavefile && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSavefileVal(true)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium cursor-pointer ${
                      savefileVal
                        ? "bg-sky-500/20 border-sky-500/60 text-sky-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    💾 Com Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setSavefileVal(false)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium cursor-pointer ${
                      !savefileVal
                        ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    Sem Save
                  </button>
                </div>
              )}
            </div>

            {/* Conquistas / Achievements */}
            <div
              className={`p-3 rounded-2xl border transition-all ${
                enableAchievements ? "bg-zinc-950/80 border-purple-500/50" : "bg-zinc-950/40 border-zinc-800/80"
              }`}
            >
              <label className="flex items-center gap-2 text-zinc-200 font-semibold cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={enableAchievements}
                  onChange={(e) => setEnableAchievements(e.target.checked)}
                  className="rounded border-zinc-700 text-purple-500 focus:ring-0 cursor-pointer"
                />
                <Trophy className="w-3.5 h-3.5 text-purple-400" />
                <span>Conquistas</span>
              </label>
              {enableAchievements && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAchievementsVal(true)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium cursor-pointer ${
                      achievementsVal
                        ? "bg-purple-500/20 border-purple-500/60 text-purple-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    🏆 Com Conquistas
                  </button>
                  <button
                    type="button"
                    onClick={() => setAchievementsVal(false)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium cursor-pointer ${
                      !achievementsVal
                        ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    Sem Conquistas
                  </button>
                </div>
              )}
            </div>

            {/* Platinado */}
            <div
              className={`p-3 rounded-2xl border transition-all sm:col-span-2 ${
                enablePlatinum ? "bg-zinc-950/80 border-amber-500/50" : "bg-zinc-950/40 border-zinc-800/80"
              }`}
            >
              <label className="flex items-center gap-2 text-zinc-200 font-semibold cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={enablePlatinum}
                  onChange={(e) => setEnablePlatinum(e.target.checked)}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Platinado (100% Concluído)</span>
              </label>
              {enablePlatinum && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPlatinumVal(true)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium cursor-pointer ${
                      platinumVal
                        ? "bg-amber-500/25 border-amber-500/60 text-amber-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    👑 Platinado
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatinumVal(false)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium cursor-pointer ${
                      !platinumVal
                        ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    Não Platinado
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              enableTags ? "bg-zinc-950/80 border-indigo-500/50" : "bg-zinc-950/40 border-zinc-800/80"
            }`}
          >
            <label className="flex items-center gap-2 text-zinc-200 font-semibold cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={enableTags}
                onChange={(e) => setEnableTags(e.target.checked)}
                className="rounded border-zinc-700 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Adicionar / Definir Tags Comuns</span>
            </label>
            {enableTags && (
              <input
                type="text"
                placeholder="Ex: Buzz, Party, Infância, Co-op..."
                value={tagsVal}
                onChange={(e) => setTagsVal(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>

          {/* Storage Location */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              enableLocation ? "bg-zinc-950/80 border-indigo-500/50" : "bg-zinc-950/40 border-zinc-800/80"
            }`}
          >
            <label className="flex items-center gap-2 text-zinc-200 font-semibold cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={enableLocation}
                onChange={(e) => setEnableLocation(e.target.checked)}
                className="rounded border-zinc-700 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
              <span>Localização / Pasta de Instalação</span>
            </label>
            {enableLocation && (
              <input
                type="text"
                placeholder="Ex: D:\Emuladores\PS2\ROMS"
                value={locationVal}
                onChange={(e) => setLocationVal(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
              />
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!anyFieldEnabled || isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A atualizar...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Aplicar a {selectedCount} Jogos</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
