import { NextRequest, NextResponse } from "next/server"

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://frugal-zebra-890.convex.cloud"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // 1. Resolve storage ID to UUID-based URL
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

    // 2. Fetch the image — Convex wraps it in multipart/form-data
    const imgResp = await fetch(imgUrl)
    if (!imgResp.ok) {
      return NextResponse.json({ error: "Fetch failed" }, { status: 502 })
    }

    const raw = await imgResp.arrayBuffer()
    const boundary = imgResp.headers.get("content-type")?.match(/boundary=([^\s;]+)/)?.[1]

    if (!boundary) {
      // Raw image — just serve it
      return new NextResponse(raw, {
        headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400" },
      })
    }

    // 3. Parse multipart binary — locate the image data between boundary parts
    const boundaryBytes = new TextEncoder().encode(`\r\n--${boundary}`)
    const headerEnd = new TextEncoder().encode("\r\n\r\n")
    const u8 = new Uint8Array(raw)

    // Find first boundary
    let pos = 0
    const findSeq = (haystack: Uint8Array, needle: Uint8Array, start: number): number => {
      for (let i = start; i <= haystack.length - needle.length; i++) {
        let match = true
        for (let j = 0; j < needle.length; j++) {
          if (haystack[i + j] !== needle[j]) { match = false; break }
        }
        if (match) return i
      }
      return -1
    }

    // Skip past the first boundary and its headers
    pos = findSeq(u8, boundaryBytes, 0)
    if (pos < 0) {
      return new NextResponse(raw, {
        headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400" },
      })
    }
    pos += boundaryBytes.length

    // Find end of headers (\r\n\r\n)
    pos = findSeq(u8, headerEnd, pos)
    if (pos < 0) {
      return new NextResponse(raw, {
        headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400" },
      })
    }
    pos += 4 // skip \r\n\r\n

    // Find the closing boundary
    const endBoundary = new TextEncoder().encode(`\r\n--${boundary}--`)
    let end = findSeq(u8, endBoundary, pos)
    if (end < 0) {
      // Try just the boundary (last part)
      end = findSeq(u8, boundaryBytes, pos)
    }
    if (end < 0) {
      end = u8.length
    }

    // Strip trailing \r\n from the image data
    while (end > pos && (u8[end - 1] === 10 || u8[end - 1] === 13)) end--

    const imageData = u8.slice(pos, end)

    return new NextResponse(imageData, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(imageData.length),
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (err) {
    console.error("Storage proxy error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
