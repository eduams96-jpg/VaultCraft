"use client";

import React, { useState, useEffect } from "react";
import { MediaItem, MediaType, MediaStatus } from "@/types/media";
import {
  X,
  Search,
  Sparkles,
  Film,
  Tv,
  Star,
  HardDrive,
  Calendar,
  Layers,
  Save,
  Loader2,
} from "lucide-react";

interface MediaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<MediaItem>) => Promise<void>;
  initialMedia?: MediaItem | null;
}

export function MediaFormModal({
  isOpen,
  onClose,
  onSave,
  initialMedia,
}: MediaFormModalProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [type, setType] = useState<MediaType>("MOVIE");
  const [status, setStatus] = useState<MediaStatus>("PLAN_TO_WATCH");
  const [rating, setRating] = useState<string>("");
  const [releaseYear, setReleaseYear] = useState<string>("");
  const [posterUrl, setPosterUrl] = useState("");
  const [backdropUrl, setBackdropUrl] = useState("");
  const [genres, setGenres] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [director, setDirector] = useState("");
  const [cast, setCast] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<string>("");

  // Series fields
  const [totalSeasons, setTotalSeasons] = useState<string>("1");
  const [totalEpisodes, setTotalEpisodes] = useState<string>("");
  const [currentSeason, setCurrentSeason] = useState<string>("1");
  const [currentEpisode, setCurrentEpisode] = useState<string>("0");

  // Storage & Quality
  const [quality, setQuality] = useState("1080p Web-DL");
  const [storageLocation, setStorageLocation] = useState("");
  const [userReview, setUserReview] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  // Reset or populate on open
  useEffect(() => {
    if (initialMedia) {
      setTitle(initialMedia.title || "");
      setType(initialMedia.type || "MOVIE");
      setStatus(initialMedia.status || "PLAN_TO_WATCH");
      setRating(initialMedia.rating ? String(initialMedia.rating) : "");
      setReleaseYear(initialMedia.releaseYear ? String(initialMedia.releaseYear) : "");
      setPosterUrl(initialMedia.posterUrl || "");
      setBackdropUrl(initialMedia.backdropUrl || "");
      setGenres(initialMedia.genres || "");
      setSynopsis(initialMedia.synopsis || "");
      setDirector(initialMedia.director || "");
      setCast(initialMedia.cast || "");
      setDurationMinutes(initialMedia.durationMinutes ? String(initialMedia.durationMinutes) : "");
      setTotalSeasons(initialMedia.totalSeasons ? String(initialMedia.totalSeasons) : "1");
      setTotalEpisodes(initialMedia.totalEpisodes ? String(initialMedia.totalEpisodes) : "");
      setCurrentSeason(initialMedia.currentSeason ? String(initialMedia.currentSeason) : "1");
      setCurrentEpisode(initialMedia.currentEpisode ? String(initialMedia.currentEpisode) : "0");
      setQuality(initialMedia.quality || "1080p Web-DL");
      setStorageLocation(initialMedia.storageLocation || "");
      setUserReview(initialMedia.userReview || "");
      setIsFavorite(Boolean(initialMedia.isFavorite));
      setSearchQuery("");
      setSearchResults([]);
    } else {
      setTitle("");
      setType("MOVIE");
      setStatus("PLAN_TO_WATCH");
      setRating("");
      setReleaseYear("");
      setPosterUrl("");
      setBackdropUrl("");
      setGenres("");
      setSynopsis("");
      setDirector("");
      setCast("");
      setDurationMinutes("");
      setTotalSeasons("1");
      setTotalEpisodes("");
      setCurrentSeason("1");
      setCurrentEpisode("0");
      setQuality("1080p Web-DL");
      setStorageLocation("");
      setUserReview("");
      setIsFavorite(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [initialMedia, isOpen]);

  // Debounced auto-search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/media/lookup?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (result: any) => {
    setTitle(result.title || "");
    setType(result.type || "MOVIE");
    if (result.releaseYear) setReleaseYear(String(result.releaseYear));
    if (result.posterUrl) setPosterUrl(result.posterUrl);
    if (result.cast) setCast(result.cast);
    if (result.synopsis) setSynopsis(result.synopsis);
    if (result.genres) setGenres(result.genres);
    if (result.rating) setRating(String(result.rating));
    if (result.totalSeasons) setTotalSeasons(String(result.totalSeasons));

    setSearchResults([]);
    setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        type,
        status,
        rating: rating ? parseInt(rating, 10) : null,
        releaseYear: releaseYear ? parseInt(releaseYear, 10) : null,
        posterUrl: posterUrl.trim() || null,
        backdropUrl: backdropUrl.trim() || null,
        genres: genres.trim() || null,
        synopsis: synopsis.trim() || null,
        director: director.trim() || null,
        cast: cast.trim() || null,
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
        totalSeasons: totalSeasons ? parseInt(totalSeasons, 10) : 1,
        totalEpisodes: totalEpisodes ? parseInt(totalEpisodes, 10) : null,
        currentSeason: currentSeason ? parseInt(currentSeason, 10) : 1,
        currentEpisode: currentEpisode ? parseInt(currentEpisode, 10) : 0,
        quality: quality.trim() || null,
        storageLocation: storageLocation.trim() || null,
        userReview: userReview.trim() || null,
        isFavorite,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              {type === "MOVIE" ? <Film className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {initialMedia ? "Editar Título" : "Adicionar Filme / Série"}
              </h3>
              <p className="text-xs text-zinc-400">
                Pesquisa na base de dados online ou preenche manualmente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Search Bar with Auto-Complete */}
        <div className="p-6 pb-2">
          <div className="relative">
            <div className="flex items-center gap-2 p-2.5 bg-zinc-950 border border-zinc-700/80 rounded-2xl focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
              <Search className="w-4 h-4 text-purple-400 ml-1 shrink-0" />
              <input
                type="text"
                placeholder="Pesquisar filme ou série online (ex: Oppenheimer, Breaking Bad, Dune)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none"
              />
              {isSearching && <Loader2 className="w-4 h-4 animate-spin text-purple-400 mr-1 shrink-0" />}
            </div>

            {/* Live Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-zinc-950 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden z-30 max-h-72 overflow-y-auto">
                <div className="p-2 text-[10px] uppercase font-bold text-zinc-500 bg-zinc-900/80 px-3">
                  Resultados encontrados (Clica para preencher):
                </div>
                {searchResults.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => handleSelectSearchResult(res)}
                    className="p-2.5 hover:bg-zinc-850 flex items-center gap-3 cursor-pointer border-b border-zinc-800/60 last:border-0 transition-colors"
                  >
                    <div className="w-10 h-14 bg-zinc-900 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                      {res.posterUrl ? (
                        <img src={res.posterUrl} alt={res.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">🎬</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs truncate">{res.title}</span>
                        {res.releaseYear && (
                          <span className="text-[10px] text-zinc-400 font-mono">({res.releaseYear})</span>
                        )}
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                          {res.type === "MOVIE" ? "Filme" : "Série"}
                        </span>
                      </div>
                      {res.cast && <p className="text-[11px] text-zinc-400 truncate mt-0.5">{res.cast}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4 max-h-[68vh] overflow-y-auto">
          {/* Main Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Título *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Tipo / Categoria</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MediaType)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="MOVIE">🎬 Filme</option>
                <option value="SERIES">📺 Série</option>
                <option value="ANIMATION_MOVIE">🎨 Filme Animação</option>
                <option value="CARTOON">🧸 Desenho Animado</option>
                <option value="PT_MOVIE">🇵🇹 Filme Português</option>
                <option value="PT_SERIES">🇵🇹 Série Portuguesa</option>
                <option value="ANIME">🎌 Anime</option>
              </select>
            </div>
          </div>

          {/* Status, Rating, Year */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-300">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MediaStatus)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="PLAN_TO_WATCH">🍿 Para Ver (Watchlist)</option>
                <option value="WATCHING">👀 A Assistir</option>
                <option value="COMPLETED">✅ Visto / Concluído</option>
                <option value="PAUSED">⏸️ Em Pausa</option>
                <option value="DROPPED">🚫 Abandonado</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Avaliação (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="Ex: 9"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Ano</label>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                placeholder="Ex: 2024"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Series Tracking (if series, cartoon, or anime) */}
          {(type === "SERIES" || type === "CARTOON" || type === "PT_SERIES" || type === "ANIME") && (
            <div className="p-3.5 bg-purple-950/20 border border-purple-500/30 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Tv className="w-4 h-4 text-purple-400" />
                Progresso de Episódios / Temporadas
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-0.5">Temp. Atual:</label>
                  <input
                    type="number"
                    min="1"
                    value={currentSeason}
                    onChange={(e) => setCurrentSeason(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-0.5">Ep. Atual:</label>
                  <input
                    type="number"
                    min="0"
                    value={currentEpisode}
                    onChange={(e) => setCurrentEpisode(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-0.5">Total Temps:</label>
                  <input
                    type="number"
                    min="1"
                    value={totalSeasons}
                    onChange={(e) => setTotalSeasons(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-0.5">Total Eps:</label>
                  <input
                    type="number"
                    value={totalEpisodes}
                    onChange={(e) => setTotalEpisodes(e.target.value)}
                    placeholder="Opcional"
                    className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quality & Storage Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Qualidade / Formato</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="4K HDR">4K HDR / Remux</option>
                <option value="1080p Remux">1080p Remux</option>
                <option value="1080p Web-DL">1080p Web-DL</option>
                <option value="720p">720p HD</option>
                <option value="Blu-Ray">Disco Blu-Ray Físico</option>
                <option value="Streaming">Streaming (Netflix, HBO, etc.)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Duração (Minutos)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="Ex: 148"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Storage Path on PC / NAS */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              <span>Pasta no Computador / NAS (Opcional)</span>
            </label>
            <input
              type="text"
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
              placeholder="Ex: D:\Filmes\Oppenheimer.2023.2160p ou \\NAS\Series\Breaking Bad"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Poster URL & Genres */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">URL do Poster</label>
              <input
                type="text"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Géneros</label>
              <input
                type="text"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                placeholder="Ficção Científica, Ação, Drama"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Sinopse</label>
            <textarea
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Breve resumo da história..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Cast */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Atores / Elenco</label>
            <input
              type="text"
              value={cast}
              onChange={(e) => setCast(e.target.value)}
              placeholder="Ex: Cillian Murphy, Emily Blunt, Robert Downey Jr."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="rounded accent-purple-500"
              />
              <span>⭐ Marcar como Favorito</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
