import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json();

    const targetCount = body.targetCount !== undefined ? Math.max(1, Number(body.targetCount)) : undefined;
    const currentCount = body.currentCount !== undefined ? Math.max(0, Number(body.currentCount)) : undefined;

    let isCompleted = body.isCompleted !== undefined ? Boolean(body.isCompleted) : undefined;
    if (currentCount !== undefined && targetCount !== undefined && isCompleted === undefined) {
      isCompleted = currentCount >= targetCount;
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title.trim() : undefined,
        description: body.description !== undefined ? body.description?.trim() || null : undefined,
        targetCount,
        currentCount,
        category: body.category !== undefined ? body.category?.trim() : undefined,
        isCompleted,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update goal:", error);
    return NextResponse.json({ error: "Erro ao atualizar meta" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    await prisma.goal.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Meta removida." });
  } catch (error) {
    console.error("Failed to delete goal:", error);
    return NextResponse.json({ error: "Erro ao remover meta" }, { status: 500 });
  }
}
