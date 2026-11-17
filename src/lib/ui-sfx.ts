"use client";

export type UiSoundType =
  | "click"
  | "switch"
  | "toggle"
  | "platinum"
  | "hover"
  | "open"
  | "launch"
  | "success";

const SFX_STORAGE_KEY = "gt_sfxMuted";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSfxMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SFX_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

const sfxListeners = new Set<() => void>();

/** Para useSyncExternalStore: avisa quando o estado de silêncio muda. */
export function subscribeSfxMuted(listener: () => void): () => void {
  sfxListeners.add(listener);
  return () => {
    sfxListeners.delete(listener);
  };
}

export function setSfxMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SFX_STORAGE_KEY, muted ? "true" : "false");
  } catch {}
  sfxListeners.forEach((l) => l());
}

export function toggleSfxMuted(): boolean {
  const next = !isSfxMuted();
  setSfxMuted(next);
  if (!next) {
    playUiSound("toggle", true);
  }
  return next;
}

function playTone(
  ctx: AudioContext,
  freqStart: number,
  freqEnd: number,
  startTime: number,
  duration: number,
  gainPeak: number,
  wave: OscillatorType = "sine"
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = wave;
  osc.frequency.setValueAtTime(freqStart, startTime);
  if (freqEnd !== freqStart) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), startTime + duration);
  }

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2600, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + Math.min(0.008, duration * 0.25));
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

export function playUiSound(type: UiSoundType, bypassMuteCheck = false): void {
  if (typeof window === "undefined") return;
  if (!bypassMuteCheck && isSfxMuted()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    switch (type) {
      case "hover":
        playTone(ctx, 520, 620, now, 0.024, 0.018, "sine");
        break;
      case "click":
        playTone(ctx, 420, 290, now, 0.032, 0.04, "triangle");
        break;
      case "toggle":
        playTone(ctx, 587.33, 783.99, now, 0.055, 0.045, "sine");
        break;
      case "switch":
        playTone(ctx, 330, 440, now, 0.055, 0.04, "sine");
        playTone(ctx, 493.88, 659.25, now + 0.04, 0.075, 0.038, "triangle");
        break;
      case "open":
        playTone(ctx, 380, 560, now, 0.05, 0.036, "sine");
        break;
      case "launch":
        playTone(ctx, 440, 659.25, now, 0.06, 0.042, "triangle");
        playTone(ctx, 659.25, 880, now + 0.05, 0.09, 0.04, "sine");
        break;
      case "success":
        playTone(ctx, 523.25, 659.25, now, 0.05, 0.038, "sine");
        playTone(ctx, 659.25, 783.99, now + 0.045, 0.08, 0.038, "triangle");
        break;
      case "platinum":
        // Console Trophy / Platinum Cmaj7 shimmer chord
        playTone(ctx, 523.25, 523.25, now, 0.16, 0.038, "triangle");
        playTone(ctx, 659.25, 659.25, now + 0.045, 0.18, 0.035, "sine");
        playTone(ctx, 783.99, 783.99, now + 0.09, 0.2, 0.035, "sine");
        playTone(ctx, 987.77, 1046.5, now + 0.135, 0.26, 0.04, "triangle");
        break;
    }
  } catch {
    // Ignore audio context restrictions before user interaction
  }
}
