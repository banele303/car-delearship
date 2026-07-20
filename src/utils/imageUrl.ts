/**
 * Resolves a car photo URL to something renderable by Next.js <Image>.
 *
 * Convex File Storage serves files as multipart/form-data — browsers cannot
 * render this as an image directly. All Convex image URLs MUST go through
 * our /api/storage/[id] proxy, which strips the multipart envelope and
 * serves clean image/jpeg data.
 *
 * URL formats handled:
 *   1. Full Convex storage URL:
 *      "https://frugal-zebra-890.convex.cloud/api/storage/UUID"
 *      → extract UUID, proxy via /api/storage/UUID
 *
 *   2. Raw Convex storage ID (legacy, e.g. "kg2xAbc..." or "857f9ead-..."):
 *      → proxy via /api/storage/ID
 *
 *   3. Relative URL (e.g. "/placeholder.jpg"):
 *      → use as-is
 */
export function resolveCarImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.jpg";

  // Relative URL — use as-is (e.g. /placeholder.jpg)
  if (url.startsWith("/")) return url;

  // Full Convex storage URL — extract the storage ID (UUID after /api/storage/)
  // e.g. https://frugal-zebra-890.convex.cloud/api/storage/857f9ead-7be2-40e4-8052-2c8d5da49bbb
  const convexStorageMatch = url.match(/convex\.cloud\/api\/storage\/([a-f0-9-]+)$/i);
  if (convexStorageMatch) {
    const storageId = convexStorageMatch[1];
    return `/api/storage/${storageId}`;
  }

  // Any other https:// URL that is NOT a Convex storage URL — use directly
  // (e.g. images from S3, Unsplash, etc.)
  if (url.startsWith("https://") || url.startsWith("http://")) {
    // Check if it's any Convex URL that might need proxying
    if (url.includes("convex.cloud") || url.includes("convex.site")) {
      // Extract any trailing UUID-like segment and proxy it
      const idMatch = url.match(/\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i);
      if (idMatch) return `/api/storage/${idMatch[1]}`;
      // If no UUID pattern found, still proxy it to handle multipart stripping
      const encoded = encodeURIComponent(url);
      return `/api/storage/${encoded}`;
    }
    // Non-Convex HTTPS URL — pass through directly
    return url;
  }

  // Raw Convex storage ID (no prefix) — proxy it
  return `/api/storage/${url}`;
}

/**
 * Returns the first resolved image URL from a car's photoUrls array,
 * falling back to /placeholder.jpg if none exist.
 */
export function getPrimaryCarImage(photoUrls: string[] | null | undefined): string {
  if (!photoUrls || photoUrls.length === 0) return "/placeholder.jpg";
  return resolveCarImageUrl(photoUrls[0]);
}
