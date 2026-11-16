"use client";

import React from "react";

export function VaultCraftLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="vcShieldGrad" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="55%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="vcCoreGrad" x1="16" y1="14" x2="48" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0E7FF" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>
      <path
        d="M32 5L54 15V31C54 44.8 44.4 55.3 32 59C19.6 55.3 10 44.8 10 31V15L32 5Z"
        fill="#0F0E1A"
        stroke="url(#vcShieldGrad)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M21 23L32 45L43 23"
        stroke="url(#vcCoreGrad)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 15L37 21L32 27L27 21L32 15Z"
        fill="#38BDF8"
      />
    </svg>
  );
}

export function OriginVectorIcon({
  origin,
  className = "w-3.5 h-3.5",
}: {
  origin: string;
  className?: string;
}) {
  switch (origin) {
    case "REPACK":
      return (
        <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
          <path d="M10 2.5L16.5 6.2V13.8L10 17.5L3.5 13.8V6.2L10 2.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M3.8 6.5L10 10L16.2 6.5M10 10V17.2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "EMULATOR":
      return (
        <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
          <rect x="2.5" y="5" width="15" height="10" rx="3" stroke="currentColor" strokeWidth="1.7" />
          <path d="M6.5 8.5V11.5M5 10H8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="13" cy="9" r="1.1" fill="currentColor" />
          <circle cx="14.8" cy="11" r="1.1" fill="currentColor" />
        </svg>
      );
    case "PHYSICAL":
      return (
        <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
          <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "STEAM":
    case "GOG":
    case "EPIC":
    default:
      return (
        <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
          <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12.2" cy="8.2" r="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4.5 13.5L9.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
  }
}

export function EmptyGamesVaultIllustration({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="emptyGameGrad" x1="20" y1="20" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r="56" fill="#312E81" fillOpacity="0.16" stroke="url(#emptyGameGrad)" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="4 4" />
      <rect x="28" y="48" width="84" height="46" rx="18" fill="#18181B" stroke="url(#emptyGameGrad)" strokeWidth="2.5" />
      <path d="M48 63V79M40 71H56" stroke="#818CF8" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="88" cy="65" r="3.5" fill="#38BDF8" />
      <circle cx="96" cy="73" r="3.5" fill="#EC4899" />
      <circle cx="80" cy="73" r="3.5" fill="#A855F7" />
      <circle cx="88" cy="81" r="3.5" fill="#FACC15" />
      <path d="M58 36L70 26L82 36" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
