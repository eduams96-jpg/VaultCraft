"use client";

import { useSyncExternalStore } from "react";

/**
 * Valores que só existem no browser (preferências em localStorage, relógio).
 * Lidos com useSyncExternalStore: o servidor (prerender) usa um valor fixo e o cliente
 * passa ao valor real logo após a hidratação, sem setState dentro de efeitos e sem
 * erros de hidratação.
 */

// ---------- Preferência de vista da coleção ----------
export type ViewMode = "grid" | "compact" | "list";

const VIEW_MODE_KEY = "gt_gameViewMode";
const viewModeListeners = new Set<() => void>();

function readViewMode(): ViewMode {
  try {
    const saved = window.localStorage.getItem(VIEW_MODE_KEY);
    if (saved === "grid" || saved === "compact" || saved === "list") return saved;
  } catch {}
  return "grid";
}

function subscribeViewMode(listener: () => void) {
  viewModeListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    viewModeListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function setStoredViewMode(mode: ViewMode) {
  try {
    window.localStorage.setItem(VIEW_MODE_KEY, mode);
  } catch {}
  viewModeListeners.forEach((l) => l());
}

export function useViewMode(): ViewMode {
  return useSyncExternalStore(subscribeViewMode, readViewMode, () => "grid");
}

// ---------- Relógio (granularidade de 1 minuto) ----------
function readNowMinute(): number {
  return Math.floor(Date.now() / 60_000) * 60_000;
}

function subscribeNow(listener: () => void) {
  const id = window.setInterval(listener, 60_000);
  return () => window.clearInterval(id);
}

/** Timestamp atual (arredondado ao minuto) no cliente; null durante o prerender no servidor. */
export function useNowMinute(): number | null {
  return useSyncExternalStore<number | null>(subscribeNow, readNowMinute, () => null);
}
