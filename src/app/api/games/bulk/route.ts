import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ids, updates } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Nenhum jogo selecionado para a operação em lote." },
        { status: 400 }
      );
    }

    const validIds: string[] = ids.filter(
      (id): id is string => typeof id === "string" && id.trim().length > 0
    );

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "Nenhum ID de jogo válido fornecido." },
        { status: 400 }
      );
    }

    // 1. BULK DELETE
    if (action === "delete") {
      const result = await prisma.game.deleteMany({
        where: {
          id: { in: validIds },
        },
      });

      return NextResponse.json({
        success: true,
        count: result.count,
        message: `${result.count} jogo${result.count > 1 ? "s" : ""} removido${result.count > 1 ? "s" : ""} com sucesso.`,
      });
    }

    // 2. BULK UPDATE
    if (action === "update") {
      if (!updates || typeof updates !== "object") {
        return NextResponse.json(
          { error: "Nenhum campo fornecido para atualização em lote." },
          { status: 400 }
        );
      }

      // Add Category to selected games (non-destructive append)
      if (typeof updates.addCategory === "string" && updates.addCategory.trim()) {
        const catToAdd = updates.addCategory.trim();
        const gamesToUpdate = await prisma.game.findMany({
          where: { id: { in: validIds } },
          select: { id: true, customCategories: true },
        });

        for (const g of gamesToUpdate) {
          const currentList = g.customCategories
            ? g.customCategories.split(",").map((c) => c.trim()).filter(Boolean)
            : [];
          if (!currentList.includes(catToAdd)) {
            currentList.push(catToAdd);
            await prisma.game.update({
              where: { id: g.id },
              data: { customCategories: currentList.join(", ") },
            });
          }
        }

        // Also ensure category exists in Category table
        const catExists = await prisma.category.findUnique({
          where: { name: catToAdd },
        });
        if (!catExists) {
          await prisma.category.create({
            data: { name: catToAdd, icon: "📁", color: "#6366f1" },
          });
        }

        return NextResponse.json({
          success: true,
          count: validIds.length,
          message: `${validIds.length} jogo${validIds.length > 1 ? "s" : ""} adicionado${validIds.length > 1 ? "s" : ""} à categoria "${catToAdd}".`,
        });
      }

      // Remove Category from selected games
      if (typeof updates.removeCategory === "string" && updates.removeCategory.trim()) {
        const catToRemove = updates.removeCategory.trim();
        const gamesToUpdate = await prisma.game.findMany({
          where: { id: { in: validIds } },
          select: { id: true, customCategories: true },
        });

        for (const g of gamesToUpdate) {
          if (g.customCategories) {
            const currentList = g.customCategories
              .split(",")
              .map((c) => c.trim())
              .filter((c) => c && c.toLowerCase() !== catToRemove.toLowerCase());
            await prisma.game.update({
              where: { id: g.id },
              data: { customCategories: currentList.length > 0 ? currentList.join(", ") : null },
            });
          }
        }

        return NextResponse.json({
          success: true,
          count: validIds.length,
          message: `Categoria "${catToRemove}" removida dos jogos selecionados.`,
        });
      }

      // General bulk field updates
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dataToUpdate: any = {};

      if (typeof updates.status === "string" && updates.status) {
        dataToUpdate.status = updates.status;
        if (updates.status === "PLATINUM") {
          dataToUpdate.isPlatinum = true;
        }
      }

      if (typeof updates.platform === "string" && updates.platform) {
        dataToUpdate.platform = updates.platform;
      }

      if (typeof updates.originType === "string" && updates.originType) {
        dataToUpdate.originType = updates.originType;
      }

      if (typeof updates.repackGroup === "string") {
        dataToUpdate.repackGroup = updates.repackGroup.trim() || null;
      }

      if (typeof updates.isArchived === "boolean") {
        dataToUpdate.isArchived = updates.isArchived;
      }

      if (typeof updates.isInstalled === "boolean") {
        dataToUpdate.isInstalled = updates.isInstalled;
      }

      if (typeof updates.hasSavefile === "boolean") {
        dataToUpdate.hasSavefile = updates.hasSavefile;
      }

      if (typeof updates.hasAchievements === "boolean") {
        dataToUpdate.hasAchievements = updates.hasAchievements;
      }

      if (typeof updates.isPlatinum === "boolean") {
        dataToUpdate.isPlatinum = updates.isPlatinum;
        if (updates.isPlatinum) {
          dataToUpdate.status = "PLATINUM";
        }
      }

      if (typeof updates.tags === "string") {
        dataToUpdate.tags = updates.tags.trim() || null;
      }

      if (typeof updates.customCategories === "string") {
        dataToUpdate.customCategories = updates.customCategories.trim() || null;
      }

      if (typeof updates.storageLocation === "string") {
        dataToUpdate.storageLocation = updates.storageLocation.trim() || null;
      }

      if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json(
          { error: "Nenhuma alteração válida selecionada para atualizar." },
          { status: 400 }
        );
      }

      const result = await prisma.game.updateMany({
        where: {
          id: { in: validIds },
        },
        data: dataToUpdate,
      });

      return NextResponse.json({
        success: true,
        count: result.count,
        message: `${result.count} jogo${result.count > 1 ? "s" : ""} atualizado${result.count > 1 ? "s" : ""} com sucesso.`,
      });
    }

    return NextResponse.json(
      { error: "Ação em lote inválida (use 'delete' ou 'update')." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Bulk games operation error:", error);
    return NextResponse.json(
      { error: "Erro ao executar operação em lote." },
      { status: 500 }
    );
  }
}
