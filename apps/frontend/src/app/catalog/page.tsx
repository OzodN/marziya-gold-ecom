import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";
import { ProductCardSkeleton } from "@/components/catalog/ProductCardSkeleton";

export const metadata: Metadata = {
  title: "Каталог ювелирных изделий | Marziya Gold",
  description:
    "Авторские ювелирные изделия ручной работы мастерской Marziya Gold. Золото 585° и 750°, натуральные бриллианты, сапфиры, изумруды и рубины.",
};

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

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogLoadingFallback />}>
      <CatalogView />
    </Suspense>
  );
}
