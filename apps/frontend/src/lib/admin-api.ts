import type {
  AdminInquiriesResponse,
  AdminLoginRequestDto,
  AdminUserDto,
  InquiryDetailDto,
  InquiryStatus,
  InquiryStatusHistoryDto,
  InquirySummaryDto,
  NewInquiriesCountDto,
  PresignedUploadRequestDto,
  PresignedUploadResponseDto,
} from "@/types/api";

const ADMIN_TOKEN_KEY = "mg_admin_token";

export function getAdminAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {
    // storage not available
  }
}

function getAuthHeaders(additional?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const token = getAdminAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return { ...headers, ...additional };
}

const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    const host = window.location.hostname || "localhost";
    const isLocal =
      host === "localhost" || host === "127.0.0.1" || host === "[::1]";

    // When accessed through ngrok/HTTPS tunnel or external IP, route via Next.js reverse rewrite
    // to prevent Mixed Content (HTTPS page calling HTTP backend) and cross-site cookie restrictions
    if (!isLocal || window.location.protocol === "https:") {
      return "/api/backend/v1";
    }

    return `http://${host}:8080/api/v1`;
  }
  const internal = process.env.INTERNAL_API_URL || process.env.BACKEND_URL;
  if (internal) {
    const clean = internal.replace(/\/+$/, "");
    return clean.endsWith("/api/v1")
      ? clean
      : clean.endsWith("/api")
      ? `${clean}/v1`
      : `${clean}/api/v1`;
  }
  return "http://127.0.0.1:8080/api/v1";
};

const DEMO_INQUIRIES_STORAGE_KEY = "mg_demo_admin_inquiries";

const INITIAL_DEMO_INQUIRIES: InquiryDetailDto[] = [
  {
    id: 1042,
    clientName: "Азиза Каримова",
    clientPhone: "+998 90 123 45 67",
    comment:
      "Здравствуйте! Интересует возможность изготовления кольца в белом золоте 750 пробы с памятной гравировкой даты на внутренней стороне шинки.",
    status: "NEW",
    createdAt: "2026-09-25T14:30:00Z",
    items: [
      {
        id: 1,
        quantity: 1,
        snapshot: {
          productId: 1,
          sku: "MG-R-001",
          name: "Кольцо «Сияние Востока» с бриллиантом",
          mainImageUrl:
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80",
          characteristics: [
            { name: "Металл", value: "Желтое золото" },
            { name: "Проба", value: "585" },
            { name: "Вес изделия", value: "3.42 г" },
            { name: "Размер кольца", value: "17.5" },
          ],
          stones: [
            {
              stoneTypeName: "Бриллиант",
              characteristics: [
                { name: "Вес вставки", value: "0.50 ct" },
                { name: "Огранка", value: "Круглая (57 граней)" },
                { name: "Цвет / Чистота", value: "3/4" },
              ],
            },
          ],
        },
      },
    ],
    statusHistory: [
      {
        id: 1,
        oldStatus: null,
        newStatus: "NEW",
        changedBy: "Клиент (Витрина)",
        changedAt: "2026-09-25T14:30:00Z",
      },
    ],
  },
  {
    id: 1041,
    clientName: "Фарход Рахимов",
    clientPhone: "+998 91 987 65 43",
    comment:
      "Нужен комплект к юбилею супруги. Подскажите ориентировочные сроки изготовления и возможность экспресс-доставки в Самарканд.",
    status: "NEW",
    createdAt: "2026-09-25T13:15:00Z",
    items: [
      {
        id: 2,
        quantity: 1,
        snapshot: {
          productId: 2,
          sku: "MG-E-002",
          name: "Серьги «Бухарская роза» с изумрудами",
          mainImageUrl:
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=80",
          characteristics: [
            { name: "Металл", value: "Белое золото" },
            { name: "Проба", value: "750" },
            { name: "Вес изделия", value: "5.60 г" },
            { name: "Тип замка", value: "Английский замок" },
          ],
          stones: [
            {
              stoneTypeName: "Изумруд природный",
              characteristics: [
                { name: "Общий вес", value: "1.20 ct" },
                { name: "Месторождение", value: "Колумбия" },
                { name: "Цвет / Чистота", value: "1/2" },
              ],
            },
          ],
        },
      },
    ],
    statusHistory: [
      {
        id: 2,
        oldStatus: null,
        newStatus: "NEW",
        changedBy: "Клиент (Витрина)",
        changedAt: "2026-09-25T13:15:00Z",
      },
    ],
  },
  {
    id: 1040,
    clientName: "Дильноза Юсупова",
    clientPhone: "+998 93 555 12 34",
    comment:
      "Связались в Telegram, согласовываем пробу золота и точный оттенок сапфира.",
    status: "CONTACTED",
    createdAt: "2026-09-24T18:00:00Z",
    items: [
      {
        id: 3,
        quantity: 1,
        snapshot: {
          productId: 3,
          sku: "MG-B-003",
          name: "Браслет «Царица Самарканда»",
          mainImageUrl:
            "https://images.unsplash.com/photo-1611591475155-42646b5a371c?auto=format&fit=crop&w=1000&q=80",
          characteristics: [
            { name: "Металл", value: "Красное золото" },
            { name: "Проба", value: "585" },
            { name: "Вес изделия", value: "12.80 г" },
            { name: "Длина браслета", value: "18.5 см" },
          ],
          stones: [
            {
              stoneTypeName: "Сапфир",
              characteristics: [
                { name: "Вес вставок", value: "2.40 ct" },
                { name: "Цвет", value: "Королевский синий" },
              ],
            },
          ],
        },
      },
    ],
    statusHistory: [
      {
        id: 3,
        oldStatus: null,
        newStatus: "NEW",
        changedBy: "Клиент (Витрина)",
        changedAt: "2026-09-24T18:00:00Z",
      },
      {
        id: 4,
        oldStatus: "NEW",
        newStatus: "CONTACTED",
        changedBy: "master",
        changedAt: "2026-09-24T19:20:00Z",
      },
    ],
  },
  {
    id: 1039,
    clientName: "Шерзод Алимов",
    clientPhone: "+998 97 777 88 99",
    comment:
      "Аванс получен. Отливка основы и закрепка камней переданы в работу мастера.",
    status: "IN_PROGRESS",
    createdAt: "2026-09-22T11:20:00Z",
    items: [
      {
        id: 4,
        quantity: 1,
        snapshot: {
          productId: 4,
          sku: "MG-P-004",
          name: "Подвеска «Звезда Улугбека» с рубином",
          mainImageUrl:
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80",
          characteristics: [
            { name: "Металл", value: "Желтое золото" },
            { name: "Проба", value: "585" },
            { name: "Вес изделия", value: "4.15 г" },
          ],
          stones: [
            {
              stoneTypeName: "Рубин бирманский",
              characteristics: [
                { name: "Вес вставки", value: "0.85 ct" },
                { name: "Огранка", value: "Овал" },
              ],
            },
          ],
        },
      },
      {
        id: 5,
        quantity: 1,
        snapshot: {
          productId: 1,
          sku: "MG-R-001",
          name: "Кольцо «Сияние Востока» с бриллиантом",
          mainImageUrl:
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80",
          characteristics: [
            { name: "Металл", value: "Желтое золото" },
            { name: "Проба", value: "585" },
            { name: "Вес изделия", value: "3.40 г" },
            { name: "Размер кольца", value: "16.5" },
          ],
          stones: [
            {
              stoneTypeName: "Бриллиант",
              characteristics: [{ name: "Вес вставки", value: "0.50 ct" }],
            },
          ],
        },
      },
    ],
    statusHistory: [
      {
        id: 5,
        oldStatus: null,
        newStatus: "NEW",
        changedBy: "Клиент (Витрина)",
        changedAt: "2026-09-22T11:20:00Z",
      },
      {
        id: 6,
        oldStatus: "NEW",
        newStatus: "CONTACTED",
        changedBy: "master",
        changedAt: "2026-09-22T12:00:00Z",
      },
      {
        id: 7,
        oldStatus: "CONTACTED",
        newStatus: "IN_PROGRESS",
        changedBy: "master",
        changedAt: "2026-09-23T10:15:00Z",
      },
    ],
  },
  {
    id: 1038,
    clientName: "Малика Назарова",
    clientPhone: "+998 90 333 44 55",
    comment:
      "Заказ выполнен и торжественно передан клиенту в мастерской. Отзыв отличный.",
    status: "COMPLETED",
    createdAt: "2026-09-18T16:45:00Z",
    items: [
      {
        id: 6,
        quantity: 1,
        snapshot: {
          productId: 2,
          sku: "MG-E-002",
          name: "Серьги «Бухарская роза» с изумрудами",
          mainImageUrl:
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=80",
          characteristics: [
            { name: "Металл", value: "Белое золото" },
            { name: "Проба", value: "750" },
            { name: "Вес изделия", value: "5.60 г" },
          ],
          stones: [
            {
              stoneTypeName: "Изумруд",
              characteristics: [{ name: "Вес вставок", value: "1.20 ct" }],
            },
          ],
        },
      },
    ],
    statusHistory: [
      {
        id: 8,
        oldStatus: null,
        newStatus: "NEW",
        changedBy: "Клиент (Витрина)",
        changedAt: "2026-09-18T16:45:00Z",
      },
      {
        id: 9,
        oldStatus: "NEW",
        newStatus: "CONTACTED",
        changedBy: "master",
        changedAt: "2026-09-18T17:30:00Z",
      },
      {
        id: 10,
        oldStatus: "CONTACTED",
        newStatus: "IN_PROGRESS",
        changedBy: "master",
        changedAt: "2026-09-19T09:15:00Z",
      },
      {
        id: 11,
        oldStatus: "IN_PROGRESS",
        newStatus: "COMPLETED",
        changedBy: "master",
        changedAt: "2026-09-24T15:00:00Z",
      },
    ],
  },
  {
    id: 1037,
    clientName: "Бахтиёр Саидов",
    clientPhone: "+998 94 111 22 33",
    comment:
      "Запрос отклонен: клиент просил серебряный сплав, мастерская работает исключительно с драгоценным золотом 585 и 750 пробы.",
    status: "REJECTED",
    createdAt: "2026-09-15T09:10:00Z",
    items: [
      {
        id: 7,
        quantity: 1,
        snapshot: {
          productId: 1,
          sku: "MG-R-001",
          name: "Кольцо «Сияние Востока» с бриллиантом",
          mainImageUrl:
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80",
          characteristics: [
            { name: "Металл", value: "Желтое золото" },
            { name: "Проба", value: "585" },
            { name: "Вес изделия", value: "3.42 г" },
          ],
        },
      },
    ],
    statusHistory: [
      {
        id: 12,
        oldStatus: null,
        newStatus: "NEW",
        changedBy: "Клиент (Витрина)",
        changedAt: "2026-09-15T09:10:00Z",
      },
      {
        id: 13,
        oldStatus: "NEW",
        newStatus: "REJECTED",
        changedBy: "master",
        changedAt: "2026-09-15T09:45:00Z",
      },
    ],
  },
];

function getStoredDemoInquiries(): InquiryDetailDto[] {
  if (typeof window === "undefined") {
    return INITIAL_DEMO_INQUIRIES;
  }
  try {
    const raw = sessionStorage.getItem(DEMO_INQUIRIES_STORAGE_KEY);
    if (!raw) {
      sessionStorage.setItem(
        DEMO_INQUIRIES_STORAGE_KEY,
        JSON.stringify(INITIAL_DEMO_INQUIRIES)
      );
      return INITIAL_DEMO_INQUIRIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_INQUIRIES;
  }
}

function saveStoredDemoInquiries(list: InquiryDetailDto[]): void {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(DEMO_INQUIRIES_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // storage unavailable
    }
  }
}

function getDemoInquiries(
  page: number = 0,
  size: number = 20,
  status?: InquiryStatus | "ALL"
): AdminInquiriesResponse {
  const all = getStoredDemoInquiries();
  const filtered =
    !status || status === "ALL"
      ? all
      : all.filter((inq) => inq.status === status);

  // Sort descending by createdAt
  filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / size) || 1;
  const start = page * size;
  const pagedItems = filtered.slice(start, start + size);

  const summaryItems: InquirySummaryDto[] = pagedItems.map((inq) => ({
    id: inq.id,
    clientName: inq.clientName,
    clientPhone: inq.clientPhone,
    itemCount: inq.items.reduce((acc, it) => acc + (it.quantity || 1), 0),
    status: inq.status,
    createdAt: inq.createdAt,
    updatedAt: inq.updatedAt,
  }));

  return {
    items: summaryItems,
    totalCount,
    totalPages,
    pageNumber: page,
    pageSize: size,
  };
}

function getDemoInquiryById(id: number): InquiryDetailDto | null {
  const all = getStoredDemoInquiries();
  return all.find((item) => item.id === id) || null;
}

function updateDemoInquiryStatus(
  id: number,
  newStatus: InquiryStatus
): InquiryDetailDto {
  const all = getStoredDemoInquiries();
  const index = all.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error(`Заявка #${id} не найдена`);
  }

  const current = all[index];
  const oldStatus = current.status;
  const now = new Date().toISOString();

  const historyEntry: InquiryStatusHistoryDto = {
    id: Date.now(),
    oldStatus,
    newStatus,
    changedBy: "master",
    changedAt: now,
  };

  const updated: InquiryDetailDto = {
    ...current,
    status: newStatus,
    updatedAt: now,
    statusHistory: [...(current.statusHistory || []), historyEntry],
  };

  all[index] = updated;
  saveStoredDemoInquiries(all);
  return updated;
}

/**
 * Authenticates master with HttpOnly cookie session.
 * Strictly calls backend POST /api/v1/admin/auth/login.
 * On success, backend sets secure HttpOnly JWT cookie (mg_admin_token).
 */
export async function adminLogin(
  credentials: AdminLoginRequestDto
): Promise<AdminUserDto> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/admin/auth/login`;

  let res: Response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
  } catch (err: unknown) {
    console.error("[Admin API] Ошибка при обращении к серверу авторизации:", err);
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error("Превышено время ожидания ответа сервера авторизации.");
      }
      throw new Error(
        `Сервер авторизации недоступен (${err.message}). Пожалуйста, убедитесь, что бэкенд запущен на порту 8080.`
      );
    }
    throw new Error(
      "Сервер авторизации недоступен. Пожалуйста, убедитесь, что бэкенд запущен на порту 8080."
    );
  }

  if (res.ok) {
    const user: AdminUserDto = await res.json();
    if (user.token) {
      setAdminAuthToken(user.token);
    }
    return user;
  }

  if (res.status === 401) {
    throw new Error("Неверный логин или пароль мастера");
  }

  const errData = await res.json().catch(() => null);
  throw new Error(errData?.message || `Ошибка авторизации (${res.status})`);
}

/**
 * Terminate master session and clear HttpOnly cookie on backend.
 */
export async function adminLogout(): Promise<void> {
  setAdminAuthToken(null);
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/admin/auth/logout`;

  try {
    await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
    });
  } catch {
    console.warn("[Admin API] Не удалось связаться с сервером при выходе.");
  }
}

/**
 * Fetch authenticated master profile. Returns null if unauthenticated.
 * Strictly validates active HttpOnly cookie session against backend GET /api/v1/admin/auth/me.
 */
export async function getAdminMe(): Promise<AdminUserDto | null> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/admin/auth/me`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const user: AdminUserDto = await res.json();
      return user;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fast polling endpoint for NEW inquiries count.
 * Used for 30-second background polling.
 */
export async function getNewInquiriesCount(): Promise<NewInquiriesCountDto> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/admin/inquiries/new-count`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const count = Number(data.count ?? data.newCount ?? 0);
      return {
        count,
        newCount: count,
      };
    }
  } catch {
    console.info("[Admin API] Inquiries polling offline fallback");
  }

  // Graceful fallback for offline demo
  const demoList = getStoredDemoInquiries();
  const count = demoList.filter((item) => item.status === "NEW").length;
  return {
    count,
    newCount: count,
  };
}

/**
 * Fetch paginated inquiries list for admin panel with optional status filter.
 * GET /api/v1/admin/inquiries?status={status}&page={page}&size={size}
 */
export async function getAdminInquiries(
  page: number = 0,
  size: number = 20,
  status?: InquiryStatus | "ALL"
): Promise<AdminInquiriesResponse> {
  const baseUrl = getApiBaseUrl();
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (status && status !== "ALL") {
    params.set("status", status);
  }

  const url = `${baseUrl}/admin/inquiries?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const items: InquirySummaryDto[] = await res.json();
      const totalCountHeader = res.headers.get("X-Total-Count");
      const totalPagesHeader = res.headers.get("X-Total-Pages");
      const pageNumberHeader = res.headers.get("X-Page-Number");
      const pageSizeHeader = res.headers.get("X-Page-Size");

      const totalCount = totalCountHeader
        ? Number(totalCountHeader)
        : items.length;
      const totalPages = totalPagesHeader
        ? Number(totalPagesHeader)
        : Math.ceil(totalCount / size) || 1;
      const pageNumber = pageNumberHeader ? Number(pageNumberHeader) : page;
      const pageSize = pageSizeHeader ? Number(pageSizeHeader) : size;

      return {
        items,
        totalCount,
        totalPages,
        pageNumber,
        pageSize,
      };
    }
  } catch {
    console.info(
      "[Admin API] Backend inquiries unreachable, using demo data fallback"
    );
  }

  // Demo fallback
  return getDemoInquiries(page, size, status);
}

/**
 * Fetch detailed inquiry by ID with immutable snapshot and status history timeline.
 * GET /api/v1/admin/inquiries/{id}
 */
export async function getAdminInquiryById(
  id: number | string
): Promise<InquiryDetailDto> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/admin/inquiries/${id}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const inquiry: InquiryDetailDto = await res.json();
      return inquiry;
    }

    if (res.status === 404) {
      throw new Error(`Заявка #${id} не найдена`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("не найдена")) {
      throw error;
    }
    console.info(
      `[Admin API] Backend inquiry #${id} unreachable, using demo fallback`
    );
  }

  // Demo fallback
  const demoInquiry = getDemoInquiryById(Number(id));
  if (demoInquiry) {
    return demoInquiry;
  }
  throw new Error(`Заявка #${id} не найдена`);
}

/**
 * Update inquiry status with explicit master confirmation.
 * PUT /api/v1/admin/inquiries/{id}/status
 */
export async function updateAdminInquiryStatus(
  id: number | string,
  status: InquiryStatus
): Promise<InquiryDetailDto> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/admin/inquiries/${id}/status`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: "PUT",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify({ status }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const updated: InquiryDetailDto = await res.json();
      return updated;
    }

    const err = await res.json().catch(() => null);
    throw new Error(err?.message || `Ошибка смены статуса (${res.status})`);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Ошибка смены статуса")
    ) {
      throw error;
    }
    console.info(
      `[Admin API] Backend status update unreachable, updating demo inquiry #${id}`
    );
  }

  // Demo fallback
  return updateDemoInquiryStatus(Number(id), status);
}

/**
 * Gentle acoustic notification chime for newly arrived customer inquiries.
 * Uses Web Audio API without requiring external audio files.
 */
export function playInquiryNotificationChime(): void {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Harmonic bell chime (E5 and B5)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1318.5, now); // E6

    gainNode.gain.setValueAtTime(0.06, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);
  } catch {
    // Silently continue if audio context is blocked by browser autoplay policy
  }
}
import {
  CategoryAdminDto,
  CategorySaveDto,
  CharacteristicKeyDto,
  CharacteristicKeySaveDto,
  StoneTypeAdminDto,
  StoneTypeSaveDto,
  ContactSettingsUpdateDto,
} from "@/types/api";

const DEMO_CATEGORIES_KEY = "mg_demo_categories";
const DEMO_CHAR_KEYS_KEY = "mg_demo_char_keys";
const DEMO_STONE_TYPES_KEY = "mg_demo_stone_types";
const DEMO_SETTINGS_KEY = "mg_demo_settings";

// --- Categories ---

export async function getAdminCategories(): Promise<CategoryAdminDto[]> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${baseUrl}/admin/categories`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
  } catch (err) {
    console.info("[Admin API] Backend categories unreachable, using demo data fallback");
  }

  // Fallback
  if (typeof window !== "undefined") {
    const data = sessionStorage.getItem(DEMO_CATEGORIES_KEY);
    if (data) return JSON.parse(data);
  }
  return [];
}

export async function createAdminCategory(data: CategorySaveDto): Promise<CategoryAdminDto> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${baseUrl}/admin/categories`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
    throw new Error("Ошибка при создании категории");
  } catch (err) {
    if (err instanceof Error && err.message.includes("Ошибка")) throw err;
    console.info("[Admin API] Fallback create category");
    const newItem: CategoryAdminDto = {
      id: Date.now(),
      name: data.name,
      slug: data.slug || "demo-cat",
      sortOrder: data.sortOrder || 0,
      isVisible: data.isVisible !== false,
      productCount: 0,
    };
    if (typeof window !== "undefined") {
      const list = JSON.parse(sessionStorage.getItem(DEMO_CATEGORIES_KEY) || "[]");
      list.push(newItem);
      sessionStorage.setItem(DEMO_CATEGORIES_KEY, JSON.stringify(list));
    }
    return newItem;
  }
}

export async function updateAdminCategory(id: number, data: CategorySaveDto): Promise<CategoryAdminDto> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${baseUrl}/admin/categories/${id}`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
    throw new Error("Ошибка при обновлении категории");
  } catch (err) {
    if (err instanceof Error && err.message.includes("Ошибка")) throw err;
    console.info("[Admin API] Fallback update category");
    let updated: CategoryAdminDto | null = null;
    if (typeof window !== "undefined") {
      const list = JSON.parse(sessionStorage.getItem(DEMO_CATEGORIES_KEY) || "[]") as CategoryAdminDto[];
      const idx = list.findIndex(c => c.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data, slug: data.slug || list[idx].slug };
        updated = list[idx];
        sessionStorage.setItem(DEMO_CATEGORIES_KEY, JSON.stringify(list));
      }
    }
    if (!updated) throw new Error("Not found in demo data");
    return updated;
  }
}

export async function deleteAdminCategory(id: number): Promise<void> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${baseUrl}/admin/categories/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok || res.status === 204) return;
    throw new Error("Ошибка при удалении категории");
  } catch (err) {
    if (err instanceof Error && err.message.includes("Ошибка")) throw err;
    if (typeof window !== "undefined") {
      const list = JSON.parse(sessionStorage.getItem(DEMO_CATEGORIES_KEY) || "[]") as CategoryAdminDto[];
      sessionStorage.setItem(DEMO_CATEGORIES_KEY, JSON.stringify(list.filter(c => c.id !== id)));
    }
  }
}

// --- Characteristics ---

export async function getAdminCharacteristicKeys(): Promise<CharacteristicKeyDto[]> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${baseUrl}/admin/characteristic-keys`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
  } catch (err) {
    // fallback
  }
  if (typeof window !== "undefined") {
    const data = sessionStorage.getItem(DEMO_CHAR_KEYS_KEY);
    if (data) return JSON.parse(data);
  }
  return [];
}

export async function createAdminCharacteristicKey(data: CharacteristicKeySaveDto): Promise<CharacteristicKeyDto> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${baseUrl}/admin/characteristic-keys`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
    throw new Error("Ошибка при создании ключа");
  } catch (err) {
    if (err instanceof Error && err.message.includes("Ошибка")) throw err;
    const newItem: CharacteristicKeyDto = {
      id: Date.now(),
      name: data.name,
      unit: data.unit,
      sortOrder: data.sortOrder || 0,
      isFilterable: data.isFilterable || false,
    };
    if (typeof window !== "undefined") {
      const list = JSON.parse(sessionStorage.getItem(DEMO_CHAR_KEYS_KEY) || "[]");
      list.push(newItem);
      sessionStorage.setItem(DEMO_CHAR_KEYS_KEY, JSON.stringify(list));
    }
    return newItem;
  }
}

export async function deleteAdminCharacteristicKey(id: number): Promise<void> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${baseUrl}/admin/characteristic-keys/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok || res.status === 204) return;
    throw new Error("Ошибка при удалении ключа");
  } catch (err) {
    if (err instanceof Error && err.message.includes("Ошибка")) throw err;
    if (typeof window !== "undefined") {
      const list = JSON.parse(sessionStorage.getItem(DEMO_CHAR_KEYS_KEY) || "[]") as CharacteristicKeyDto[];
      sessionStorage.setItem(DEMO_CHAR_KEYS_KEY, JSON.stringify(list.filter(c => c.id !== id)));
    }
  }
}

// --- Stone Types ---

export async function getAdminStoneTypes(): Promise<StoneTypeAdminDto[]> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${baseUrl}/admin/stone-types`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
  } catch (err) {
    // fallback
  }
  if (typeof window !== "undefined") {
    const data = sessionStorage.getItem(DEMO_STONE_TYPES_KEY);
    if (data) return JSON.parse(data);
  }
  return [];
}

export async function createAdminStoneType(data: StoneTypeSaveDto): Promise<StoneTypeAdminDto> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${baseUrl}/admin/stone-types`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
    throw new Error("Ошибка при создании типа камня");
  } catch (err) {
    if (err instanceof Error && err.message.includes("Ошибка")) throw err;
    const newItem: StoneTypeAdminDto = {
      id: Date.now(),
      name: data.name,
      isActive: data.isActive !== false,
    };
    if (typeof window !== "undefined") {
      const list = JSON.parse(sessionStorage.getItem(DEMO_STONE_TYPES_KEY) || "[]");
      list.push(newItem);
      sessionStorage.setItem(DEMO_STONE_TYPES_KEY, JSON.stringify(list));
    }
    return newItem;
  }
}

export async function deleteAdminStoneType(id: number): Promise<void> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${baseUrl}/admin/stone-types/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok || res.status === 204) return;
    throw new Error("Ошибка при удалении");
  } catch (err) {
    if (err instanceof Error && err.message.includes("Ошибка")) throw err;
    if (typeof window !== "undefined") {
      const list = JSON.parse(sessionStorage.getItem(DEMO_STONE_TYPES_KEY) || "[]") as StoneTypeAdminDto[];
      sessionStorage.setItem(DEMO_STONE_TYPES_KEY, JSON.stringify(list.filter(c => c.id !== id)));
    }
  }
}

// --- Settings ---

export async function getAdminSettings(): Promise<Record<string, string>> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${baseUrl}/admin/settings`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
  } catch (err) {
    // fallback
  }
  if (typeof window !== "undefined") {
    const data = sessionStorage.getItem(DEMO_SETTINGS_KEY);
    if (data) return JSON.parse(data);
  }
  return {
    telegramUsername: "marziya_gold",
    phoneNumber: "+998 90 123 45 67",
    masterBio: "Мастер с 20-летним опытом",
  };
}

export async function updateAdminSettings(data: ContactSettingsUpdateDto): Promise<Record<string, string>> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${baseUrl}/admin/settings`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
    throw new Error("Ошибка при обновлении настроек");
  } catch (err) {
    if (err instanceof Error && err.message.includes("Ошибка")) throw err;
    if (typeof window !== "undefined") {
      const old = JSON.parse(sessionStorage.getItem(DEMO_SETTINGS_KEY) || "{}");
      const updated = { ...old, ...data };
      sessionStorage.setItem(DEMO_SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    }
    return data as Record<string, string>;
  }
}

// --- Products ---

export async function getAdminProducts(params: { page?: number; size?: number; q?: string; categoryId?: number; isVisible?: boolean }) {
  const baseUrl = getApiBaseUrl();
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set("page", params.page.toString());
  if (params.size !== undefined) searchParams.set("size", params.size.toString());
  if (params.q) searchParams.set("q", params.q);
  if (params.categoryId !== undefined) searchParams.set("categoryId", params.categoryId.toString());
  if (params.isVisible !== undefined) searchParams.set("isVisible", params.isVisible.toString());

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${baseUrl}/admin/products?${searchParams.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
    throw new Error("Failed to fetch products");
  } catch (err) {
    throw err;
  }
}

export async function getAdminProductById(id: number) {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${baseUrl}/admin/products/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
    throw new Error("Failed to fetch product");
  } catch (err) {
    throw err;
  }
}

export async function createAdminProduct(data: any) {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${baseUrl}/admin/products`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
    throw new Error("Failed to create product");
  } catch (err) {
    throw err;
  }
}

export async function updateAdminProduct(id: number, data: any) {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${baseUrl}/admin/products/${id}`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
    throw new Error("Failed to update product");
  } catch (err) {
    throw err;
  }
}

export async function deleteAdminProduct(id: number): Promise<void> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${baseUrl}/admin/products/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok || res.status === 204) return;
    throw new Error("Failed to delete product");
  } catch (err) {
    throw err;
  }
}

export async function toggleAdminProductVisibility(id: number, isVisible: boolean) {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${baseUrl}/admin/products/${id}/visibility`, {
      method: "PATCH",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify({ isVisible }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
    throw new Error("Failed to toggle visibility");
  } catch (err) {
    throw err;
  }
}

// --- Media ---

export async function requestPresignedUpload(
  request: PresignedUploadRequestDto
): Promise<PresignedUploadResponseDto> {
  const baseUrl = getApiBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${baseUrl}/admin/media/presign-upload`, {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Failed to get presigned upload URL: ${res.status} ${errText}`);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function fallbackServerUpload(file: File): Promise<{ url: string; publicId: string }> {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append("file", file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${baseUrl}/admin/media/upload`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
    throw new Error(`Failed to upload media via server fallback: ${res.status}`);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Uploads media file to storage.
 * Primary strategy: direct browser-to-R2 upload using presigned PUT URL.
 * Fallback strategy: legacy backend proxy upload (/admin/media/upload).
 */
export async function uploadMedia(file: File): Promise<{ url: string; publicId: string }> {
  const contentType = file.type || "image/jpeg";

  try {
    // 1. Obtain presigned PUT URL from backend
    const presign = await requestPresignedUpload({
      fileName: file.name,
      contentType,
    });

    // 2. Direct PUT to Cloudflare R2 bucket
    const r2Controller = new AbortController();
    const r2TimeoutId = setTimeout(() => r2Controller.abort(), 60000);

    const putRes = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: file,
      signal: r2Controller.signal,
    });
    clearTimeout(r2TimeoutId);

    if (putRes.ok) {
      return {
        url: presign.publicUrl,
        publicId: presign.objectKey,
      };
    }
    console.warn("Direct R2 PUT failed with status", putRes.status, "Falling back to server upload.");
  } catch (directErr) {
    console.warn("Direct R2 upload encountered error, falling back to server upload:", directErr);
  }

  // 3. Fallback: upload through backend proxy
  return await fallbackServerUpload(file);
}
