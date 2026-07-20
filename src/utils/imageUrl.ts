/**
 * Resolves a car photo URL to something renderable by Next.js <Image>.
 *
 * Convex File Storage can return URLs in different formats depending on
 * when they were uploaded:
 *
 *   1. Real HTTPS CDN URL   → "https://....convex.cloud/api/storage/..."
 *      These work directly with <Image> (no proxy needed).
 *
 *   2. Raw storage ID       → "kg2xAbc123..." (old format from earlier uploads)
 *      These need to be proxied through /api/storage/[id].
 *
 *   3. Local/relative URL   → "/placeholder.jpg"
 *      Used as fallback.
 */
export function resolveCarImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.jpg";

  // Already a full HTTPS URL — use directly
  if (url.startsWith("https://") || url.startsWith("http://")) {
    return url;
  }

  // Relative URL (e.g. /placeholder.jpg) — use as-is
  if (url.startsWith("/")) {
    return url;
  }

  // Raw Convex storage ID — proxy through our API route
  // The route at /api/storage/[id] calls files:getUrl and proxies the image
  return `/api/storage/${url}`;
}

/**
 * Returns the first valid photo URL from a car's photoUrls array,
 * falling back to /placeholder.jpg if none exist.
 */
export function getPrimaryCarImage(photoUrls: string[] | null | undefined): string {
  if (!photoUrls || photoUrls.length === 0) return "/placeholder.jpg";
  return resolveCarImageUrl(photoUrls[0]);
}
