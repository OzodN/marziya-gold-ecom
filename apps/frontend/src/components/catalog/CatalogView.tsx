"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Gem, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { CatalogFilters, type FilterValues } from "@/components/catalog/CatalogFilters";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { Pagination } from "@/components/catalog/Pagination";
import { ProductCardSkeleton } from "@/components/catalog/ProductCardSkeleton";
import {
  getProducts,
  getCategories,
  DEMO_STONE_TYPES,
  DEMO_CATEGORIES,
} from "@/lib/api";
import type {
  CategoryDto,
  StoneTypeDto,
  PageResponseProductSummaryDto,
  ProductSummaryDto,
} from "@/types/api";

interface CatalogViewProps {
  initialCategorySlug?: string;
}

const PAGE_SIZE = 9;

export const CatalogView: React.FC<CatalogViewProps> = ({
  initialCategorySlug,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Categories & Stone types
  const [categories, setCategories] = useState<CategoryDto[]>(DEMO_CATEGORIES);
  const [stoneTypes] = useState<StoneTypeDto[]>(DEMO_STONE_TYPES);

  // Search and Filter states initialized from URL params or props
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("q") || ""
  );

  const initialCat =
    initialCategorySlug || searchParams.get("category") || "all";

  const [filters, setFilters] = useState<FilterValues>({
    categorySlug: initialCat,
    stoneTypeId: searchParams.get("stone")
      ? Number(searchParams.get("stone"))
      : undefined,
    metal: searchParams.get("metal") || undefined,
    probe: searchParams.get("probe") || undefined,
  });

  const [pageNumber, setPageNumber] = useState<number>(
    searchParams.get("page") ? Math.max(0, Number(searchParams.get("page")) - 1) : 0
  );

  // Loading & Data states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [data, setData] = useState<PageResponseProductSummaryDto | null>(null);

  // Load categories list
  useEffect(() => {
    let isCancelled = false;
    async function loadMeta() {
      try {
        const catList = await getCategories();
        if (!isCancelled && catList.length > 0) {
          setCategories(catList);
        }
      } catch {
        // Fallback to DEMO_CATEGORIES
      }
    }
    loadMeta();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Synchronize category if initialCategorySlug prop changes
  useEffect(() => {
    if (initialCategorySlug) {
      setFilters((prev) => ({ ...prev, categorySlug: initialCategorySlug }));
    }
  }, [initialCategorySlug]);

  // Fetch products whenever filters, search, or page changes
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await getProducts({
        page: pageNumber,
        size: PAGE_SIZE,
        q: searchQuery,
        categorySlug:
          filters.categorySlug && filters.categorySlug !== "all"
            ? filters.categorySlug
            : undefined,
        stoneTypeId: filters.stoneTypeId,
        metal: filters.metal,
        probe: filters.probe,
      });
      setData(response);
    } catch (err) {
      console.error("Failed to load products", err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, searchQuery, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL query parameters cleanly
  const updateUrl = useCallback(
    (newSearch: string, newFilters: FilterValues, newPage: number) => {
      const params = new URLSearchParams();
      if (newSearch) params.set("q", newSearch);
      if (newFilters.categorySlug && newFilters.categorySlug !== "all") {
        params.set("category", newFilters.categorySlug);
      }
      if (newFilters.stoneTypeId) {
        params.set("stone", String(newFilters.stoneTypeId));
      }
      if (newFilters.metal) params.set("metal", newFilters.metal);
      if (newFilters.probe) params.set("probe", newFilters.probe);
      if (newPage > 0) params.set("page", String(newPage + 1));

      const queryString = params.toString();
      const currentPath = initialCategorySlug
        ? `/catalog/${initialCategorySlug}`
        : "/catalog";
      const targetUrl = queryString ? `${currentPath}?${queryString}` : currentPath;

      startTransition(() => {
        router.replace(targetUrl, { scroll: false });
      });
    },
    [router, initialCategorySlug]
  );

  // Handlers
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPageNumber(0);
    updateUrl(val, filters, 0);
  };

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPageNumber(0);
    updateUrl(searchQuery, newFilters, 0);
  };

  const handleResetFilters = () => {
    const resetValues: FilterValues = {
      categorySlug: initialCategorySlug || "all",
      stoneTypeId: undefined,
      metal: undefined,
      probe: undefined,
    };
    setFilters(resetValues);
    setSearchQuery("");
    setPageNumber(0);
    updateUrl("", resetValues, 0);
  };

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
    updateUrl(searchQuery, filters, newPage);
    // Scroll smoothly to top of products list
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 220, behavior: "smooth" });
    }
  };

  // Find active category title for display
  const currentCategory = categories.find(
    (c) => c.slug === filters.categorySlug
  );
  const pageTitle = currentCategory
    ? currentCategory.name
    : "Каталог ювелирных изделий";

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* ================================================================= */}
      {/* HERO / HEADER SECTION                                             */}
      {/* ================================================================= */}
      <section className="mb-10 space-y-6">
        {/* Breadcrumb / Back link */}
        <div className="flex items-center gap-2 text-xs text-noir-400">
          <Link
            href="/"
            className="hover:text-gold-300 transition-colors flex items-center gap-1"
          >
            <span>Главная</span>
          </Link>
          <span>/</span>
          {initialCategorySlug ? (
            <>
              <Link
                href="/catalog"
                className="hover:text-gold-300 transition-colors"
              >
                Каталог
              </Link>
              <span>/</span>
              <span className="text-gold-300 font-medium">{pageTitle}</span>
            </>
          ) : (
            <span className="text-gold-300 font-medium">Каталог</span>
          )}
        </div>

        {/* Hero Title & Description */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-950/40 px-3.5 py-1 text-xs font-semibold tracking-wider text-gold-300 uppercase backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-gold-400" />
              <span>Авторская коллекция</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              {pageTitle}
            </h1>

            <p className="text-sm text-noir-300 leading-relaxed max-w-xl">
              Уникальные украшения ручной работы из благородных металлов 585° и
              750° пробы с чистейшими драгоценными камнями. Соберите понравившиеся
              изделия в вашу подборку для обсуждения с ювелирным мастером.
            </p>
          </div>

          {/* Quick return if filtered by slug */}
          {initialCategorySlug && (
            <div>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 rounded-xl border border-noir-700 bg-noir-900/80 px-4 py-2.5 text-xs font-medium text-noir-300 hover:border-gold-500/50 hover:text-gold-200 transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Все категории каталога</span>
              </Link>
            </div>
          )}
        </div>

        {/* Search Bar & Mobile Trigger Row */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <div className="flex-1">
            <CatalogSearch
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Поиск по названию, артикулу (SKU), камням..."
            />
          </div>

          <div className="lg:hidden">
            <CatalogFilters
              categories={categories}
              stoneTypes={stoneTypes}
              values={filters}
              onChange={handleFiltersChange}
              onReset={handleResetFilters}
            />
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* MAIN CONTENT: DESKTOP FILTERS SIDEBAR + PRODUCT GRID              */}
      {/* ================================================================= */}
      <div className="flex items-start gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block">
          <CatalogFilters
            categories={categories}
            stoneTypes={stoneTypes}
            values={filters}
            onChange={handleFiltersChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Product Grid & Pagination Area */}
        <main className="flex-1 min-w-0">
          {/* Status Header */}
          <div className="mb-6 flex items-center justify-between border-b border-noir-800 pb-3">
            <div className="text-xs text-noir-400">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-3 w-3 animate-spin text-gold-400" />
                  <span>Обновление каталога...</span>
                </span>
              ) : (
                <span>
                  Найдено:{" "}
                  <strong className="text-gold-300 font-semibold">
                    {data?.totalElements ?? 0}
                  </strong>{" "}
                  изделий
                </span>
              )}
            </div>

            {/* Active search pill */}
            {searchQuery && (
              <span className="rounded-full bg-noir-800 px-3 py-1 text-[11px] text-noir-300">
                Поиск: «{searchQuery}»
              </span>
            )}
          </div>

          {/* Grid, Loading, Error, or Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <ProductCardSkeleton key={`skeleton-${idx}`} />
              ))}
            </div>
          ) : hasError ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-noir-900/40 px-6 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-noir-800 text-red-400 mb-4">
                <AlertCircle className="h-8 w-8 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-xl font-medium text-white mb-2">
                Не удалось загрузить каталог изделий
              </h3>
              <p className="text-xs text-noir-400 max-w-md leading-relaxed mb-6">
                Произошла ошибка при соединении с сервером. Пожалуйста, проверьте подключение к сети и повторите попытку.
              </p>
              <button
                type="button"
                onClick={() => fetchProducts()}
                className="flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-3 min-h-[44px] text-xs font-semibold uppercase tracking-wider text-noir-950 hover:bg-gold-400 transition-colors shadow-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Повторить попытку</span>
              </button>
            </div>
          ) : !data || data.content.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-noir-800 bg-noir-900/40 px-6 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-500/20 bg-noir-800 text-gold-400 mb-4">
                <Gem className="h-8 w-8 stroke-[1.2] text-gold-400/70" />
              </div>
              <h3 className="font-serif text-xl font-medium text-white mb-2">
                Изделия не найдены
              </h3>
              <p className="text-xs text-noir-400 max-w-md leading-relaxed mb-6">
                По выбранным параметрам фильтрации или поисковому запросу ничего
                не найдено. Попробуйте изменить фильтры или сбросить критерии
                поиска.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-xl border border-gold-400/40 bg-noir-800/80 px-5 py-2.5 min-h-[44px] text-xs font-semibold uppercase tracking-wider text-gold-200 hover:border-gold-300 hover:bg-gold-500/10 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                Сбросить все фильтры
              </button>
            </div>
          ) : (
            /* Products Grid */
            <div className="space-y-10">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {data.content.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    specs={(product as ProductSummaryDto & { specs?: { label: string; value: string }[] }).specs}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="pt-4 border-t border-noir-800">
                <Pagination
                  pageNumber={data.pageNumber}
                  totalPages={data.totalPages}
                  totalElements={data.totalElements}
                  pageSize={PAGE_SIZE}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
