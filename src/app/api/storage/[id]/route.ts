// Proxies Convex storage images with correct Content-Type so browsers can render them
// The frontend should use /api/storage/STORAGE_ID instead of Convex's direct URL

import { NextRequest, NextResponse } from "next/server"
import { convexClient } from "@/lib/convex"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // 1. Get the real URL from Convex
    const url = await convexClient.query("files:getUrl", { storageId: id })
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // 2. Fetch the image data
    const resp = await fetch(url)
    const buffer = Buffer.from(await resp.arrayBuffer())

    // 3. Determine content type (Convex wraps in multipart, so guess from first bytes)
    const contentType = buffer[0] === 0xff && buffer[1] === 0xd8
      ? "image/jpeg"
      : buffer[0] === 0x89 && buffer[1] === 0x50
        ? "image/png"
        : buffer[0] === 0x52 && buffer[1] === 0x49
          ? "image/webp"
          : "image/jpeg"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
