"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Minus, Check, Sparkles, Gem } from "lucide-react";
import { useSelectionStore, useIsSelectionHydrated } from "@/store/selection-store";
import type { ProductDetailDto, ProductSummaryDto } from "@/types/api";

interface StickyActionBarProps {
  product: ProductDetailDto;
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({ product }) => {
  const { addToSelection, hasItem } = useSelectionStore();
  const isHydrated = useIsSelectionHydrated();
  const [isVisible, setIsVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const isInSelection = isHydrated && hasItem(product.id);
  const mainImage = product.images?.[0]?.url;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const scrolledPastTop = scrollY > 240;

      const mainBtn = document.getElementById("main-add-to-selection-button");
      if (!mainBtn) {
        setIsVisible(scrolledPastTop);
        return;
      }

      const rect = mainBtn.getBoundingClientRect();
      const isMainButtonVisible = rect.top < window.innerHeight && rect.bottom > 0;
      setIsVisible(scrolledPastTop && !isMainButtonVisible);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleDecrement = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleIncrement = () => {
    setQuantity((q) => Math.min(99, q + 1));
  };

  const handleAddToSelection = () => {
    const summary: ProductSummaryDto = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      categoryName: product.category?.name || product.categoryName,
      mainImageUrl: mainImage || "",
      isVisible: product.isVisible ?? true,
    };

    addToSelection(summary, quantity);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t border-gold-500/25 bg-noir-950/95 backdrop-blur-lg px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-2xl transition-all duration-300 ease-in-out ${
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
      role="region"
      aria-label="Быстрое добавление в подборку"
      aria-hidden={!isVisible}
    >
      <div className="flex items-center justify-between gap-2.5">
        {/* Left: Product Thumbnail & Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-noir-700 bg-noir-900">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="44px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gold-400/40">
                <Gem className="h-5 w-5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-serif text-xs font-medium text-white truncate">
              {product.name}
            </h4>
            <span className="font-mono text-[10px] text-gold-400 uppercase tracking-wider block truncate">
              {product.sku}
            </span>
          </div>
        </div>

        {/* Middle: Compact Quantity Counter [ - ] N [ + ] */}
        <div className="flex items-center rounded-lg border border-noir-700 bg-noir-900 p-0.5 shrink-0">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={quantity <= 1}
            className="flex h-11 w-11 items-center justify-center rounded text-noir-300 transition-colors hover:text-white disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            aria-label="Уменьшить количество в нижней панели"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <span
            className="w-5 text-center font-mono text-xs font-medium text-white select-none"
            aria-label={`Количество: ${quantity}`}
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={quantity >= 99}
            className="flex h-11 w-11 items-center justify-center rounded text-noir-300 transition-colors hover:text-white disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            aria-label="Увеличить количество в нижней панели"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Right: CTA Button "В подборку" */}
        <button
          type="button"
          onClick={handleAddToSelection}
          className={`flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
            justAdded
              ? "border border-gold-400 bg-gold-400 text-noir-950 font-bold"
              : isInSelection
              ? "border border-gold-400/50 bg-gold-500/20 text-gold-200"
              : "border border-gold-500 bg-gradient-to-r from-gold-500 to-gold-600 text-noir-950 font-bold"
          }`}
          aria-label={
            justAdded
              ? "Добавлено в подборку"
              : isInSelection
              ? "Добавить еще в подборку"
              : "Добавить в подборку"
          }
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4 stroke-[2.5]" />
              <span>Добавлено</span>
            </>
          ) : isInSelection ? (
            <>
              <Sparkles className="h-3.5 w-3.5 text-gold-400" />
              <span>Еще ({quantity})</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>В подборку</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
