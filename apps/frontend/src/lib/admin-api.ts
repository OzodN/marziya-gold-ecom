import type {
  AdminInquiriesResponse,
  AdminLoginRequestDto,
  AdminUserDto,
  InquiryDetailDto,
  InquiryStatus,
  InquiryStatusHistoryDto,
  InquirySummaryDto,
  NewInquiriesCountDto,
} from "@/types/api";

const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  }
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api/v1"
  );
};

const DEMO_MASTER_USER: AdminUserDto = {
  id: 1,
  username: "master",
  role: "ROLE_ADMIN",
  createdAt: "2026-09-01T10:00:00Z",
};

const DEMO_SESSION_KEY = "mg_demo_admin_session";
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
 * On real backend, sets secure HttpOnly JWT cookie mg_admin_token.
 * Supports offline demo fallback if backend server is unreachable.
 */
export async function adminLogin(
  credentials: AdminLoginRequestDto
): Promise<AdminUserDto> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/admin/auth/login`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
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

    if (res.ok) {
      const user: AdminUserDto = await res.json();
      if (typeof window !== "undefined") {
        sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
      }
      return user;
    }

    if (res.status === 401) {
      throw new Error("Неверный логин или пароль мастера");
    }

    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || `Ошибка авторизации (${res.status})`);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Неверный логин")) {
      throw error;
    }

    // Backend is unreachable - fallback to offline demo check
    console.info(
      "[Admin API] Backend unreachable, checking demo credentials fallback..."
    );
    const validDemoLogins = ["master", "admin"];
    const validDemoPasswords = ["master123", "admin123", "master", "admin"];

    if (
      validDemoLogins.includes(credentials.username.trim().toLowerCase()) &&
      validDemoPasswords.includes(credentials.password)
    ) {
      const user = {
        ...DEMO_MASTER_USER,
        username: credentials.username.trim(),
      };
      if (typeof window !== "undefined") {
        sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
      }
      return user;
    }

    throw new Error(
      "Неверный логин или пароль мастера. (Для демо используйте: master / master123)"
    );
  }
}

/**
 * Terminate master session and clear HttpOnly cookie.
 */
export async function adminLogout(): Promise<void> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/admin/auth/logout`;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    });
  } catch {
    console.info("[Admin API] Backend logout offline fallback");
  } finally {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(DEMO_SESSION_KEY);
    }
  }
}

/**
 * Fetch authenticated master profile. Returns null if unauthenticated.
 */
export async function getAdminMe(): Promise<AdminUserDto | null> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/admin/auth/me`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const user: AdminUserDto = await res.json();
      if (typeof window !== "undefined") {
        sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
      }
      return user;
    }

    if (res.status === 401 || res.status === 403) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(DEMO_SESSION_KEY);
      }
      return null;
    }
  } catch {
    // Check if offline demo session is stored
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(DEMO_SESSION_KEY);
      if (stored) {
        try {
          return JSON.parse(stored) as AdminUserDto;
        } catch {
          return null;
        }
      }
    }
  }

  return null;
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
      headers: {
        Accept: "application/json",
      },
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
      headers: {
        Accept: "application/json",
      },
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
      headers: {
        Accept: "application/json",
      },
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
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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
