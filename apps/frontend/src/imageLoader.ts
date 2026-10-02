/**
 * Cloudflare Image Transformations Loader for Next.js (ADR-0002)
 *
 * Transforms image URLs to use Cloudflare edge transformations:
 * `${baseUrl}/cdn-cgi/image/width=${width},quality=${quality || 80},format=auto/${cleanPath}`
 *
 * Preserves:
 * - Local static assets (/images/*, /_next/*)
 * - Data URLs and Blobs (data:*, blob:*)
 * - Vector images (.svg)
 * - External 3rd party URLs (e.g. Unsplash demo seeds)
 */

export interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

const DEFAULT_MEDIA_BASE_URL = "https://media.marziyagold.uz";

export function getMediaBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_MEDIA_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, "");
  }
  return DEFAULT_MEDIA_BASE_URL;
}

export default function cloudflareLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (!src) return "";

  // 1. Preserve data URLs and blob URLs
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }

  // 2. Preserve local Next.js static assets and public icons
  if (src.startsWith("/_next/") || src.startsWith("/images/")) {
    return src;
  }

  const baseUrl = getMediaBaseUrl();
  let mediaHost = "";
  try {
    mediaHost = new URL(baseUrl).hostname.toLowerCase();
  } catch {
    mediaHost = "media.marziyagold.uz";
  }

  const q = quality || 80;
  const isSvg = src.split("?")[0].toLowerCase().endsWith(".svg");

  // 3. Handle absolute HTTP/HTTPS URLs
  if (src.startsWith("http://") || src.startsWith("https://")) {
    try {
      const url = new URL(src);
      const host = url.hostname.toLowerCase();

      // If URL is not hosted on our Cloudflare media domain, preserve as-is (e.g. Unsplash demo seeds)
      if (host !== mediaHost) {
        return src;
      }

      // If it is our media host, extract the clean object path
      let pathname = url.pathname.replace(/^\/+/, "");

      // If URL was already transformed with /cdn-cgi/image/..., strip the old prefix
      if (pathname.startsWith("cdn-cgi/image/")) {
        const parts = pathname.split("/");
        // Format: cdn-cgi/image/<options>/<actual-path...>
        pathname = parts.slice(3).join("/");
      }

      if (isSvg) {
        return `${baseUrl}/${pathname}${url.search}`;
      }

      return `${baseUrl}/cdn-cgi/image/width=${width},quality=${q},format=auto/${pathname}${url.search}`;
    } catch {
      return src;
    }
  }

  // 4. Handle relative paths (e.g. "products/1/ring.jpg" or "/products/1/ring.jpg")
  const cleanPath = src.replace(/^\/+/, "");

  if (isSvg) {
    return `${baseUrl}/${cleanPath}`;
  }

  return `${baseUrl}/cdn-cgi/image/width=${width},quality=${q},format=auto/${cleanPath}`;
}
