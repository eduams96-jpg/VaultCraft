"use client";

import React, { useState } from "react";
import {
  Layers,
  Loader2,
  X,
  Sparkles,
  CheckCircle2,
  Archive,
  Search,
  ArrowLeft,
  Check,
  AlertTriangle,
  Save,
  Trophy,
  Crown,
  Link,
  Eye,
  EyeOff,
  ShieldAlert,
  Gamepad2,
} from "lucide-react";
import { OriginBadge } from "./OriginBadge";

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

interface DetectedGameItem {
  original: string;
  cleanTitle: string;
  coverUrl: string | null;
  bannerUrl: string | null;
  releaseYear: number | null;
  genres: string | null;
  diskSpace: string | null;
  screenshots?: string | null;
  timeToBeat?: string | null;
  metaSource?: string;
  detectedOrigin: string;
  detectedRepack: string | null;
  detectedPlatform: string;
  isDuplicate: boolean;
  duplicateReason?: string;
  selected: boolean;
  isArchived: boolean;
  hasSavefile: boolean;
  hasAchievements: boolean;
  isPlatinum: boolean;
}

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export function BatchImportModal({
  isOpen,
  onClose,
  onImportSuccess,
}: BatchImportModalProps) {
  const [step, setStep] = useState<"input" | "preview">("input");
  const [textList, setTextList] = useState("");
  const [platform, setPlatform] = useState("PC");
  const [customPlatform, setCustomPlatform] = useState("");
  const [isCustomPlatform, setIsCustomPlatform] = useState(false);

  const [originType, setOriginType] = useState("STEAM");
  const [status, setStatus] = useState("BACKLOG");

  // Feature Defaults
  const [isArchivedDefault, setIsArchivedDefault] = useState(false);
  const [hasSavefileDefault, setHasSavefileDefault] = useState(false);
  const [hasAchievementsDefault, setHasAchievementsDefault] = useState(false);
  const [isPlatinumDefault, setIsPlatinumDefault] = useState(false);

  // Input Mode: Manual Text Paste vs Steam Profile Extractor
  const [inputMode, setInputMode] = useState<"text" | "steam">("text");
  const [steamIdentifier, setSteamIdentifier] = useState("perfil-exemplo");
  const [isExtractingSteam, setIsExtractingSteam] = useState(false);

  // Preview state
  const [detectedGames, setDetectedGames] = useState<DetectedGameItem[]>([]);
  const [hideDuplicates, setHideDuplicates] = useState(false);
  const [showSteamGuide, setShowSteamGuide] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Active cover editor index
  const [editingCoverIndex, setEditingCoverIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const sampleGames = `1. The Legend of Zelda: Tears of the Kingdom [Switch]
2. God of War Ragnarok (PS5)
3. Cyberpunk 2077 [FitGirl Repack]
- Bloodborne (PS4)
* Gran Turismo 4 (PS2)
Hades II
Pokemon Emerald (GBA)`;

  const resolvedBasePlatform = isCustomPlatform ? (customPlatform.trim() || "Consola") : platform;

  // STEP 1: ANALYZE TITLES AND DETECT METADATA
  const handleAnalyze = async () => {
    const lines = textList
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 1);

    if (lines.length === 0) {
      alert("Escreve ou cola pelo menos um nome de jogo.");
      return;
    }

    setIsAnalyzing(true);
    setResultMsg(null);

    try {
      const res = await fetch("/api/batch-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "analyze",
          titles: lines,
          defaultPlatform: resolvedBasePlatform,
          defaultOrigin: originType,
          defaultArchived: isArchivedDefault,
          defaultHasSavefile: hasSavefileDefault,
          defaultHasAchievements: hasAchievementsDefault,
          defaultIsPlatinum: isPlatinumDefault,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao analisar lista.");

      const list: DetectedGameItem[] = (data.detectedGames || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (g: any) => ({
          ...g,
          isArchived: isArchivedDefault,
          hasSavefile: hasSavefileDefault,
          hasAchievements: hasAchievementsDefault,
          isPlatinum: isPlatinumDefault,
          selected: !g.isDuplicate, // strictly unselected if duplicate
        })
      );

      setDetectedGames(list);
      setStep("preview");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setResultMsg({ type: "error", text: err.message });
      } else {
        setResultMsg({ type: "error", text: "Erro desconhecido ao pesquisar capas." });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // STEP 1B: EXTRACT FROM STEAM PROFILE
  const handleExtractFromSteam = async () => {
    let cleanId = steamIdentifier.trim();
    if (cleanId.includes("steamcommunity.com/id/")) {
      const match = cleanId.match(/steamcommunity\.com\/id\/([^/?]+)/);
      if (match) cleanId = match[1];
    } else if (cleanId.includes("steamcommunity.com/profiles/")) {
      const match = cleanId.match(/steamcommunity\.com\/profiles\/([^/?]+)/);
      if (match) cleanId = match[1];
    }

    if (!cleanId) {
      alert("Por favor insere o teu ID ou URL de perfil Steam.");
      return;
    }

    setIsExtractingSteam(true);
    setResultMsg(null);

    try {
      const res = await fetch(`/api/steam/profile?id=${encodeURIComponent(cleanId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao consultar perfil Steam.");

      if (!data.games || data.games.length === 0) {
        throw new Error("Nenhum jogo encontrado neste perfil Steam.");
      }

      // Check duplicates against DB using analyze route
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const titles = data.games.map((g: any) => g.title);
      const analyzeRes = await fetch("/api/batch-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "analyze",
          titles: titles,
          defaultPlatform: "PC",
          defaultOrigin: "STEAM",
          defaultArchived: isArchivedDefault,
          defaultHasSavefile: hasSavefileDefault,
          defaultHasAchievements: true,
          defaultIsPlatinum: isPlatinumDefault,
        }),
      });

      const analyzeData = await analyzeRes.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detected = (analyzeData.detectedGames || []).map((g: any, idx: number) => {
        const steamItem = data.games[idx];
        return {
          ...g,
          coverUrl: steamItem?.coverUrl || g.coverUrl,
          bannerUrl: steamItem?.bannerUrl || g.bannerUrl,
          detectedOrigin: "STEAM",
          detectedPlatform: "PC",
          hasAchievements: true,
          isArchived: isArchivedDefault,
          hasSavefile: hasSavefileDefault,
          isPlatinum: isPlatinumDefault,
          selected: !g.isDuplicate,
        };
      });

      setDetectedGames(detected);
      setPlatform("PC");
      setOriginType("STEAM");
      setStatus("AVAILABLE");
      setStep("preview");
      if (data.message) {
        setResultMsg({ type: "success", text: data.message });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setResultMsg({ type: "error", text: err.message });
      } else {
        setResultMsg({ type: "error", text: "Erro ao extrair jogos da Steam." });
      }
    } finally {
      setIsExtractingSteam(false);
    }
  };

  // DIRECT FAST IMPORT (Without Preview)
  const handleDirectImport = async () => {
    const lines = textList
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 1);

    if (lines.length === 0) {
      alert("Escreve ou cola pelo menos um nome de jogo.");
      return;
    }

    setIsSaving(true);
    setResultMsg(null);

    try {
      const res = await fetch("/api/batch-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titles: lines,
          platform: resolvedBasePlatform,
          originType,
          status: isPlatinumDefault ? "PLATINUM" : status,
          isArchived: isArchivedDefault,
          hasSavefile: hasSavefileDefault,
          hasAchievements: hasAchievementsDefault,
          isPlatinum: isPlatinumDefault,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na importação direta.");

      setResultMsg({ type: "success", text: data.message });
      setTextList("");
      onImportSuccess();
      setTimeout(() => {
        onClose();
        setStep("input");
      }, 1200);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setResultMsg({ type: "error", text: err.message });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // STEP 2: SAVE SELECTED DETECTED GAMES
  const handleSavePreview = async () => {
    const selectedGames = detectedGames.filter((g) => g.selected);

    if (selectedGames.length === 0) {
      alert("Seleciona pelo menos um jogo novo para guardar.");
      return;
    }

    setIsSaving(true);
    setResultMsg(null);

    try {
      const payload = selectedGames.map((g) => ({
        title: g.cleanTitle,
        platform: g.detectedPlatform || resolvedBasePlatform,
        originType: g.detectedOrigin || originType,
        repackGroup: g.detectedRepack || null,
        status: g.isPlatinum ? "PLATINUM" : status,
        coverUrl: g.coverUrl,
        bannerUrl: g.bannerUrl,
        releaseYear: g.releaseYear,
        genres: g.genres,
        diskSpace: g.diskSpace,
        isArchived: g.isArchived,
        hasSavefile: g.hasSavefile,
        hasAchievements: g.hasAchievements,
        isPlatinum: g.isPlatinum,
      }));

      const res = await fetch("/api/batch-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          games: payload,
          platform: resolvedBasePlatform,
          originType,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao guardar jogos.");

      setResultMsg({ type: "success", text: data.message });
      onImportSuccess();
      setTimeout(() => {
        onClose();
        setStep("input");
        setTextList("");
        setDetectedGames([]);
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setResultMsg({ type: "error", text: err.message });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk toggles for preview - strictly respects duplicates
  const toggleSelectAll = (select: boolean) => {
    setDetectedGames((prev) =>
      prev.map((g) => ({
        ...g,
        selected: select ? !g.isDuplicate : false,
      }))
    );
  };

  const toggleArchiveAll = (archive: boolean) => {
    setDetectedGames((prev) =>
      prev.map((g) => ({ ...g, isArchived: archive }))
    );
  };

  const toggleSavefileAll = (val: boolean) => {
    setDetectedGames((prev) =>
      prev.map((g) => ({ ...g, hasSavefile: val }))
    );
  };

  const toggleAchievementsAll = (val: boolean) => {
    setDetectedGames((prev) =>
      prev.map((g) => ({ ...g, hasAchievements: val }))
    );
  };

  const togglePlatinumAll = (val: boolean) => {
    setDetectedGames((prev) =>
      prev.map((g) => ({ ...g, isPlatinum: val }))
    );
  };

  const updateSingleGame = (index: number, updates: Partial<DetectedGameItem>) => {
    setDetectedGames((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const duplicateCount = detectedGames.filter((g) => g.isDuplicate).length;
  const newGamesCount = detectedGames.filter((g) => !g.isDuplicate).length;
  const selectedCount = detectedGames.filter((g) => g.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Importador Inteligente em Lote</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  {step === "input" ? "1. Colar Jogos" : "2. Rever e Confirmar"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Pesquisa automática na Steam e base de videojogos da Wikipedia (Consolas e PC)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {step === "input" ? (
            /* STEP 1: INPUT LIST & DEFAULT SETTINGS */
            <>
              {/* Method Switcher: Manual Paste vs Steam Profile Extractor */}
              <div className="flex items-center gap-2 p-1.5 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setInputMode("text")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    inputMode === "text"
                      ? "bg-zinc-800 text-white shadow-md border border-zinc-700"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <span>📝 Colar Lista de Jogos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("steam")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    inputMode === "steam"
                      ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                      : "text-sky-400 hover:text-sky-300 hover:bg-sky-950/20"
                  }`}
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>🎮 Importar Direto da Steam</span>
                </button>
              </div>

              {inputMode === "steam" ? (
                /* STEAM PROFILE EXTRACTION VIEW */
                <div className="p-4 bg-sky-950/20 border border-sky-500/30 rounded-2xl space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Extrair Jogos da tua Conta Steam</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Insere o teu ID ou URL de perfil Steam. O sistema extrai automaticamente os jogos com capas 600x900 em alta resolução, cabeçalhos, conquistas e estimativas de duração do HLTB!
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">ID / URL Personalizada Steam:</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={steamIdentifier}
                        onChange={(e) => setSteamIdentifier(e.target.value)}
                        placeholder="Ex: perfil-exemplo ou 76561198392108253"
                        className="flex-1 bg-zinc-950 border border-zinc-700 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setSteamIdentifier("perfil-exemplo")}
                        className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-sky-300 text-xs font-semibold rounded-xl border border-zinc-700 transition-colors cursor-pointer shrink-0"
                      >
                        Carregar perfil-exemplo (Colecionador)
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
                    <div className="font-bold text-sky-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-sky-400" />
                      <span>Como funciona com a Privacidade da Steam:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      • Se o teu perfil tiver <strong>"Detalhes dos Jogos"</strong> como Privado, o importador recupera automaticamente todos os jogos verificados através dos <strong>crachás públicos e vitrines</strong>.
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      • Para extrair a tua <strong>biblioteca completa (100%)</strong> de uma só vez via API, acede ao Steam $\rightarrow$ <em>Editar Perfil</em> $\rightarrow$ <em>Privacidade</em> $\rightarrow$ muda <em>"Detalhes dos jogos"</em> para <strong>Público</strong>.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Row 1: Platform & Origin & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-2xl text-xs">
                {/* Platform Base with Consoles */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-semibold text-[11px]">Plataforma Base:</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomPlatform(!isCustomPlatform)}
                      className="text-indigo-400 hover:text-indigo-300 text-[10px] underline"
                    >
                      {isCustomPlatform ? "Ver lista padrão" : "+ Outra consola"}
                    </button>
                  </div>

                  {isCustomPlatform ? (
                    <input
                      type="text"
                      placeholder="Ex: PS Vita, Atari, Steam Deck..."
                      value={customPlatform}
                      onChange={(e) => setCustomPlatform(e.target.value)}
                      className="w-full bg-zinc-900 border border-indigo-500 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                    />
                  ) : (
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                </div>

                {/* Origin */}
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold text-[11px]">Origem Base:</label>
                  <select
                    value={originType}
                    onChange={(e) => setOriginType(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="STEAM">🎮 Steam</option>
                    <option value="REPACK">🏴‍☠️ Repack / Pirata</option>
                    <option value="GOG">🟣 GOG (DRM-Free)</option>
                    <option value="EPIC">⚡ Epic Games</option>
                    <option value="EMULATOR">👾 Emulador / ROM</option>
                    <option value="PHYSICAL">📦 Cópia Física</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold text-[11px]">Estado Inicial:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="AVAILABLE">📦 Disponível</option>
                    <option value="BACKLOG">⏳ Backlog</option>
                    <option value="PLAYING">🎮 A Jogar</option>
                    <option value="COMPLETED">✅ Concluído</option>
                    <option value="PLATINUM">🏆 Platinado</option>
                    <option value="PAUSED">⏸️ Em Pausa</option>
                    <option value="NOT_STARTED">⚪ Não Iniciado</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Collection Attributes (Arquivo, Savefile, Conquistas, Platinado) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-2xl text-xs">
                {/* Arquivado */}
                <button
                  type="button"
                  onClick={() => setIsArchivedDefault(!isArchivedDefault)}
                  className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isArchivedDefault
                      ? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm shadow-amber-950/40"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Marcar como guardado no arquivo"
                >
                  <Archive className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isArchivedDefault ? "Arquivado" : "Não Arquivado"}</span>
                </button>

                {/* Savefile */}
                <button
                  type="button"
                  onClick={() => setHasSavefileDefault(!hasSavefileDefault)}
                  className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    hasSavefileDefault
                      ? "bg-sky-500/20 border-sky-500/60 text-sky-300 shadow-sm shadow-sky-950/40"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Indicar se tens o savegame guardado"
                >
                  <Save className="w-3.5 h-3.5 text-sky-400" />
                  <span>{hasSavefileDefault ? "Com Save" : "Sem Save"}</span>
                </button>

                {/* Conquistas / Achievements */}
                <button
                  type="button"
                  onClick={() => setHasAchievementsDefault(!hasAchievementsDefault)}
                  className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    hasAchievementsDefault
                      ? "bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-sm shadow-purple-950/40"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Indicar se tens o ficheiro de conquistas / achievements"
                >
                  <Trophy className="w-3.5 h-3.5 text-purple-400" />
                  <span>{hasAchievementsDefault ? "Com Conquistas" : "Sem Conquistas"}</span>
                </button>

                {/* Platinado */}
                <button
                  type="button"
                  onClick={() => setIsPlatinumDefault(!isPlatinumDefault)}
                  className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isPlatinumDefault
                      ? "bg-amber-500/25 border-amber-500/60 text-amber-300 shadow-sm shadow-amber-950/40"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Marcar como platinado / 100% concluído"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isPlatinumDefault ? "Platinado 👑" : "Não Platinado"}</span>
                </button>
              </div>

              {/* Textarea (only in text mode) */}
              {inputMode === "text" && (
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <label className="text-zinc-200 font-semibold flex items-center gap-1.5">
                      <span>Lista de Jogos (um por linha)</span>
                      <span className="text-[11px] text-zinc-500 font-normal">
                        (funciona com PC, Steam, PS5, Switch, retro, repacks e nomes em qualquer formato)
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowSteamGuide(!showSteamGuide)}
                        className="text-sky-400 hover:text-sky-300 text-[11px] flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <span>🎮 Como copiar da Steam?</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextList(sampleGames)}
                        className="text-indigo-400 hover:text-indigo-300 text-[11px] underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        Preencher exemplo
                      </button>
                    </div>
                  </div>

                  {showSteamGuide && (
                    <div className="p-3 bg-sky-950/30 border border-sky-500/30 rounded-xl text-xs text-sky-200 space-y-1.5 animate-in fade-in duration-150">
                      <div className="font-bold flex items-center gap-1.5 text-sky-300">
                        <span>💡 3 Formas fáceis de importar a tua biblioteca Steam:</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-300 leading-relaxed">
                        <li>
                          <strong>Copiar da App Steam:</strong> Na aplicação Steam do teu PC, vai a <strong>Biblioteca</strong>, muda para a vista em lista (ou seleciona os teus jogos com <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 font-mono text-[10px]">Ctrl+A</kbd>) e prime <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 font-mono text-[10px]">Ctrl+C</kbd>. Depois basta colar aqui no campo de texto!
                        </li>
                        <li>
                          <strong>Lista de Desejos / Wishlist Steam:</strong> No teu navegador ou na Steam, abre a tua Wishlist e copia os títulos dos jogos diretamente para esta caixa.
                        </li>
                        <li>
                          <strong>Jogos Steam Já Instalados no PC:</strong> Usa a ferramenta <strong>"Scanner de Pastas"</strong> no menu superior e indica a tua pasta <code>steamapps\common</code> (ex: <code>C:\Program Files (x86)\Steam\steamapps\common</code> ou <code>D:\SteamLibrary\steamapps\common</code>).
                        </li>
                      </ol>
                    </div>
                  )}

                  <textarea
                    rows={8}
                    value={textList}
                    onChange={(e) => setTextList(e.target.value)}
                    placeholder={`Cola a tua lista, por exemplo:&#10;1. The Legend of Zelda: Tears of the Kingdom&#10;2. God of War Ragnarok&#10;3. Cyberpunk 2077 [FitGirl Repack]&#10;Bloodborne&#10;Gran Turismo 4`}
                    className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none shadow-inner"
                  />
                </div>
              )}

              {resultMsg && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 border ${
                    resultMsg.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{resultMsg.text}</span>
                </div>
              )}
            </>
          ) : (
            /* STEP 2: PREVIEW & SELECTION */
            <>
              {/* Duplicate Protection Alert Banner */}
              {duplicateCount > 0 && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Detetámos <strong>{duplicateCount}</strong> jogo{duplicateCount > 1 ? "s" : ""}{" "}
                      já presente{duplicateCount > 1 ? "s" : ""} na tua biblioteca ou repetido{duplicateCount > 1 ? "s" : ""} na lista.
                      Estão <strong>desmarcados automaticamente</strong> para evitar duplicados.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHideDuplicates(!hideDuplicates)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {hideDuplicates ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver todos ({detectedGames.length})</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Ocultar duplicados ({duplicateCount})</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Batch Actions Toolbar */}
              <div className="space-y-2 p-3 bg-zinc-950/70 border border-zinc-800 rounded-2xl text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-zinc-300 font-medium">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>
                      Detetados <strong className="text-white">{detectedGames.length}</strong> jogos:{" "}
                      <strong className="text-emerald-400">{newGamesCount} novos</strong>
                      {duplicateCount > 0 && (
                        <>
                          , <strong className="text-amber-400">{duplicateCount} duplicados</strong>
                        </>
                      )}{" "}
                      — (<strong className="text-indigo-400">{selectedCount}</strong> selecionados para importar)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSelectAll(true)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] cursor-pointer"
                      title="Selecionar apenas os jogos novos não duplicados"
                    >
                      Selecionar Novos
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSelectAll(false)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[11px] cursor-pointer"
                    >
                      Desmarcar
                    </button>
                  </div>
                </div>

                {/* Bulk attribute toggle buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/60 text-[11px]">
                  <span className="text-zinc-500">Marcar em lote:</span>
                  <button
                    type="button"
                    onClick={() => toggleArchiveAll(true)}
                    className="px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                  >
                    <Archive className="w-3 h-3" />
                    Arquivar Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSavefileAll(true)}
                    className="px-2 py-0.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    Com Savefile
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAchievementsAll(true)}
                    className="px-2 py-0.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 cursor-pointer"
                  >
                    <Trophy className="w-3 h-3" />
                    Com Conquistas
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePlatinumAll(true)}
                    className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 cursor-pointer"
                  >
                    <Crown className="w-3 h-3" />
                    Platinar Todos
                  </button>
                </div>
              </div>

              {/* Detected Games Cards List */}
              <div className="space-y-2.5">
                {detectedGames
                  .map((game, originalIdx) => ({ game, originalIdx }))
                  .filter(({ game }) => !hideDuplicates || !game.isDuplicate)
                  .map(({ game, originalIdx: idx }) => (
                    <div
                      key={idx}
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl border transition-all ${
                        game.isDuplicate
                          ? "bg-amber-950/15 border-amber-500/30 opacity-75"
                          : game.selected
                          ? "bg-zinc-900/90 border-indigo-500/40 shadow-sm"
                          : "bg-zinc-950/50 border-zinc-800/80 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Checkbox with Duplicate Safeguard */}
                        <button
                          type="button"
                          onClick={() => {
                            if (game.isDuplicate && !game.selected) {
                              const confirmDup = confirm(
                                `Atenção: "${game.cleanTitle}" já se encontra na tua biblioteca (${game.duplicateReason || ""}).\n\nDesejas mesmo forçar a importação deste duplicado?`
                              );
                              if (!confirmDup) return;
                            }
                            updateSingleGame(idx, { selected: !game.selected });
                          }}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                            game.selected
                              ? game.isDuplicate
                                ? "bg-amber-600 border-amber-500 text-white shadow-sm"
                                : "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                              : "border-zinc-700 bg-zinc-900 text-transparent"
                          }`}
                          title={
                            game.isDuplicate
                              ? "Aviso: este jogo já existe na biblioteca"
                              : "Selecionar para importar"
                          }
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        {/* Thumbnail Cover */}
                        <div
                          onClick={() =>
                            setEditingCoverIndex(editingCoverIndex === idx ? null : idx)
                          }
                          className="w-14 h-20 rounded-xl bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/60 flex items-center justify-center relative group cursor-pointer"
                          title="Clica para alterar o link da capa"
                        >
                          {game.coverUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={game.coverUrl}
                              alt={game.cleanTitle}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-1 text-center text-[10px] text-zinc-500">
                              <span>🎮</span>
                              <span>Sem capa</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-white font-semibold">
                            <Link className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>

                      {/* Game Details & Editable Title */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={game.cleanTitle}
                            onChange={(e) => updateSingleGame(idx, { cleanTitle: e.target.value })}
                            className="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-indigo-500 font-bold text-sm text-white focus:outline-none w-full truncate py-0.5"
                            title="Clica para editar o título se necessário"
                          />
                          {game.isDuplicate && (
                            <span
                              className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1"
                              title={game.duplicateReason}
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span>{game.duplicateReason || "Já na biblioteca"}</span>
                            </span>
                          )}
                        </div>

                        {/* Cover URL inline editor if opened */}
                        {editingCoverIndex === idx && (
                          <div className="my-1.5 flex items-center gap-1.5 text-xs">
                            <input
                              type="text"
                              placeholder="Cola o URL direto da imagem..."
                              value={game.coverUrl || ""}
                              onChange={(e) => updateSingleGame(idx, { coverUrl: e.target.value })}
                              className="w-full px-2 py-1 bg-zinc-950 border border-indigo-500 rounded-lg text-xs text-zinc-200"
                            />
                            <button
                              type="button"
                              onClick={() => setEditingCoverIndex(null)}
                              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs"
                            >
                              OK
                            </button>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 mt-1">
                          <OriginBadge
                            originType={game.detectedOrigin}
                            repackGroup={game.detectedRepack}
                          />

                          {/* Platform Selector per item */}
                          <select
                            value={game.detectedPlatform}
                            onChange={(e) =>
                              updateSingleGame(idx, { detectedPlatform: e.target.value })
                            }
                            className="bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-300 text-[11px] focus:outline-none focus:border-indigo-500 cursor-pointer"
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

                          {game.releaseYear && (
                            <>
                              <span>•</span>
                              <span>{game.releaseYear}</span>
                            </>
                          )}
                          {game.metaSource && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                              {game.metaSource === "steam"
                                ? "Steam"
                                : game.metaSource === "wikipedia"
                                ? "Wikipedia"
                                : "Box Art"}
                            </span>
                          )}
                          {game.timeToBeat && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono">
                              ⏱️ {game.timeToBeat}
                            </span>
                          )}
                          {game.genres && (
                            <span className="text-[10px] text-zinc-400 max-w-[180px] truncate" title={game.genres}>
                              🏷️ {game.genres}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Feature Toggles (Arquivado, Savefile, Conquistas, Platinado) */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {/* Arquivado */}
                        <button
                          type="button"
                          onClick={() => updateSingleGame(idx, { isArchived: !game.isArchived })}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            game.isArchived
                              ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-950/40"
                              : "bg-zinc-800/80 border-zinc-700 text-zinc-500 hover:text-zinc-300"
                          }`}
                          title={game.isArchived ? "Guardado no arquivo" : "Marcar como arquivado"}
                        >
                          <Archive className="w-3 h-3 text-amber-400" />
                          <span>Arquivo</span>
                        </button>

                        {/* Savefile */}
                        <button
                          type="button"
                          onClick={() => updateSingleGame(idx, { hasSavefile: !game.hasSavefile })}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            game.hasSavefile
                              ? "bg-sky-500/20 border-sky-500/50 text-sky-300"
                              : "bg-zinc-800/80 border-zinc-700 text-zinc-500 hover:text-zinc-300"
                          }`}
                          title={game.hasSavefile ? "Tem savefile guardado" : "Sem savefile"}
                        >
                          <Save className="w-3 h-3 text-sky-400" />
                          <span>Save</span>
                        </button>

                        {/* Achievements */}
                        <button
                          type="button"
                          onClick={() =>
                            updateSingleGame(idx, { hasAchievements: !game.hasAchievements })
                          }
                          className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            game.hasAchievements
                              ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                              : "bg-zinc-800/80 border-zinc-700 text-zinc-500 hover:text-zinc-300"
                          }`}
                          title={
                            game.hasAchievements ? "Tem conquistas guardadas" : "Sem conquistas"
                          }
                        >
                          <Trophy className="w-3 h-3 text-purple-400" />
                          <span>Conquistas</span>
                        </button>

                        {/* Platinum */}
                        <button
                          type="button"
                          onClick={() => updateSingleGame(idx, { isPlatinum: !game.isPlatinum })}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            game.isPlatinum
                              ? "bg-amber-500/25 border-amber-500/60 text-amber-300 shadow-sm shadow-amber-950/40"
                              : "bg-zinc-800/80 border-zinc-700 text-zinc-500 hover:text-zinc-300"
                          }`}
                          title={game.isPlatinum ? "Platinado / 100%" : "Não platinado"}
                        >
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>Platinado</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-950/80 shrink-0">
          {step === "input" ? (
            <>
              <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {inputMode === "steam"
                    ? "Extração direta da API Steam (com resolução de crachás públicos e vitrines)."
                    : "Pesquisa multi-fonte: Steam Store + Base de Videojogos da Wikipedia."}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>

                {inputMode === "steam" ? (
                  <button
                    type="button"
                    disabled={isExtractingSteam || !steamIdentifier.trim()}
                    onClick={handleExtractFromSteam}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-sky-600/30 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isExtractingSteam ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>A comunicar com a Steam...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Extrair e Rever Jogos da Steam</span>
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={isAnalyzing || isSaving || !textList.trim()}
                      onClick={handleDirectImport}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer hidden sm:block"
                      title="Importar imediatamente sem rever (duplicados ignorados automaticamente)"
                    >
                      Importação Rápida
                    </button>

                    <button
                      type="button"
                      disabled={isAnalyzing || !textList.trim()}
                      onClick={handleAnalyze}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>A pesquisar capas (Steam + Wikipedia)...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Analisar e Rever Capas</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep("input")}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao texto</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={isSaving || selectedCount === 0}
                  onClick={handleSavePreview}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>A guardar na coleção...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>
                        {selectedCount === 0
                          ? "Nenhum jogo selecionado"
                          : `Guardar ${selectedCount} Jogo${selectedCount > 1 ? "s" : ""} na Coleção`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
