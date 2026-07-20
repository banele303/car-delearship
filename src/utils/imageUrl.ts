/**
 * Resolves a car photo URL to something renderable by Next.js <Image>.
 *
 * URL formats handled:
 *   1. Direct HTTPS/HTTP URL (including Convex CDN storage URLs like
 *      "https://frugal-zebra-890.convex.cloud/api/storage/..."):
 *      → used directly by <Image>
 *
 *   2. Relative URL (e.g. "/placeholder.jpg"):
 *      → used as-is
 *
 *   3. Raw Convex storage ID (legacy "kg2..."):
 *      → proxied via /api/storage/ID
 */
export function resolveCarImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.jpg";

  // Relative URL — use as-is (e.g. /placeholder.jpg)
  if (url.startsWith("/")) return url;

  // Direct HTTP or HTTPS URL (Convex CDN, S3, Unsplash, etc.) — return as-is
  if (url.startsWith("https://") || url.startsWith("http://")) {
    return url;
  }

  // Raw Convex storage ID (no prefix) — proxy via /api/storage/[id]
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
