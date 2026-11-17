import { NextResponse } from "next/server";
import {
  createAutoSnapshot,
  listAutoSnapshots,
  readAutoSnapshot,
} from "@/lib/auto-backup";
import { restoreUnifiedBackupData } from "@/lib/restore-backup";

export async function GET() {
  try {
    const snapshots = await listAutoSnapshots();
    return NextResponse.json({ snapshots });
  } catch (error) {
    console.error("List snapshots error:", error);
    return NextResponse.json(
      { error: "Erro ao listar snapshots locais." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "create") {
      const snapshot = await createAutoSnapshot(body.reason || "manual");
      return NextResponse.json({
        success: Boolean(snapshot),
        snapshot,
      });
    }

    if (body.action === "restore" && typeof body.filename === "string") {
      await createAutoSnapshot("before-snapshot-restore");
      const snapshotData = await readAutoSnapshot(body.filename);
      const summary = await restoreUnifiedBackupData(snapshotData);
      return NextResponse.json(summary);
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    console.error("Snapshot action error:", error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : "") || "Erro ao processar snapshot." },
      { status: 500 }
    );
  }
}
