import React, { useState, useEffect } from "react";
import { GameItem, GameMetadataResult } from "@/types/game";
import { playUiSound } from "@/lib/ui-sfx";
import { X, Search, Loader2, Sparkles, Image as ImageIcon, Save, HardDrive, Archive, Trophy, Crown, Tag, Calendar, Link2, Gamepad2 } from "lucide-react";

interface GameFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<GameItem>) => Promise<void>;
  initialGame?: GameItem | null;
  defaultIsWishlist?: boolean;
}

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

const REPACK_GROUPS = [
  "FitGirl Repack",
  "DODI Repack",
  "ElAmigos",
  "FLT",
  "Rune",
  "EMPRESS",
  "Razor1911",
  "SKIDROW",
  "Outro",
];

export function GameFormModal({
  isOpen,
  onClose,
  onSave,
  initialGame,
  defaultIsWishlist = false,
}: GameFormModalProps) {
  const isEditing = Boolean(initialGame);

  // Form State
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("PC");
  const [originType, setOriginType] = useState("REPACK");
  const [repackGroup, setRepackGroup] = useState("");
  const [status, setStatus] = useState("BACKLOG");
  const [rating, setRating] = useState<number | "">("");
  const [coverUrl, setCoverUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [releaseYear, setReleaseYear] = useState<number | "">("");
  const [genres, setGenres] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [executablePath, setExecutablePath] = useState("");
  const [saveLocation, setSaveLocation] = useState("");
  const [diskSpace, setDiskSpace] = useState("");
  const [pcRequirements, setPcRequirements] = useState("");
  const [tags, setTags] = useState("");
  const [customCategories, setCustomCategories] = useState("");
  const [timeToBeat, setTimeToBeat] = useState("");
  const [isInstalled, setIsInstalled] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [hasSavefile, setHasSavefile] = useState(false);
  const [hasAchievements, setHasAchievements] = useState(false);
  const [isPlatinum, setIsPlatinum] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const [wishlistStatus, setWishlistStatus] = useState("WAITING_CRACK");
  const [wishlistPriority, setWishlistPriority] = useState("MEDIUM");
  const [targetPrice, setTargetPrice] = useState<number | "">("");
  const [installNotes, setInstallNotes] = useState("");
  const [userReview, setUserReview] = useState("");
  const [screenshots, setScreenshots] = useState("");
  const [hoursPlayed, setHoursPlayed] = useState<number>(0);
  const [gameVersion, setGameVersion] = useState("");
  const [versionDate, setVersionDate] = useState("");
  const [externalLink, setExternalLink] = useState("");

  // Metadata Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingMeta, setIsSearchingMeta] = useState(false);
  const [metaResults, setMetaResults] = useState<GameMetadataResult[]>([]);
  const [showMetaDropdown, setShowMetaDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialGame) {
      setTitle(initialGame.title || "");
      setPlatform(initialGame.platform || "PC");
      setOriginType(initialGame.originType || "STEAM");
      setRepackGroup(initialGame.repackGroup || "");
      setStatus(initialGame.status || "BACKLOG");
      setRating(initialGame.rating ?? "");
      setCoverUrl(initialGame.coverUrl || "");
      setBannerUrl(initialGame.bannerUrl || "");
      setReleaseYear(initialGame.releaseYear ?? "");
      setGenres(initialGame.genres || "");
      setStorageLocation(initialGame.storageLocation || "");
      setExecutablePath(initialGame.executablePath || "");
      setSaveLocation(initialGame.saveLocation || "");
      setDiskSpace(initialGame.diskSpace || "");
      setPcRequirements(initialGame.pcRequirements || "");
      setTags(initialGame.tags || "");
      setCustomCategories(initialGame.customCategories || "");
      setTimeToBeat(initialGame.timeToBeat || "");
      setIsInstalled(initialGame.isInstalled || false);
      setIsArchived(initialGame.isArchived || false);
      setHasSavefile(initialGame.hasSavefile || false);
      setHasAchievements(initialGame.hasAchievements || false);
      setIsPlatinum(initialGame.isPlatinum || initialGame.status === "PLATINUM" || false);
      setIsWishlist(initialGame.isWishlist || false);
      setWishlistStatus(initialGame.wishlistStatus || "WAITING_CRACK");
      setWishlistPriority(initialGame.wishlistPriority || "MEDIUM");
      setTargetPrice(initialGame.targetPrice ?? "");
      setInstallNotes(initialGame.installNotes || "");
      setUserReview(initialGame.userReview || "");
      setScreenshots(initialGame.screenshots || "");
      setHoursPlayed(initialGame.hoursPlayed || 0);
      setGameVersion(initialGame.gameVersion || "");
      setVersionDate(initialGame.versionDate ? initialGame.versionDate.split("T")[0] : "");
      setExternalLink(initialGame.externalLink || "");
      setSearchQuery(initialGame.title || "");
    } else {
      // Default reset
      setTitle("");
      setPlatform("PC");
      setOriginType("REPACK");
      setRepackGroup("");
      setStatus("BACKLOG");
      setRating("");
      setCoverUrl("");
      setBannerUrl("");
      setReleaseYear("");
      setGenres("");
      setStorageLocation("");
      setExecutablePath("");
      setSaveLocation("");
      setDiskSpace("");
      setPcRequirements("");
      setTags("");
      setCustomCategories("");
      setTimeToBeat("");
      setIsInstalled(false);
      setIsArchived(false);
      setHasSavefile(false);
      setHasAchievements(false);
      setIsPlatinum(false);
      setIsWishlist(defaultIsWishlist);
      setWishlistStatus("WAITING_CRACK");
      setWishlistPriority("MEDIUM");
      setTargetPrice("");
      setInstallNotes("");
      setUserReview("");
      setScreenshots("");
      setHoursPlayed(0);
      setGameVersion("");
      setVersionDate("");
      setExternalLink("");
      setSearchQuery("");
      setMetaResults([]);
    }
  }, [initialGame, isOpen]);

  if (!isOpen) return null;

  // Search public Steam metadata for auto-completion
  const handleSearchMetadata = async (queryToSearch: string) => {
    if (!queryToSearch || queryToSearch.trim().length < 2) return;
    setIsSearchingMeta(true);
    setShowMetaDropdown(true);

    try {
      const res = await fetch(`/api/lookup?q=${encodeURIComponent(queryToSearch.trim())}`);
      const data = await res.json();
      setMetaResults(data.results || []);
    } catch (err) {
      console.error("Erro ao pesquisar metadados:", err);
    } finally {
      setIsSearchingMeta(false);
    }
  };

  const handleSelectMeta = (item: GameMetadataResult) => {
    setTitle(item.name);
    if (item.releaseYear) setReleaseYear(item.releaseYear);
    if (item.genres && item.genres.length > 0) setGenres(item.genres.join(", "));
    if (item.coverUrl) setCoverUrl(item.coverUrl);
    if (item.bannerUrl) setBannerUrl(item.bannerUrl);
    if (item.diskSpace) setDiskSpace(item.diskSpace);
    if (item.pcRequirements) setPcRequirements(item.pcRequirements);
    if (item.screenshots) setScreenshots(item.screenshots);
    if (item.timeToBeat) setTimeToBeat(item.timeToBeat);
    if (item.externalLink) setExternalLink(item.externalLink);
    setShowMetaDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        platform,
        originType,
        repackGroup: originType === "REPACK" ? repackGroup.trim() || null : null,
        status,
        rating: initialGame ? initialGame.rating : (rating !== "" ? Number(rating) : null),
        coverUrl: coverUrl.trim() || null,
        bannerUrl: bannerUrl.trim() || null,
        releaseYear: releaseYear !== "" ? Number(releaseYear) : null,
        genres: genres.trim() || null,
        storageLocation: storageLocation.trim() || null,
        executablePath: executablePath.trim() || null,
        saveLocation: saveLocation.trim() || null,
        diskSpace: diskSpace.trim() || null,
        pcRequirements: pcRequirements.trim() || null,
        tags: tags.trim() || null,
        customCategories: customCategories.trim() || null,
        timeToBeat: timeToBeat.trim() || null,
        isInstalled,
        isArchived,
        hasSavefile,
        hasAchievements,
        isPlatinum,
        isWishlist,
        wishlistStatus: isWishlist ? wishlistStatus : null,
        wishlistPriority: isWishlist ? wishlistPriority : null,
        targetPrice: isWishlist && targetPrice !== "" ? Number(targetPrice) : null,
        installNotes: installNotes.trim() || null,
        gameVersion: gameVersion.trim() || null,
        versionDate: versionDate ? new Date(versionDate).toISOString() : null,
        externalLink: externalLink.trim() || null,
        userReview: initialGame ? initialGame.userReview : (userReview.trim() || null),
        screenshots: screenshots.trim() || null,
        hoursPlayed: initialGame ? initialGame.hoursPlayed : (Number(hoursPlayed) || 0),
      });
      onClose();
    } catch (err) {
      console.error("Erro ao guardar jogo:", err);
      alert("Erro ao guardar jogo. Verifica os dados e tenta novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                {isEditing ? `Editar "${initialGame?.title}"` : "Adicionar Jogo à Coleção"}
              </h2>
              <p className="text-[11px] text-zinc-400">
                Preenche os dados manualmente ou usa a pesquisa rápida de metadados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Metadata Auto-Lookup Box */}
          <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Auto-preenchimento (Pesquisar Capa, Ano e Géneros):
              </label>
              {isSearchingMeta && (
                <div className="flex items-center gap-1.5 text-[11px] text-indigo-300">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  A pesquisar...
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Cyberpunk 2077, Elden Ring, Zelda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchMetadata(searchQuery);
                  }
                }}
                className="flex-1 px-3.5 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleSearchMetadata(searchQuery)}
                disabled={isSearchingMeta}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                Pesquisar
              </button>
            </div>

            {/* Dropdown of search results */}
            {showMetaDropdown && metaResults.length > 0 && (
              <div className="mt-3 bg-zinc-950 border border-indigo-500/40 rounded-xl p-2 max-h-48 overflow-y-auto space-y-1.5 shadow-xl">
                <div className="text-[11px] text-zinc-400 px-2 py-0.5 font-medium">
                  Resultados encontrados (clica para preencher):
                </div>
                {metaResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectMeta(item)}
                    className="w-full p-2 flex items-center gap-3 text-left hover:bg-indigo-950/50 rounded-lg transition-colors group"
                  >
                    {item.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.coverUrl}
                        alt={item.name}
                        className="w-8 h-10 object-cover rounded bg-zinc-800 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-10 bg-zinc-800 rounded flex items-center justify-center text-xs">
                        🎮
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-zinc-200 group-hover:text-indigo-300 truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {item.releaseYear ? `${item.releaseYear} • ` : ""}
                        {item.genres?.slice(0, 2).join(", ")}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-zinc-300">
                Título do Jogo <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Ghost of Tsushima"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Plataforma</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {CONSOLE_GROUPS.map((cg) => (
                  <optgroup key={cg.group} label={cg.group}>
                    {cg.options.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Origin Type & Repack Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-zinc-950/40 border border-zinc-800/80 rounded-2xl">
            <div className="space-y-1">
              <label className="text-xs font-medium text-amber-300">
                Origem / Formato da Cópia
              </label>
              <select
                value={originType}
                onChange={(e) => setOriginType(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="REPACK">🏴‍☠️ Repack / Cópia Não Oficial</option>
                <option value="STEAM">🎮 Steam</option>
                <option value="GOG">🟣 GOG (DRM-Free)</option>
                <option value="EPIC">⚡ Epic Games Store</option>
                <option value="EMULATOR">👾 Emulador / ROM</option>
                <option value="PHYSICAL">📦 Cópia Física (Caixa/Disco)</option>
                <option value="OTHER">Outro Launcher / Próprio</option>
              </select>
            </div>

            {originType === "REPACK" ? (
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Grupo de Repack / Release
                </label>
                <input
                  type="text"
                  list="repack-suggestions"
                  placeholder="Ex: FitGirl, DODI, ElAmigos..."
                  value={repackGroup}
                  onChange={(e) => setRepackGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
                <datalist id="repack-suggestions">
                  {REPACK_GROUPS.map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Ano de Lançamento
                </label>
                <input
                  type="number"
                  placeholder="Ex: 2024"
                  value={releaseYear}
                  onChange={(e) =>
                    setReleaseYear(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Wishlist / Radar Toggle Box */}
          <div className="p-3 bg-pink-950/20 border border-pink-500/30 rounded-2xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-pink-300">
              <input
                type="checkbox"
                checked={isWishlist}
                onChange={(e) => setIsWishlist(e.target.checked)}
                className="w-4 h-4 rounded text-pink-600 focus:ring-0 bg-zinc-900 border-zinc-700"
              />
              <span>🎯 Este jogo é para a Wishlist / Radar de Jogos Futuros?</span>
            </label>

            {isWishlist && (
              <div className="pt-2.5 border-t border-pink-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-zinc-400 font-medium">Estado no radar:</span>
                  <select
                    value={wishlistStatus}
                    onChange={(e) => setWishlistStatus(e.target.value)}
                    className="w-full bg-zinc-950 border border-pink-500/40 rounded-xl px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-pink-500 cursor-pointer text-xs"
                  >
                    <option value="WAITING_CRACK">🏴‍☠️ Aguardar Crack / Repack</option>
                    <option value="WAITING_SALE">🏷️ Aguardar Promoção / Desconto</option>
                    <option value="WAITING_RELEASE">📅 Aguardar Data de Lançamento</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 font-medium">Prioridade:</span>
                  <select
                    value={wishlistPriority}
                    onChange={(e) => setWishlistPriority(e.target.value)}
                    className="w-full bg-zinc-950 border border-pink-500/40 rounded-xl px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-pink-500 cursor-pointer text-xs"
                  >
                    <option value="HIGH">🔥 Alta Prioridade</option>
                    <option value="MEDIUM">⭐ Média Prioridade</option>
                    <option value="LOW">⏳ Baixa Prioridade</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 font-medium">Preço Alvo (€):</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="Ex: 19.99"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value ? Number(e.target.value) : "")}
                    className="w-full bg-zinc-950 border border-pink-500/40 rounded-xl px-2.5 py-1.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-pink-500 text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Estado do Jogo</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="AVAILABLE">📦 Disponível</option>
              <option value="BACKLOG">⏳ Backlog</option>
              <option value="PLAYING">🎮 A Jogar</option>
              <option value="COMPLETED">✅ Concluído</option>
              <option value="PLATINUM">🏆 Platinado</option>
              <option value="PAUSED">⏸️ Em Pausa</option>
              <option value="NOT_STARTED">⚪ Não Iniciado</option>
              {status === "ABANDONED" && (
                <option value="ABANDONED">❌ Abandonado</option>
              )}
            </select>
          </div>

          {/* Installation Details & Storage Location */}
          <div className="space-y-3 p-3.5 bg-zinc-950/40 border border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInstalled}
                  onChange={(e) => setIsInstalled(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-zinc-900 border-zinc-700"
                />
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  Está instalado no computador / dispositivo atualmente?
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400">
                  Localização / Pasta
                </label>
                <input
                  type="text"
                  placeholder="Ex: SSD D:\Jogos\Cyberpunk 2077"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400">
                  Caminho do Executável (.exe ou steam://)
                </label>
                <input
                  type="text"
                  placeholder="Ex: D:\Jogos\Cyberpunk 2077\bin\x64\Cyberpunk2077.exe"
                  value={executablePath}
                  onChange={(e) => setExecutablePath(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-emerald-400">
                  Pasta dos Saves (Savegames)
                </label>
                <input
                  type="text"
                  placeholder="Ex: %APPDATA%\Goldberg SteamEmu Saves\1091500"
                  value={saveLocation}
                  onChange={(e) => setSaveLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400">
                  Espaço em Disco Necessário
                </label>
                <input
                  type="text"
                  placeholder="Ex: 70 GB"
                  value={diskSpace}
                  onChange={(e) => setDiskSpace(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Versão do Jogo & Data do Patch / Instalação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Versão do Jogo / Patch Atual</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: v1.0.4.1, Build 14205, v1.6.0"
                  value={gameVersion}
                  onChange={(e) => setGameVersion(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Data da Versão / Instalação</span>
                </label>
                <input
                  type="date"
                  value={versionDate}
                  onChange={(e) => setVersionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Install Notes & Patches */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">
                Notas de Instalação, Crack, Mods & Saves
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Patch 1.5 aplicado. Crack EMPRESS v2. Requer desativar Defender temporariamente. Save na pasta AppData/Roaming..."
                value={installNotes}
                onChange={(e) => setInstallNotes(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono resize-none"
              />
            </div>
          </div>

          {/* Attributes: Arquivo, Savefile, Conquistas, Platinado */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => {
                playUiSound("toggle");
                setIsArchived((v) => !v);
              }}
              className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isArchived
                  ? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm"
                  : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Arquivado</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playUiSound("toggle");
                setHasSavefile((v) => !v);
              }}
              className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                hasSavefile
                  ? "bg-sky-500/20 border-sky-500/60 text-sky-300 shadow-sm"
                  : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Save className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Com Savefile</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playUiSound("toggle");
                setHasAchievements((v) => !v);
              }}
              className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                hasAchievements
                  ? "bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-sm"
                  : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Conquistas</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playUiSound("platinum");
                setIsPlatinum((v) => !v);
              }}
              className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isPlatinum
                  ? "bg-amber-500/25 border-amber-500/60 text-amber-300 shadow-sm"
                  : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Platinado</span>
            </button>
          </div>

          {/* Cover & Genres */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                URL da Capa (Poster Vertical)
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Géneros</label>
              <input
                type="text"
                placeholder="Ex: RPG, Ação, Sci-Fi"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-sky-300 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Link do Jogo (Steam, FitGirl, GOG, IGDB, Site Oficial)</span>
              </label>
              <input
                type="url"
                placeholder="https://store.steampowered.com/... ou link direto do release/página"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-sky-500/30 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-sky-400 font-mono"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-zinc-300">
                Duração Estimada (HowLongToBeat)
              </label>
              <input
                type="text"
                placeholder="Ex: Campanha: ~25h | 100%: ~60h"
                value={timeToBeat}
                onChange={(e) => setTimeToBeat(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-zinc-300">
                Etiquetas / Tags Personalizadas (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: Comando, Splitscreen, Modded, Curto, Clássico"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-indigo-300 flex items-center gap-1.5">
                <span>📁 Categorias Personalizadas (separadas por vírgula)</span>
                <span className="text-[11px] text-zinc-500 font-normal">
                  (organização manual: ex. Favoritos, Buzz PS2, Jogos de Festa)
                </span>
              </label>
              <input
                type="text"
                placeholder="Ex: Favoritos, Buzz PS2, Infância, Co-op"
                value={customCategories}
                onChange={(e) => setCustomCategories(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-indigo-500/40 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>Screenshots / Imagens de Fundo (URLs separadas por vírgula):</span>
                <span className="text-[11px] text-zinc-500 font-normal">
                  (capturas de ecrã ou imagens de gameplay)
                </span>
              </label>
              <input
                type="text"
                placeholder="Ex: https://..., https://..."
                value={screenshots}
                onChange={(e) => setScreenshots(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
              {screenshots && screenshots.split(",").filter((s) => s.trim().startsWith("http")).length > 0 && (
                <div className="flex items-center gap-2 pt-1.5 overflow-x-auto pb-1">
                  {screenshots
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s.startsWith("http"))
                    .slice(0, 5)
                    .map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={url}
                        alt={`Screenshot ${i + 1}`}
                        className="w-20 h-12 object-cover rounded-lg border border-zinc-700 shrink-0 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Cover preview if present */}
          {coverUrl && (
            <div className="flex items-center gap-3 p-2.5 bg-zinc-950/70 rounded-2xl border border-zinc-800 text-xs text-zinc-400">
              <div className="case-poster w-12 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverUrl}
                  alt="Pré-visualização da capa"
                  className="w-full h-full object-cover"
                  onError={() => console.warn("Imagem de capa inválida")}
                />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-zinc-200">Pré-visualização da Capa</div>
                <div className="text-[11px] text-zinc-500 truncate max-w-sm font-mono">{coverUrl}</div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditing ? "Guardar Alterações" : "Adicionar à Coleção"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
