import { describe, it, expect, beforeEach, afterEach } from "vitest";
import cloudflareLoader, { getMediaBaseUrl } from "@/imageLoader";

describe("cloudflareLoader", () => {
  const originalEnv = process.env.NEXT_PUBLIC_MEDIA_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_MEDIA_URL;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_MEDIA_URL = originalEnv;
  });

  it("returns default media base url when env variable is not set", () => {
    expect(getMediaBaseUrl()).toBe("https://media.marziyagold.uz");
  });

  it("returns custom media base url when NEXT_PUBLIC_MEDIA_URL is configured", () => {
    process.env.NEXT_PUBLIC_MEDIA_URL = "https://custom-media.example.com/";
    expect(getMediaBaseUrl()).toBe("https://custom-media.example.com");
  });

  it("returns empty string when src is empty", () => {
    expect(cloudflareLoader({ src: "", width: 600 })).toBe("");
  });

  it("transforms relative path with default quality (80)", () => {
    const result = cloudflareLoader({
      src: "products/42/ring-solitaire.jpg",
      width: 800,
    });
    expect(result).toBe(
      "https://media.marziyagold.uz/cdn-cgi/image/width=800,quality=80,format=auto/products/42/ring-solitaire.jpg"
    );
  });

  it("transforms relative path with leading slash and explicit quality", () => {
    const result = cloudflareLoader({
      src: "/products/42/ring-solitaire.jpg",
      width: 1200,
      quality: 90,
    });
    expect(result).toBe(
      "https://media.marziyagold.uz/cdn-cgi/image/width=1200,quality=90,format=auto/products/42/ring-solitaire.jpg"
    );
  });

  it("transforms absolute URL matching media domain", () => {
    const result = cloudflareLoader({
      src: "https://media.marziyagold.uz/products/earrings.webp",
      width: 400,
      quality: 75,
    });
    expect(result).toBe(
      "https://media.marziyagold.uz/cdn-cgi/image/width=400,quality=75,format=auto/products/earrings.webp"
    );
  });

  it("normalizes and re-transforms already transformed Cloudflare URL", () => {
    const alreadyTransformed =
      "https://media.marziyagold.uz/cdn-cgi/image/width=200,quality=50,format=auto/products/chain.png";
    const result = cloudflareLoader({
      src: alreadyTransformed,
      width: 800,
      quality: 85,
    });
    expect(result).toBe(
      "https://media.marziyagold.uz/cdn-cgi/image/width=800,quality=85,format=auto/products/chain.png"
    );
  });

  it("preserves external third-party images (e.g. Unsplash demo seeds)", () => {
    const unsplashUrl =
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80";
    const result = cloudflareLoader({
      src: unsplashUrl,
      width: 800,
    });
    expect(result).toBe(unsplashUrl);
  });

  it("preserves local static public images under /images/", () => {
    const localIcon = "/images/icon-gold.png";
    const result = cloudflareLoader({
      src: localIcon,
      width: 44,
    });
    expect(result).toBe(localIcon);
  });

  it("preserves Next.js internal static assets under /_next/", () => {
    const nextAsset = "/_next/static/media/brand-logo.abcdef12.png";
    const result = cloudflareLoader({
      src: nextAsset,
      width: 120,
    });
    expect(result).toBe(nextAsset);
  });

  it("preserves data URLs without transformation", () => {
    const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ";
    const result = cloudflareLoader({
      src: dataUrl,
      width: 200,
    });
    expect(result).toBe(dataUrl);
  });

  it("preserves blob URLs without transformation", () => {
    const blobUrl = "blob:https://example.com/uuid-blob-1234";
    const result = cloudflareLoader({
      src: blobUrl,
      width: 200,
    });
    expect(result).toBe(blobUrl);
  });

  it("handles SVG files without cdn-cgi rasterization transformation", () => {
    const svgPath = "products/icons/gold-stamp.svg";
    const result = cloudflareLoader({
      src: svgPath,
      width: 100,
    });
    expect(result).toBe("https://media.marziyagold.uz/products/icons/gold-stamp.svg");
  });

  describe("Cloudflare R2 development bucket domain (*.r2.dev)", () => {
    const r2DirectUrl =
      "https://pub-2654004d07744e199ddd02d0ac964199.r2.dev/products/a1ace904-00b0-437f-86ea-839718f6b67b.jpg";

    it("serves direct raw URL for *.r2.dev without unsupported /cdn-cgi/image/ transformation", () => {
      const result = cloudflareLoader({
        src: r2DirectUrl,
        width: 1080,
        quality: 80,
      });
      expect(result).toBe(r2DirectUrl);
    });

    it("serves direct raw URL even when NEXT_PUBLIC_MEDIA_URL matches the *.r2.dev domain", () => {
      process.env.NEXT_PUBLIC_MEDIA_URL =
        "https://pub-2654004d07744e199ddd02d0ac964199.r2.dev";
      const result = cloudflareLoader({
        src: r2DirectUrl,
        width: 800,
      });
      expect(result).toBe(r2DirectUrl);
    });

    it("strips errant /cdn-cgi/image/ prefix if present on *.r2.dev domain", () => {
      const errantUrl =
        "https://pub-2654004d07744e199ddd02d0ac964199.r2.dev/cdn-cgi/image/width=600,quality=80,format=auto/products/item.png";
      const result = cloudflareLoader({
        src: errantUrl,
        width: 600,
      });
      expect(result).toBe(
        "https://pub-2654004d07744e199ddd02d0ac964199.r2.dev/products/item.png"
      );
    });

    it("does not apply /cdn-cgi/image/ to relative paths when NEXT_PUBLIC_MEDIA_URL is an *.r2.dev domain", () => {
      process.env.NEXT_PUBLIC_MEDIA_URL =
        "https://pub-2654004d07744e199ddd02d0ac964199.r2.dev";
      const result = cloudflareLoader({
        src: "/products/bracelet.jpg",
        width: 800,
      });
      expect(result).toBe(
        "https://pub-2654004d07744e199ddd02d0ac964199.r2.dev/products/bracelet.jpg"
      );
    });
  });
});

