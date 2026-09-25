import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";
import { ProductCardSkeleton } from "@/components/catalog/ProductCardSkeleton";
import { getCategories, DEMO_CATEGORIES } from "@/lib/api";

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  const list = categories.length > 0 ? categories : DEMO_CATEGORIES;
  return list.map((cat) => ({
    categorySlug: cat.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const categories = await getCategories();
  const category =
    categories.find((c) => c.slug === categorySlug) ||
    DEMO_CATEGORIES.find((c) => c.slug === categorySlug);
  const name = category?.name || "Ювелирные изделия";

  return {
    title: `${name} | Каталог Marziya Gold`,
    description: `Авторские ювелирные изделия категории «${name}» ручной работы мастерской Marziya Gold. Золото 585° и 750°, драгоценные вставки.`,
  };
}

function CatalogLoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      <div className="h-8 w-64 rounded bg-noir-800 mb-4" />
      <div className="h-4 w-96 rounded bg-noir-800/60 mb-8" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default async function CategoryCatalogPage({
  params,
}: CategoryPageProps) {
  const { categorySlug } = await params;

  return (
    <Suspense fallback={<CatalogLoadingFallback />}>
      <CatalogView initialCategorySlug={categorySlug} />
    </Suspense>
  );
}
