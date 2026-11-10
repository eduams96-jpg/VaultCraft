import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Erro ao procurar categorias" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "O nome da categoria é obrigatório." }, { status: 400 });
    }

    // Check if category already exists
    const existing = await prisma.category.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const created = await prisma.category.create({
      data: {
        name,
        icon: body.icon?.trim() || "📁",
        color: body.color?.trim() || "#6366f1",
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const name = searchParams.get("name");

    if (!id && !name) {
      return NextResponse.json({ error: "ID ou nome da categoria obrigatório." }, { status: 400 });
    }

    let targetCategory = null;
    if (id) {
      targetCategory = await prisma.category.findUnique({ where: { id } });
    } else if (name) {
      targetCategory = await prisma.category.findUnique({ where: { name } });
    }

    if (!targetCategory) {
      return NextResponse.json({ success: true, message: "Categoria não encontrada ou já removida." });
    }

    // Delete category
    await prisma.category.delete({
      where: { id: targetCategory.id },
    });

    // Remove category reference from games
    const catName = targetCategory.name;
    const gamesWithCategory = await prisma.game.findMany({
      where: {
        customCategories: {
          contains: catName,
        },
      },
    });

    for (const g of gamesWithCategory) {
      if (g.customCategories) {
        const updatedCats = g.customCategories
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c && c.toLowerCase() !== catName.toLowerCase())
          .join(", ");

        await prisma.game.update({
          where: { id: g.id },
          data: { customCategories: updatedCats || null },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Categoria "${catName}" removida com sucesso.`,
    });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json({ error: "Erro ao remover categoria" }, { status: 500 });
  }
}
