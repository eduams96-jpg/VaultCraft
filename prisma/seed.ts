import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.game.count();
  if (count > 0) {
    console.log("Database already has data. Skipping seed.");
    return;
  }

  const sampleGames = [
    {
      title: "Cyberpunk 2077",
      platform: "PC",
      originType: "REPACK",
      repackGroup: "FitGirl Repack",
      status: "PLAYING",
      rating: 9,
      coverUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900.jpg",
      bannerUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
      releaseYear: 2020,
      genres: "RPG, Ação, Cyberpunk",
      storageLocation: "SSD D:\\Jogos\\Cyberpunk 2077",
      isInstalled: true,
      installNotes: "Versão 2.13. Instalar mod de rádio custom e frame generation fix.",
      hoursPlayed: 42.5,
    },
    {
      title: "The Witcher 3: Wild Hunt",
      platform: "PC",
      originType: "STEAM",
      repackGroup: null,
      status: "COMPLETED",
      rating: 10,
      coverUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900.jpg",
      bannerUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg",
      releaseYear: 2015,
      genres: "RPG, Fantasia, Mundo Aberto",
      storageLocation: "SteamLibrary / Disco C",
      isInstalled: true,
      installNotes: "DLCs Blood and Wine e Hearts of Stone incluídas.",
      hoursPlayed: 145.0,
      completionDate: new Date("2023-08-15"),
    },
    {
      title: "Baldur's Gate 3",
      platform: "PC",
      originType: "GOG",
      repackGroup: null,
      status: "BACKLOG",
      rating: null,
      coverUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/library_600x900.jpg",
      bannerUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
      releaseYear: 2023,
      genres: "CRPG, D&D, Tático",
      storageLocation: "Instalador offline guardado no HDD Externo",
      isInstalled: false,
      installNotes: "Instalador DRM-free GOG v4.1.",
      hoursPlayed: 0,
    },
    {
      title: "The Legend of Zelda: Tears of the Kingdom",
      platform: "Nintendo Switch",
      originType: "EMULATOR",
      repackGroup: null,
      status: "PLAYING",
      rating: 10,
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      bannerUrl: "https://images.igdb.com/igdb/image/upload/t_screenshot_big/scbg0v.jpg",
      releaseYear: 2023,
      genres: "Aventura, Ação, Puzzle",
      storageLocation: "Ryujinx / D:\\Emuladores\\Switch\\Roms",
      isInstalled: true,
      installNotes: "Update 1.2.1 + Mod 60fps dinâmico + Shader cache compilado.",
      hoursPlayed: 35.0,
    },
    {
      title: "Red Dead Redemption 2",
      platform: "PC",
      originType: "REPACK",
      repackGroup: "DODI Repack",
      status: "COMPLETED",
      rating: 10,
      coverUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg",
      bannerUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg",
      releaseYear: 2019,
      genres: "Ação, Western, Mundo Aberto",
      storageLocation: "SSD D:\\Jogos\\RDR2",
      isInstalled: true,
      installNotes: "Crack EMPRESS fix v2 aplicado. Correr sempre como administrador.",
      hoursPlayed: 88.0,
      completionDate: new Date("2024-02-10"),
    },
    {
      title: "God of War Ragnarök",
      platform: "PlayStation 5",
      originType: "PHYSICAL",
      repackGroup: null,
      status: "PLATINUM",
      rating: 10,
      coverUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2322010/library_600x900.jpg",
      bannerUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2322010/header.jpg",
      releaseYear: 2022,
      genres: "Ação, Aventura, Mitologia",
      storageLocation: "Estante de jogos / Gaveta PS5",
      isInstalled: false,
      installNotes: "Edição de Lançamento em disco Blu-ray.",
      hoursPlayed: 60.0,
      completionDate: new Date("2023-01-20"),
    },
  ];

  for (const game of sampleGames) {
    await prisma.game.create({ data: game });
  }

  console.log("Database seeded successfully with sample games!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
