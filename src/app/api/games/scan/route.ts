import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import {
  cleanRawGameTitle,
  checkIsDuplicateGame,
  type ExistingGameRef,
} from "@/lib/gameNormalization";

export interface ScannedGameCandidate {
  folderName: string;
  fullPath: string;
  executablePath: string | null;
  cleanTitle: string;
  releaseYear: number | null;
  platform: string;
  originType: string;
  repackGroup: string | null;
  gameVersion: string | null;
  diskSpace: string;
  sizeGB: number;
  coverUrl: string | null;
  bannerUrl: string | null;
  genres: string | null;
  externalLink: string | null;
  alreadyInVault: boolean;
}

const ROM_EXTENSIONS = new Set([
  ".iso",
  ".chd",
  ".nsp",
  ".xci",
  ".rvz",
  ".wbfs",
  ".pkg",
  ".cso",
  ".gba",
  ".nds",
  ".3ds",
  ".cia",
  ".smc",
  ".sfc",
  ".z64",
  ".n64",
  ".bin",
]);

const IGNORED_EXES = [
  "unins000.exe",
  "uninstall.exe",
  "setup.exe",
  "dxwebsetup.exe",
  "vcredist",
  "vc_redist",
  "unitycrashhandler",
  "crashreport",
  "quicksfv.exe",
  "md5",
  "language_setup",
  "settings.exe",
  "launcher_helper",
  "dotnet",
  "directx",
];

function getDirectorySizeBytes(dirPath: string, maxDepth = 3, currentDepth = 0): number {
  let total = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(/*turbopackIgnore: true*/ dirPath, entry.name);
      if (entry.isFile()) {
        try {
          total += fs.statSync(full).size;
        } catch {}
      } else if (entry.isDirectory() && currentDepth < maxDepth) {
        total += getDirectorySizeBytes(full, maxDepth, currentDepth + 1);
      }
    }
  } catch {}
  return total;
}

function findBestExecutable(dirPath: string, maxDepth = 2, currentDepth = 0): { exePath: string; size: number } | null {
  let best: { exePath: string; size: number } | null = null;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(/*turbopackIgnore: true*/ dirPath, entry.name);
      if (entry.isFile() && entry.name.toLowerCase().endsWith(".exe")) {
        const lower = entry.name.toLowerCase();
        if (IGNORED_EXES.some((ig) => lower.includes(ig))) continue;
        try {
          const st = fs.statSync(full);
          if (!best || st.size > best.size) {
            best = { exePath: full, size: st.size };
          }
        } catch {}
      } else if (entry.isDirectory() && currentDepth < maxDepth) {
        const sub = entry.name.toLowerCase();
        if (sub === "redist" || sub === "_commonredist" || sub === "directx" || sub === "support") continue;
        const candidate = findBestExecutable(full, maxDepth, currentDepth + 1);
        if (candidate && (!best || candidate.size > best.size)) {
          best = candidate;
        }
      }
    }
  } catch {}
  return best;
}

function findLocalCoverImage(dirPath: string): string | null {
  const candidates = ["cover.jpg", "cover.png", "poster.jpg", "poster.png", "folder.jpg", "folder.png", "boxart.jpg"];
  for (const name of candidates) {
    const full = path.join(/*turbopackIgnore: true*/ dirPath, name);
    try {
      if (fs.existsSync(full) && fs.statSync(full).isFile()) {
        return `/api/local-image?path=${encodeURIComponent(full)}`;
      }
    } catch {}
  }
  return null;
}

function extractVersionFromRawName(raw: string): string | null {
  const vMatch = raw.match(/\b(v\d+(?:\.\d+){1,4}[a-z]?|Build[\s._-]*\d{3,8})\b/i);
  return vMatch ? vMatch[1] : null;
}

async function lookupSteamQuick(title: string): Promise<{
  coverUrl: string | null;
  bannerUrl: string | null;
  releaseYear: number | null;
  genres: string | null;
  externalLink: string | null;
}> {
  try {
    const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(title)}&l=english&cc=US`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const data = await res.json();
      const first = data?.items?.[0];
      if (first?.id) {
        const appId = first.id;
        return {
          coverUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`,
          bannerUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
          releaseYear: null,
          genres: null,
          externalLink: `https://store.steampowered.com/app/${appId}`,
        };
      }
    }
  } catch {}
  return { coverUrl: null, bannerUrl: null, releaseYear: null, genres: null, externalLink: null };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const folderPath = (body.folderPath || "").trim();
    const defaultPlatform = body.defaultPlatform || "PC";
    const defaultOrigin = body.defaultOrigin || "REPACK";

    if (!folderPath) {
      return NextResponse.json({ error: "Indica o caminho da pasta a escanear." }, { status: 400 });
    }

    const resolvedRoot = path.resolve(/*turbopackIgnore: true*/ folderPath);
    if (!fs.existsSync(resolvedRoot)) {
      return NextResponse.json(
        { error: `A pasta "${resolvedRoot}" não foi encontrada no computador ou NAS.` },
        { status: 404 }
      );
    }

    const existingGames: ExistingGameRef[] = await prisma.game.findMany({
      select: { id: true, title: true, platform: true },
    });

    const entries = fs.readdirSync(resolvedRoot, { withFileTypes: true });
    const rawCandidates: Array<{
      folderName: string;
      fullPath: string;
      isDir: boolean;
      sizeBytes: number;
      exePath: string | null;
      localCover: string | null;
    }> = [];

    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name.startsWith("$")) continue;
      const full = path.join(/*turbopackIgnore: true*/ resolvedRoot, entry.name);

      if (entry.isDirectory()) {
        const sizeBytes = getDirectorySizeBytes(full);
        const bestExe = findBestExecutable(full);
        const localCover = findLocalCoverImage(full);
        rawCandidates.push({
          folderName: entry.name,
          fullPath: full,
          isDir: true,
          sizeBytes,
          exePath: bestExe?.exePath || null,
          localCover,
        });
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ROM_EXTENSIONS.has(ext)) {
          let sizeBytes = 0;
          try {
            sizeBytes = fs.statSync(full).size;
          } catch {}
          rawCandidates.push({
            folderName: path.basename(entry.name, ext),
            fullPath: full,
            isDir: false,
            sizeBytes,
            exePath: full,
            localCover: null,
          });
        }
      }
    }

    const results: ScannedGameCandidate[] = [];
    const batchSize = 5;

    for (let i = 0; i < rawCandidates.length; i += batchSize) {
      const chunk = rawCandidates.slice(i, i + batchSize);
      const chunkResolved = await Promise.all(
        chunk.map(async (item) => {
          const parsed = cleanRawGameTitle(item.folderName);
          const cleanTitle = parsed.cleanTitle || item.folderName;
          const platform = parsed.detectedPlatform || defaultPlatform;
          const originType = parsed.detectedOrigin || (!item.isDir ? "EMULATOR" : defaultOrigin);
          const repackGroup = parsed.detectedRepack || null;
          const gameVersion = extractVersionFromRawName(item.folderName);

          const sizeGB = Number((item.sizeBytes / (1024 * 1024 * 1024)).toFixed(2));
          const diskSpace =
            sizeGB >= 1
              ? `${sizeGB.toFixed(1)} GB`
              : item.sizeBytes > 0
              ? `${Math.max(1, Math.round(item.sizeBytes / (1024 * 1024)))} MB`
              : "";

          const dup = checkIsDuplicateGame(cleanTitle, platform, existingGames);
          const meta = await lookupSteamQuick(parsed.searchTitle || cleanTitle);

          return {
            folderName: item.folderName,
            fullPath: item.fullPath,
            executablePath: item.exePath,
            cleanTitle,
            releaseYear: parsed.detectedYear || meta.releaseYear || null,
            platform,
            originType,
            repackGroup,
            gameVersion,
            diskSpace,
            sizeGB,
            coverUrl: item.localCover || meta.coverUrl,
            bannerUrl: meta.bannerUrl,
            genres: meta.genres,
            externalLink: meta.externalLink,
            alreadyInVault: dup.isDuplicate,
          };
        })
      );
      results.push(...chunkResolved);
    }

    return NextResponse.json({
      scannedFolder: resolvedRoot,
      totalFound: results.length,
      items: results,
    });
  } catch (error) {
    console.error("Game folder scan error:", error);
    return NextResponse.json(
      { error: "Erro ao escanear a pasta de jogos." },
      { status: 500 }
    );
  }
}
