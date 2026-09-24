"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, Plus, Gem, Sparkles } from "lucide-react";
import { useSelectionStore, useIsSelectionHydrated } from "@/store/selection-store";
import type { ProductSummaryDto } from "@/types/api";

interface ProductCardProps {
  product: ProductSummaryDto;
  specs?: { label: string; value: string }[];
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, specs }) => {
  const { addToSelection, hasItem } = useSelectionStore();
  const isHydrated = useIsSelectionHydrated();
  const [justAdded, setJustAdded] = useState(false);

  const isInSelection = isHydrated && hasItem(product.id);

  const handleAddToSelection = () => {
    addToSelection(product, 1);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1500);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-noir-700/80 bg-noir-900/90 transition-all duration-300 hover:border-gold-500/50 hover:shadow-card hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-noir-800">
        {product.mainImageUrl ? (
          <Image
            src={product.mainImageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-noir-800 to-noir-900 text-gold-500/30">
            <Gem className="h-16 w-16 stroke-[1.2]" />
          </div>
        )}

        {/* Subtle Category Pill */}
        {product.categoryName && (
          <div className="absolute left-3 top-3 rounded-full border border-noir-700/60 bg-noir-950/80 px-3 py-1 text-[11px] font-medium tracking-wide text-gold-300 backdrop-blur-md">
            {product.categoryName}
          </div>
        )}

        {/* In-Selection Badge */}
        {isInSelection && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gold-500/90 px-2.5 py-1 text-[11px] font-semibold text-noir-950 shadow-sm backdrop-blur-md">
            <Check className="h-3 w-3 stroke-[2.5]" />
            <span>В подборке</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-1.5">
          <span className="font-mono text-[11px] tracking-wider text-gold-400/80 uppercase">
            {product.sku}
          </span>
          <h3 className="font-serif text-lg font-medium text-white transition-colors group-hover:text-gold-200 line-clamp-1">
            {product.name}
          </h3>

          {/* Specs / Characteristics Preview */}
          {specs && specs.length > 0 && (
            <div className="pt-1 flex flex-wrap gap-2 text-[11px] text-noir-400">
              {specs.slice(0, 2).map((s, idx) => (
                <span
                  key={idx}
                  className="rounded-md border border-noir-700/60 bg-noir-800/60 px-2 py-0.5"
                >
                  {s.label}: <strong className="text-noir-200">{s.value}</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Button: "В подборку" */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleAddToSelection}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              isInSelection || justAdded
                ? "border border-gold-400/50 bg-gold-500/20 text-gold-200 hover:bg-gold-500/30"
                : "border border-gold-500/30 bg-noir-800/80 text-gold-300 hover:border-gold-400 hover:bg-gold-500/10 hover:text-white"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4 text-gold-400 stroke-[2.5]" />
                <span>Добавлено</span>
              </>
            ) : isInSelection ? (
              <>
                <Sparkles className="h-4 w-4 text-gold-400" />
                <span>Добавить еще</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 text-gold-400" />
                <span>В подборку</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
