import { NextRequest, NextResponse } from "next/server"

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://frugal-zebra-890.convex.cloud"

/**
 * Extract raw JPEG bytes from a Convex multipart/form-data response.
 * Convex wraps uploaded files in a multipart envelope — we strip it by
 * finding the JPEG SOI (FF D8) and EOI (FF D9) markers.
 */
function extractJpeg(bytes: Uint8Array): Uint8Array | null {
  let start = -1
  for (let i = 0; i < bytes.length - 1; i++) {
    if (bytes[i] === 0xff && bytes[i + 1] === 0xd8) { start = i; break }
  }
  if (start < 0) return null

  let end = -1
  for (let i = start + 2; i < bytes.length - 1; i++) {
    if (bytes[i] === 0xff && bytes[i + 1] === 0xd9) { end = i + 2; break }
  }
  if (end <= start) return null
  return bytes.slice(start, end)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Support both Next.js 14 sync params and Next.js 15 async params
  const resolvedParams = await params
  const id = resolvedParams.id

  if (!id || id.startsWith("blob:") || id.startsWith("data:")) {
    return NextResponse.json({ error: "Invalid storage ID" }, { status: 404 })
  }

  try {
    let imgUrl: string

    if (id.startsWith("http")) {
      // 1. Full URL passed (e.g. encoded URL)
      imgUrl = decodeURIComponent(id)
    } else if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id)) {
      // 2. UUID passed directly — this is already the storage path on Convex!
      // e.g. /api/storage/857f9ead-7be2-40e4-8052-2c8d5da49bbb
      imgUrl = `${CONVEX_URL}/api/storage/${id}`
    } else {
      // 3. Legacy Convex storage ID (e.g. "kg2xAbc...") — resolve via files:getUrl
      const queryResp = await fetch(`${CONVEX_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "files:getUrl", args: { storageId: id } }),
      })
      const queryData = await queryResp.json()
      imgUrl = queryData.value || queryData.result
      if (!imgUrl || typeof imgUrl !== "string") {
        return NextResponse.json({ error: "Storage ID not found" }, { status: 404 })
      }
    }

    // Fetch from Convex CDN (Convex returns multipart/form-data wrapping the image)
    const imgResp = await fetch(imgUrl)
    if (!imgResp.ok) {
      return NextResponse.json({ error: `Fetch failed: ${imgResp.status}` }, { status: 502 })
    }

    const raw = await imgResp.arrayBuffer()
    const bytes = new Uint8Array(raw)
    const contentType = imgResp.headers.get("Content-Type") || ""

    // If Convex returns image directly (not multipart), serve as-is
    if (contentType.startsWith("image/")) {
      return new NextResponse(bytes, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(bytes.length),
          "Cache-Control": "public, max-age=86400",
        },
      })
    }

    // Strip multipart wrapper — extract raw JPEG between FF D8 ... FF D9
    const jpeg = extractJpeg(bytes)
    if (jpeg) {
      return new NextResponse(jpeg, {
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Length": String(jpeg.length),
          "Cache-Control": "public, max-age=86400",
        },
      })
    }

    // Last-resort: return raw bytes
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (err) {
    console.error("Storage proxy error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
