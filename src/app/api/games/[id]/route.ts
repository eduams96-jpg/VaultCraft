import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const game = await prisma.game.findUnique({
      where: { id },
    });

    if (!game) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json({ error: "Erro ao procurar o jogo" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json();

    if (body.title !== undefined && (typeof body.title !== "string" || !body.title.trim())) {
      return NextResponse.json({ error: "O título do jogo não pode ficar vazio" }, { status: 400 });
    }

    // isPlatinum e status andam juntos: PLATINUM <=> isPlatinum. Mudar só o estado para
    // outro valor (ex.: "A jogar") tem de limpar a flag, senão o jogo fica platinado "fantasma".
    const isPlatinum =
      body.isPlatinum !== undefined
        ? Boolean(body.isPlatinum)
        : body.status === "PLATINUM"
        ? true
        : body.status !== undefined
        ? false
        : undefined;

    const hoursPlayedNum = body.hoursPlayed !== undefined ? Number(body.hoursPlayed) : undefined;

    const statusVal =
      isPlatinum === true
        ? "PLATINUM"
        : body.status !== undefined
        ? body.status
        : undefined;

    const updated = await prisma.game.update({
      where: { id },
      data: {
        title: body.title?.trim(),
        platform: body.platform,
        originType: body.originType,
        repackGroup: body.repackGroup !== undefined ? body.repackGroup?.trim() || null : undefined,
        status: statusVal,
        rating: body.rating !== undefined ? (body.rating ? Number(body.rating) : null) : undefined,
        coverUrl: body.coverUrl !== undefined ? body.coverUrl?.trim() || null : undefined,
        bannerUrl: body.bannerUrl !== undefined ? body.bannerUrl?.trim() || null : undefined,
        releaseYear: body.releaseYear !== undefined ? (body.releaseYear ? Number(body.releaseYear) : null) : undefined,
        genres: body.genres !== undefined ? body.genres?.trim() || null : undefined,
        storageLocation: body.storageLocation !== undefined ? body.storageLocation?.trim() || null : undefined,
        executablePath: body.executablePath !== undefined ? body.executablePath?.trim() || null : undefined,
        saveLocation: body.saveLocation !== undefined ? body.saveLocation?.trim() || null : undefined,
        diskSpace: body.diskSpace !== undefined ? body.diskSpace?.trim() || null : undefined,
        pcRequirements: body.pcRequirements !== undefined ? body.pcRequirements?.trim() || null : undefined,
        tags: body.tags !== undefined ? body.tags?.trim() || null : undefined,
        customCategories: body.customCategories !== undefined ? body.customCategories?.trim() || null : undefined,
        timeToBeat: body.timeToBeat !== undefined ? body.timeToBeat?.trim() || null : undefined,
        isInstalled: body.isInstalled !== undefined ? Boolean(body.isInstalled) : undefined,
        isArchived: body.isArchived !== undefined ? Boolean(body.isArchived) : undefined,
        isFavorite: body.isFavorite !== undefined ? Boolean(body.isFavorite) : undefined,
        hasSavefile: body.hasSavefile !== undefined ? Boolean(body.hasSavefile) : undefined,
        hasAchievements: body.hasAchievements !== undefined ? Boolean(body.hasAchievements) : undefined,
        isPlatinum,
        installNotes: body.installNotes !== undefined ? body.installNotes?.trim() || null : undefined,
        userReview: body.userReview !== undefined ? body.userReview?.trim() || null : undefined,
        screenshots: body.screenshots !== undefined ? body.screenshots?.trim() || null : undefined,
        hoursPlayed:
          hoursPlayedNum !== undefined && Number.isFinite(hoursPlayedNum)
            ? Math.max(0, hoursPlayedNum)
            : undefined,
        gameVersion: body.gameVersion !== undefined ? body.gameVersion?.trim() || null : undefined,
        versionDate: body.versionDate !== undefined ? (body.versionDate ? new Date(body.versionDate) : null) : undefined,
        latestKnownVersion: body.latestKnownVersion !== undefined ? body.latestKnownVersion?.trim() || null : undefined,
        latestVersionDate: body.latestVersionDate !== undefined ? (body.latestVersionDate ? new Date(body.latestVersionDate) : null) : undefined,
        latestPatchNotesUrl: body.latestPatchNotesUrl !== undefined ? body.latestPatchNotesUrl?.trim() || null : undefined,
        latestPatchTitle: body.latestPatchTitle !== undefined ? body.latestPatchTitle?.trim() || null : undefined,
        isUpToDate: body.isUpToDate !== undefined ? (body.isUpToDate === null ? null : Boolean(body.isUpToDate)) : undefined,
        externalLink: body.externalLink !== undefined ? body.externalLink?.trim() || null : undefined,
        isWishlist: body.isWishlist !== undefined ? Boolean(body.isWishlist) : undefined,
        wishlistStatus: body.wishlistStatus !== undefined ? body.wishlistStatus?.trim() || null : undefined,
        wishlistPriority: body.wishlistPriority !== undefined ? body.wishlistPriority?.trim() || null : undefined,
        targetPrice: body.targetPrice !== undefined ? (body.targetPrice ? Number(body.targetPrice) : null) : undefined,
        // Só mexe na data se o campo vier no pedido: os toggles rápidos (favorito, arquivo,
        // estado...) enviam updates parciais e antes apagavam a data de conclusão.
        completionDate:
          body.completionDate !== undefined
            ? body.completionDate && !isNaN(Date.parse(body.completionDate))
              ? new Date(body.completionDate)
              : null
            : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json({ error: "Erro ao atualizar o jogo" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    await prisma.game.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Jogo removido com sucesso" });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json({ error: "Erro ao apagar o jogo" }, { status: 500 });
  }
}
