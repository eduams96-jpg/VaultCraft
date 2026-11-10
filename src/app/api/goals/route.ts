import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(goals);
  } catch (error) {
    console.error("Failed to fetch goals:", error);
    return NextResponse.json({ error: "Erro ao procurar metas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Título da meta é obrigatório." }, { status: 400 });
    }

    const created = await prisma.goal.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        targetCount: Math.max(1, Number(body.targetCount) || 1),
        currentCount: Math.max(0, Number(body.currentCount) || 0),
        category: body.category?.trim() || "CUSTOM",
        isCompleted: Boolean(body.isCompleted),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create goal:", error);
    return NextResponse.json({ error: "Erro ao criar meta" }, { status: 500 });
  }
}
