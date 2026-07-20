import { NextRequest, NextResponse } from "next/server"

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://frugal-zebra-890.convex.cloud"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // 1. Resolve storage ID to UUID-based CDN URL
    const queryResp = await fetch(`${CONVEX_URL}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "files:getUrl", args: { storageId: id } }),
    })
    const queryData = await queryResp.json()
    const imgUrl = queryData.value || queryData.result
    if (!imgUrl || typeof imgUrl !== "string") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // 2. Fetch from Convex CDN
    const imgResp = await fetch(imgUrl)
    if (!imgResp.ok) {
      return NextResponse.json({ error: "Fetch failed" }, { status: 502 })
    }

    const raw = await imgResp.arrayBuffer()
    const bytes = new Uint8Array(raw)

    // 3. Find JPEG data inside multipart by locating the SOI marker (FF D8)
    let start = -1
    let end = -1
    for (let i = 0; i < bytes.length - 1; i++) {
      if (bytes[i] === 0xFF && bytes[i + 1] === 0xD8) {
        start = i
        break
      }
    }
    // Find EOI marker (FF D9)
    if (start >= 0) {
      for (let i = start + 2; i < bytes.length - 1; i++) {
        if (bytes[i] === 0xFF && bytes[i + 1] === 0xD9) {
          end = i + 2
          break
        }
      }
    }

    if (start >= 0 && end > start) {
      const jpegData = bytes.slice(start, end)
      return new NextResponse(jpegData, {
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Length": String(jpegData.length),
          "Cache-Control": "public, max-age=86400",
        },
      })
    }

    // Fallback: return raw (might be multipart)
    return new NextResponse(bytes, {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400" },
    })
  } catch (err) {
    console.error("Storage proxy error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
