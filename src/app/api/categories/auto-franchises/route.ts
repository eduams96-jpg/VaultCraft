import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const FRANCHISE_DEFINITIONS = [
  {
    name: "Assassin's Creed",
    icon: "🗡️",
    color: "#e11d48",
    pattern: /Assassin's Creed/i,
  },
  {
    name: "Batman & DC",
    icon: "🦇",
    color: "#1e293b",
    pattern: /Batman|Arkham|Gotham|Injustice|Suicide Squad/i,
  },
  {
    name: "BioShock",
    icon: "⚡",
    color: "#0284c7",
    pattern: /BioShock/i,
  },
  {
    name: "Borderlands",
    icon: "🔫",
    color: "#f59e0b",
    pattern: /Borderlands/i,
  },
  {
    name: "Buzz! & Party Games",
    icon: "🎉",
    color: "#ec4899",
    pattern: /Buzz!|Jackbox|Drawful|Party/i,
  },
  {
    name: "The Witcher",
    icon: "🐺",
    color: "#b45309",
    pattern: /Witcher/i,
  },
  {
    name: "The Walking Dead",
    icon: "🧟",
    color: "#15803d",
    pattern: /The Walking Dead/i,
  },
  {
    name: "Mafia",
    icon: "🕵️",
    color: "#78716c",
    pattern: /\bMafia\b/i,
  },
  {
    name: "Hitman",
    icon: "🎯",
    color: "#dc2626",
    pattern: /\bHitman\b/i,
  },
  {
    name: "Desporto & Corridas",
    icon: "⚽",
    color: "#16a34a",
    pattern:
      /Football Manager|FIFA|Assetto Corsa|\bF1\b|MotoGP|Descenders|Tennis|PGA|Golf|WRC|DiRT|\bNBA\b|Madden|AEW|WWE/i,
  },
  {
    name: "Total War & Estratégia",
    icon: "👑",
    color: "#8b5cf6",
    pattern:
      /Total War|Crusader Kings|Europa Universalis|Civilization|Age of Wonders|Stellaris|Hearts of Iron/i,
  },
  {
    name: "LEGO Universe",
    icon: "🧱",
    color: "#eab308",
    pattern: /\bLEGO\b/i,
  },
  {
    name: "Naruto Shippuden",
    icon: "🍥",
    color: "#ea580c",
    pattern: /Naruto/i,
  },
  {
    name: "Terror & Sobrevivência",
    icon: "👻",
    color: "#475569",
    pattern:
      /Amnesia|Outlast|Alien: Isolation|Dead Space|Resident Evil|Alone in the Dark|Banishers/i,
  },
  {
    name: "Telltale Games",
    icon: "🎭",
    color: "#6366f1",
    pattern: /Telltale|The Wolf Among Us/i,
  },
  {
    name: "Tomb Raider",
    icon: "🏹",
    color: "#0d9488",
    pattern: /Tomb Raider|Lara Croft/i,
  },
  {
    name: "Fallout",
    icon: "☢️",
    color: "#ca8a04",
    pattern: /\bFallout\b/i,
  },
  {
    name: "Mount & Blade",
    icon: "🛡️",
    color: "#a16207",
    pattern: /Mount & Blade/i,
  },
  {
    name: "Sci-Fi & Espaço",
    icon: "🪐",
    color: "#06b6d4",
    pattern:
      /No Man's Sky|Kerbal|Endless Space|Surviving Mars|Elite Dangerous|Star Wars/i,
  },
  {
    name: "Rockstar Games",
    icon: "🚗",
    color: "#d97706",
    pattern: /Grand Theft Auto|\bGTA\b|Bully|Red Dead|Max Payne/i,
  },
];

export async function POST() {
  try {
    const allGames = await prisma.game.findMany({
      select: { id: true, title: true, customCategories: true },
    });

    const results: { name: string; count: number }[] = [];
    let totalAssigned = 0;

    for (const franchise of FRANCHISE_DEFINITIONS) {
      // Find matching games
      const matchingGames = allGames.filter((g) =>
        franchise.pattern.test(g.title)
      );

      if (matchingGames.length === 0) continue;

      // Upsert category in Category table
      await prisma.category.upsert({
        where: { name: franchise.name },
        update: {
          icon: franchise.icon,
          color: franchise.color,
        },
        create: {
          name: franchise.name,
          icon: franchise.icon,
          color: franchise.color,
        },
      });

      // Update games' customCategories
      for (const game of matchingGames) {
        const existingList = game.customCategories
          ? game.customCategories
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          : [];

        if (!existingList.some((c) => c.toLowerCase() === franchise.name.toLowerCase())) {
          existingList.push(franchise.name);
          const updatedCustom = existingList.join(", ");

          await prisma.game.update({
            where: { id: game.id },
            data: { customCategories: updatedCustom },
          });

          // Update local copy to handle multiple franchise tags gracefully
          game.customCategories = updatedCustom;
          totalAssigned++;
        }
      }

      results.push({
        name: `${franchise.icon} ${franchise.name}`,
        count: matchingGames.length,
      });
    }

    // Also migrate any games with "Party Games" category if they didn't get "Buzz! & Party Games"
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      message: `Categorização automática concluída com sucesso! ${totalAssigned} etiquetas de franquia associadas.`,
      categories,
      franchises: results,
    });
  } catch (error) {
    console.error("Failed to auto-generate franchises:", error);
    return NextResponse.json(
      { error: "Erro ao gerar franquias automáticas." },
      { status: 500 }
    );
  }
}
