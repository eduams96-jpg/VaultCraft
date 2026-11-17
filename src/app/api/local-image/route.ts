import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const ALLOWED_IMAGE_EXTS: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPath = searchParams.get("path");

  if (!rawPath) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  try {
    const resolvedPath = path.resolve(/*turbopackIgnore: true*/ rawPath);
    const ext = path.extname(/*turbopackIgnore: true*/ resolvedPath).toLowerCase();
    const contentType = ALLOWED_IMAGE_EXTS[ext];

    if (!contentType) {
      return new NextResponse("Forbidden file type", { status: 403 });
    }

    const buffer = await fs.readFile(/*turbopackIgnore: true*/ resolvedPath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    if ((error as { digest?: string } | null)?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    return new NextResponse("Not Found", { status: 404 });
  }
}
