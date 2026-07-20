import { NextRequest, NextResponse } from "next/server"

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://frugal-zebra-890.convex.cloud"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Step 1: Resolve storage ID to CDN URL via Convex HTTP API
    const queryResp = await fetch(`${CONVEX_URL}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "files:getUrl",
        args: { storageId: id },
      }),
    })
    const queryData = await queryResp.json()
    const imgUrl = queryData.value || queryData.result

    if (!imgUrl || typeof imgUrl !== "string") {
      console.error("getUrl returned:", JSON.stringify(queryData))
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Step 2: Fetch the image
    const imgResp = await fetch(imgUrl)
    if (!imgResp.ok) {
      return NextResponse.json({ error: "Fetch failed" }, { status: 502 })
    }

    // Step 3: Get raw bytes
    const arrayBuffer = await imgResp.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    // Step 4: Detect content type from magic bytes
    let contentType = "image/jpeg"
    if (bytes[0] === 0x89 && bytes[1] === 0x50) contentType = "image/png"
    else if (bytes[0] === 0x52 && bytes[1] === 0x49) contentType = "image/webp"

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.length),
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (err) {
    console.error("Storage proxy error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
