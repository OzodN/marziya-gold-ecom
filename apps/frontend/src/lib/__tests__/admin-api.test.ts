import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { uploadMedia, requestPresignedUpload } from "@/lib/admin-api";

describe("admin-api media upload", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("uploads directly to Cloudflare R2 via presigned PUT URL when presign succeeds", async () => {
    const mockFile = new File(["dummy content"], "ring.png", { type: "image/png" });

    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      // 1. Presign call to backend
      if (url.includes("/admin/media/presign-upload")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              uploadUrl: "https://r2.cloudflarestorage.com/marziya-media/products/ring.png?signature=xyz",
              publicUrl: "https://media.marziyagold.uz/products/ring.png",
              objectKey: "products/ring.png",
              expiresAt: "2026-10-02T12:00:00Z",
            }),
        } as Response);
      }

      // 2. Direct PUT to Cloudflare R2
      if (url.includes("r2.cloudflarestorage.com") && init?.method === "PUT") {
        return Promise.resolve({
          ok: true,
          status: 200,
        } as Response);
      }

      return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
    });

    const result = await uploadMedia(mockFile);

    expect(result).toEqual({
      url: "https://media.marziyagold.uz/products/ring.png",
      publicId: "products/ring.png",
    });
  });

  it("falls back to server upload if direct R2 upload fails with HTTP error", async () => {
    const mockFile = new File(["dummy content"], "ring.png", { type: "image/png" });

    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      // 1. Presign call
      if (url.includes("/admin/media/presign-upload")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              uploadUrl: "https://r2.cloudflarestorage.com/marziya-media/products/ring.png?signature=xyz",
              publicUrl: "https://media.marziyagold.uz/products/ring.png",
              objectKey: "products/ring.png",
              expiresAt: "2026-10-02T12:00:00Z",
            }),
        } as Response);
      }

      // 2. Direct PUT fails (e.g. CORS or network error)
      if (url.includes("r2.cloudflarestorage.com")) {
        return Promise.resolve({
          ok: false,
          status: 403,
        } as Response);
      }

      // 3. Fallback server upload
      if (url.includes("/admin/media/upload") && init?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              url: "https://media.marziyagold.uz/fallback/ring.png",
              publicId: "fallback/ring.png",
            }),
        } as Response);
      }

      return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
    });

    const result = await uploadMedia(mockFile);

    expect(result).toEqual({
      url: "https://media.marziyagold.uz/fallback/ring.png",
      publicId: "fallback/ring.png",
    });
  });
});
