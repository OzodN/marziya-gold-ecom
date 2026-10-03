import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getBackendBaseUrl(): string {
  const raw =
    process.env.INTERNAL_API_URL ||
    process.env.BACKEND_URL ||
    "http://127.0.0.1:8080";

  return raw.replace(/\/api(\/v1)?\/?$/, "").replace(/\/+$/, "");
}

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await params;
  const subpath = path ? path.join("/") : "";
  const search = request.nextUrl.search;
  const backendBase = getBackendBaseUrl();
  const targetUrl = `${backendBase}/api/${subpath}${search}`;

  // Forward incoming headers
  const forwardHeaders = new Headers();
  for (const [key, value] of request.headers.entries()) {
    const lower = key.toLowerCase();
    if (
      lower !== "host" &&
      lower !== "connection" &&
      lower !== "content-length" &&
      lower !== "transfer-encoding"
    ) {
      forwardHeaders.set(key, value);
    }
  }

  // Preserve client IP in X-Forwarded-For
  const clientIp =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip");
  if (clientIp) {
    forwardHeaders.set("x-forwarded-for", clientIp);
  }

  // Read request body if present (supports JSON, URL-encoded, binary, multipart)
  let body: BodyInit | undefined = undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const buffer = await request.arrayBuffer();
      if (buffer.byteLength > 0) {
        body = buffer;
      }
    } catch {
      // Body empty or unreadable
    }
  }

  try {
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body,
      cache: "no-store",
      redirect: "manual",
    });

    const responseHeaders = new Headers();
    for (const [key, value] of backendResponse.headers.entries()) {
      const lower = key.toLowerCase();
      if (lower !== "content-encoding" && lower !== "transfer-encoding") {
        responseHeaders.set(key, value);
      }
    }

    // Preserve multiple Set-Cookie headers properly (critical for HttpOnly auth cookies)
    if (typeof backendResponse.headers.getSetCookie === "function") {
      const setCookies = backendResponse.headers.getSetCookie();
      if (setCookies && setCookies.length > 0) {
        responseHeaders.delete("set-cookie");
        setCookies.forEach((cookie) => {
          responseHeaders.append("set-cookie", cookie);
        });
      }
    }

    const responseBody = await backendResponse.arrayBuffer();

    return new Response(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const err = error as Error;
    console.error(`[Reverse Proxy Error] Failed to reach backend at ${targetUrl}:`, err.message);

    return NextResponse.json(
      {
        error: "Bad Gateway",
        message: `Не удалось связаться с сервером бэкенда по адресу ${targetUrl}. Проверьте переменную INTERNAL_API_URL и статус контейнера backend. Ошибка: ${err.message}`,
        targetUrl,
      },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}
