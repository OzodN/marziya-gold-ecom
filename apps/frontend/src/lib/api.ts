import type {
  CategoryDto,
  FilterGroupDto,
  InquiryCreateRequestDto,
  InquiryResponseDto,
  PageResponseProductSummaryDto,
  ProductAvailabilityDto,
  ProductFilterParams,
  ProductSummaryDto,
  StoneTypeDto,
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

// ============================================================================
// DEMO SEED DATA (Synchronized with database/V2__seed_initial_data.sql)
// ============================================================================

export const DEMO_CATEGORIES: CategoryDto[] = [
  { id: 1, name: "Кольца", slug: "koltsa", sortOrder: 1 },
  { id: 2, name: "Серьги", slug: "sergi", sortOrder: 2 },
  { id: 3, name: "Браслеты", slug: "braslety", sortOrder: 3 },
  { id: 4, name: "Колье и подвески", slug: "kolye-i-podveski", sortOrder: 4 },
  { id: 5, name: "Броши", slug: "broshi", sortOrder: 5 },
];

export const DEMO_STONE_TYPES: StoneTypeDto[] = [
  { id: 1, name: "Бриллиант", isActive: true },
  { id: 2, name: "Сапфир", isActive: true },
  { id: 3, name: "Изумруд", isActive: true },
  { id: 4, name: "Рубин", isActive: true },
  { id: 5, name: "Жемчуг", isActive: true },
  { id: 6, name: "Топаз", isActive: true },
];

export const DEMO_FILTER_KEYS: FilterGroupDto[] = [
  {
    name: "Металл",
    values: ["Желтое золото", "Белое золото", "Красное золото"],
  },
  {
    name: "Проба",
    values: ["585", "750"],
  },
  {
    name: "Камни",
    values: [
      "Бриллиант",
      "Сапфир",
      "Изумруд",
      "Рубин",
      "Жемчуг",
      "Топаз",
    ],
  },
];

export interface DemoProductItem extends ProductSummaryDto {
  categorySlug: string;
  stoneTypeIds: number[];
  stoneNames: string[];
  metal: string;
  probe: string;
  specs: { label: string; value: string }[];
}

export const DEMO_PRODUCTS: DemoProductItem[] = [
  {
    id: 1,
    sku: "MG-R-001",
    name: "Кольцо «Сияние Востока» с бриллиантом",
    slug: "koltso-siyanie-vostoka-s-brilliantom",
    categoryName: "Кольца",
    categorySlug: "koltsa",
    mainImageUrl:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80",
    isVisible: true,
    stoneTypeIds: [1],
    stoneNames: ["Бриллиант"],
    metal: "Желтое золото",
    probe: "585",
    specs: [
      { label: "Металл", value: "Желтое золото 585°" },
      { label: "Вставка", value: "Бриллиант 0.50 ct" },
    ],
  },
  {
    id: 2,
    sku: "MG-E-002",
    name: "Серьги «Бухарская роза» с изумрудами",
    slug: "sergi-buharskaya-roza-s-izumrudami",
    categoryName: "Серьги",
    categorySlug: "sergi",
    mainImageUrl:
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=80",
    isVisible: true,
    stoneTypeIds: [3],
    stoneNames: ["Изумруд"],
    metal: "Белое золото",
    probe: "750",
    specs: [
      { label: "Металл", value: "Белое золото 750°" },
      { label: "Вставка", value: "Изумруды 1.20 ct" },
    ],
  },
  {
    id: 3,
    sku: "MG-B-003",
    name: "Браслет «Царица Самарканда»",
    slug: "braslet-tsaritsa-samarkanda",
    categoryName: "Браслеты",
    categorySlug: "braslety",
    mainImageUrl:
      "https://images.unsplash.com/photo-1611591475155-42646b5a371c?auto=format&fit=crop&w=1000&q=80",
    isVisible: true,
    stoneTypeIds: [2],
    stoneNames: ["Сапфир"],
    metal: "Красное золото",
    probe: "585",
    specs: [
      { label: "Металл", value: "Красное золото 585°" },
      { label: "Вставка", value: "Сапфиры 2.40 ct" },
    ],
  },
  {
    id: 4,
    sku: "MG-P-004",
    name: "Подвеска «Звезда Улугбека» с рубином",
    slug: "podveska-zvezda-ulugbeka-s-rubinom",
    categoryName: "Колье и подвески",
    categorySlug: "kolye-i-podveski",
    mainImageUrl:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80",
    isVisible: true,
    stoneTypeIds: [4],
    stoneNames: ["Рубин"],
    metal: "Желтое золото",
    probe: "585",
    specs: [
      { label: "Металл", value: "Желтое золото 585°" },
      { label: "Вставка", value: "Природный рубин 0.85 ct" },
    ],
  },
  {
    id: 5,
    sku: "MG-R-005",
    name: "Кольцо «Амир» с черным ониксом",
    slug: "koltso-amir-s-chernym-oniksom",
    categoryName: "Кольца",
    categorySlug: "koltsa",
    mainImageUrl:
      "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=1000&q=80",
    isVisible: true,
    stoneTypeIds: [1],
    stoneNames: ["Бриллиант"],
    metal: "Белое золото",
    probe: "750",
    specs: [
      { label: "Металл", value: "Белое золото 750°" },
      { label: "Вставка", value: "Оникс и бриллианты" },
    ],
  },
  {
    id: 6,
    sku: "MG-E-006",
    name: "Серьги «Жемчужная симфония»",
    slug: "sergi-zhemchuzhnaya-simfoniya",
    categoryName: "Серьги",
    categorySlug: "sergi",
    mainImageUrl:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80",
    isVisible: true,
    stoneTypeIds: [5, 6],
    stoneNames: ["Жемчуг", "Топаз"],
    metal: "Желтое золото",
    probe: "585",
    specs: [
      { label: "Металл", value: "Желтое золото 585°" },
      { label: "Вставка", value: "Морской жемчуг, топазы" },
    ],
  },
  {
    id: 7,
    sku: "MG-BR-007",
    name: "Брошь «Павлин Самарканда»",
    slug: "brosh-pavlin-samarkanda",
    categoryName: "Броши",
    categorySlug: "broshi",
    mainImageUrl:
      "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?auto=format&fit=crop&w=1000&q=80",
    isVisible: true,
    stoneTypeIds: [2, 3],
    stoneNames: ["Сапфир", "Изумруд"],
    metal: "Желтое золото",
    probe: "585",
    specs: [
      { label: "Металл", value: "Желтое золото 585°" },
      { label: "Вставка", value: "Изумруды и сапфиры" },
    ],
  },
  {
    id: 8,
    sku: "MG-P-008",
    name: "Колье «Тайна Востока» с сапфирами",
    slug: "kolye-tayna-vostoka-s-sapfirami",
    categoryName: "Колье и подвески",
    categorySlug: "kolye-i-podveski",
    mainImageUrl:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80",
    isVisible: true,
    stoneTypeIds: [1, 2],
    stoneNames: ["Бриллиант", "Сапфир"],
    metal: "Белое золото",
    probe: "750",
    specs: [
      { label: "Металл", value: "Белое золото 750°" },
      { label: "Вставка", value: "Сапфиры 3.1 ct, бриллианты" },
    ],
  },
  {
    id: 9,
    sku: "MG-R-009",
    name: "Кольцо «Шахерезада» с топазом",
    slug: "koltso-shaherezada-s-topazom",
    categoryName: "Кольца",
    categorySlug: "koltsa",
    mainImageUrl:
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80",
    isVisible: true,
    stoneTypeIds: [6],
    stoneNames: ["Топаз"],
    metal: "Желтое золото",
    probe: "585",
    specs: [
      { label: "Металл", value: "Желтое золото 585°" },
      { label: "Вставка", value: "Голубой топаз 1.8 ct" },
    ],
  },
  {
    id: 10,
    sku: "MG-B-010",
    name: "Браслет «Золотой Шелковый Путь»",
    slug: "braslet-zolotoy-shelkovyy-put",
    categoryName: "Браслеты",
    categorySlug: "braslety",
    mainImageUrl:
      "https://images.unsplash.com/photo-1611591475155-4284ec28d351?auto=format&fit=crop&w=1000&q=80",
    isVisible: true,
    stoneTypeIds: [1],
    stoneNames: ["Бриллиант"],
    metal: "Желтое золото",
    probe: "585",
    specs: [
      { label: "Металл", value: "Желтое золото 585°" },
      { label: "Вставка", value: "Бриллианты 0.35 ct" },
    ],
  },
  {
    id: 11,
    sku: "MG-E-011",
    name: "Серьги «Восточный Ореол»",
    slug: "sergi-vostochnyy-oreol",
    categoryName: "Серьги",
    categorySlug: "sergi",
    mainImageUrl:
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80",
    isVisible: true,
    stoneTypeIds: [4],
    stoneNames: ["Рубин"],
    metal: "Красное золото",
    probe: "585",
    specs: [
      { label: "Металл", value: "Красное золото 585°" },
      { label: "Вставка", value: "Природные рубины 1.1 ct" },
    ],
  },
  {
    id: 12,
    sku: "MG-BR-012",
    name: "Брошь «Финист» с жемчугом",
    slug: "brosh-finist-s-zhemchugom",
    categoryName: "Броши",
    categorySlug: "broshi",
    mainImageUrl:
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80",
    isVisible: true,
    stoneTypeIds: [5],
    stoneNames: ["Жемчуг"],
    metal: "Белое золото",
    probe: "750",
    specs: [
      { label: "Металл", value: "Белое золото 750°" },
      { label: "Вставка", value: "Барочный жемчуг" },
    ],
  },
];

// Helper to filter demo items in fallback mode
function filterDemoProducts(params: ProductFilterParams = {}): PageResponseProductSummaryDto {
  const {
    page = 0,
    size = 12,
    q = "",
    categorySlug = "",
    stoneTypeId,
    metal,
    probe,
  } = params;

  let filtered = DEMO_PRODUCTS.filter((item) => item.isVisible);

  if (categorySlug && categorySlug !== "all") {
    filtered = filtered.filter(
      (item) => item.categorySlug.toLowerCase() === categorySlug.toLowerCase()
    );
  }

  if (stoneTypeId) {
    filtered = filtered.filter((item) =>
      item.stoneTypeIds.includes(Number(stoneTypeId))
    );
  }

  if (metal) {
    filtered = filtered.filter((item) =>
      item.metal.toLowerCase().includes(metal.toLowerCase())
    );
  }

  if (probe) {
    filtered = filtered.filter((item) => item.probe === probe);
  }

  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term) ||
        item.categoryName?.toLowerCase().includes(term) ||
        item.stoneNames.some((s) => s.toLowerCase().includes(term))
    );
  }

  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const validPage = Math.min(Math.max(0, page), totalPages - 1);
  const start = validPage * size;
  const content = filtered.slice(start, start + size).map((item) => ({
    id: item.id,
    sku: item.sku,
    name: item.name,
    slug: item.slug,
    categoryName: item.categoryName,
    mainImageUrl: item.mainImageUrl,
    isVisible: item.isVisible,
    specs: item.specs,
  }));

  return {
    content,
    totalElements,
    totalPages,
    pageNumber: validPage,
  };
}

// ============================================================================
// CLIENT / SERVER API FUNCTIONS WITH SEAMLESS DEMO FALLBACK
// ============================================================================

/**
 * Fetch paginated catalog products with filtering and fuzzy search
 */
export async function getProducts(
  params: ProductFilterParams = {}
): Promise<PageResponseProductSummaryDto> {
  const baseUrl = getApiBaseUrl();
  const query = new URLSearchParams();

  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  if (params.q?.trim()) query.set("q", params.q.trim());
  if (params.categorySlug && params.categorySlug !== "all") {
    query.set("categorySlug", params.categorySlug);
  }
  if (params.stoneTypeId) query.set("stoneTypeId", String(params.stoneTypeId));

  const url = `${baseUrl}/products${query.toString() ? `?${query.toString()}` : ""}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 30 },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data: PageResponseProductSummaryDto = await res.json();
      return data;
    }

    console.warn(`[API] getProducts returned status ${res.status}. Using demo fallback.`);
  } catch (err) {
    console.info("[API] Backend unavailable for getProducts, falling back to seed mock data.");
  }

  return filterDemoProducts(params);
}

/**
 * List visible catalog categories
 */
export async function getCategories(): Promise<CategoryDto[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/categories`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data: CategoryDto[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.info("[API] Backend unavailable for getCategories, using demo categories.");
  }

  return DEMO_CATEGORIES;
}

/**
 * List active filterable characteristics and their available values
 */
export async function getFilterKeys(): Promise<FilterGroupDto[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/characteristics/filter-keys`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data: FilterGroupDto[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.info("[API] Backend unavailable for getFilterKeys, using demo filter groups.");
  }

  return DEMO_FILTER_KEYS;
}

/**
 * Silent batch validation of products in client selection
 */
export async function validateBatch(
  productIds: number[]
): Promise<ProductAvailabilityDto[]> {
  if (!productIds || productIds.length === 0) {
    return [];
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/products/validate-batch`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ productIds }),
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data: ProductAvailabilityDto[] = await res.json();
      return data;
    }
  } catch (err) {
    console.info("[API] validateBatch offline, assuming items are available.");
  }

  return productIds.map((id) => {
    const matched = DEMO_PRODUCTS.find((p) => p.id === id);
    return {
      productId: id,
      isAvailable: matched ? matched.isVisible : true,
      name: matched?.name,
      mainImageUrl: matched?.mainImageUrl,
    };
  });
}

/**
 * Submit custom jewelry inquiry from selection
 */
export async function submitInquiry(
  data: InquiryCreateRequestDto
): Promise<InquiryResponseDto> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/inquiries`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    if (res.status === 429) {
      throw new Error(
        "Слишком много запросов. Пожалуйста, подождите немного перед повторной отправкой."
      );
    }

    if (res.ok) {
      const responseData: InquiryResponseDto = await res.json();
      return responseData;
    }

    if (res.status !== 404 && res.status < 500) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Ошибка сервера (${res.status})`);
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("Слишком много запросов")) {
      throw err;
    }
    console.info("[API] submitInquiry offline fallback: inquiry accepted in mock mode.");
  }

  return {
    id: Math.floor(Math.random() * 9000) + 1000,
    status: "NEW",
    message: "Заявка успешно принята мастером Marziya Gold",
  };
}
