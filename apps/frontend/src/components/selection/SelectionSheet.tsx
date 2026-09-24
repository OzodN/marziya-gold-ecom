"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, Plus, Minus, Trash2, Sparkles, Send, Gem } from "lucide-react";
import { useSelectionStore, useIsSelectionHydrated } from "@/store/selection-store";
import type { ProductAvailabilityDto } from "@/types/api";

export const SelectionSheet: React.FC = () => {
  const {
    isOpen,
    closeSelection,
    items,
    updateQuantity,
    removeFromSelection,
    clearSelection,
    openInquiryModal,
    markBatchAvailability,
  } = useSelectionStore();

  const isHydrated = useIsSelectionHydrated();

  // Тихая валидация доступности изделий при открытии шторки
  useEffect(() => {
    if (!isOpen || items.length === 0) return;

    const productIds = items.map((i) => i.product.id);
    let isCancelled = false;

    async function validateBatch() {
      try {
        const res = await fetch("/api/v1/products/validate-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds }),
        });

        if (res.ok && !isCancelled) {
          const data: ProductAvailabilityDto[] = await res.json();
          markBatchAvailability(data);
        }
      } catch {
        // Silent validation failure is ignored to not block user interaction
      }
    }

    validateBatch();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, items.length, markBatchAvailability]);

  if (!isOpen) {
    return null;
  }

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-noir-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="relative w-screen max-w-md border-l border-gold-500/20 bg-noir-900 text-noir-100 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-noir-800 px-6 py-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold-400" />
              <h2 className="font-serif text-lg font-semibold tracking-wide text-gold-200 uppercase">
                Моя подборка
              </h2>
              {isHydrated && totalCount > 0 && (
                <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-xs font-semibold text-gold-300">
                  {totalCount} шт.
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={closeSelection}
              className="rounded-full p-2 text-noir-400 hover:bg-noir-800 hover:text-white transition-colors"
              aria-label="Закрыть подборку"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex h-[calc(100%-140px)] flex-col overflow-y-auto px-6 py-4">
            {!isHydrated || items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-500/20 bg-gold-950/20 text-gold-400">
                  <Gem className="h-8 w-8 text-gold-400/60" />
                </div>
                <div className="space-y-1">
                  <p className="font-serif text-lg font-medium text-gold-200">
                    Ваша подборка пуста
                  </p>
                  <p className="text-xs text-noir-400 max-w-xs leading-relaxed">
                    Добавьте понравившиеся авторские изделия из каталога, нажав кнопку «В подборку».
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeSelection}
                  className="rounded-xl border border-gold-400/30 px-5 py-2.5 text-xs font-medium text-gold-300 hover:bg-gold-500/10 transition-colors"
                >
                  Перейти к изделиям
                </button>
              </div>
            ) : (
              <div className="divide-y divide-noir-800 space-y-4">
                {items.map(({ product, quantity, isAvailable }) => (
                  <div
                    key={product.id}
                    className={`pt-4 first:pt-0 flex gap-4 transition-opacity ${
                      isAvailable === false ? "opacity-50 grayscale" : ""
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-noir-700 bg-noir-800">
                      {product.mainImageUrl ? (
                        <Image
                          src={product.mainImageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gold-500/40">
                          <Gem className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    {/* Info & Quantity */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif text-sm font-medium text-white line-clamp-1">
                            {product.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeFromSelection(product.id)}
                            className="text-noir-400 hover:text-red-400 transition-colors p-1"
                            title="Удалить из подборки"
                            aria-label={`Удалить ${product.name} из подборки`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] font-mono text-gold-400/80 mt-0.5">
                          {product.sku}
                        </p>
                        {product.categoryName && (
                          <p className="text-[11px] text-noir-400">
                            {product.categoryName}
                          </p>
                        )}
                        {isAvailable === false && (
                          <p className="text-[10px] text-amber-400 mt-1">
                            Временно недоступно для запроса
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center rounded-lg border border-noir-700 bg-noir-800">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1 text-noir-400 hover:text-white transition-colors"
                            aria-label="Уменьшить количество"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-gold-200">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="p-1 text-noir-400 hover:text-white transition-colors"
                            aria-label="Увеличить количество"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {items.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 border-t border-noir-800 bg-noir-950 p-6 space-y-3">
              <button
                type="button"
                onClick={openInquiryModal}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 py-3 text-sm font-semibold text-noir-950 hover:from-gold-400 hover:to-gold-300 transition-all shadow-gold"
              >
                <Send className="h-4 w-4" />
                <span>Отправить запрос</span>
              </button>

              <button
                type="button"
                onClick={clearSelection}
                className="w-full text-center text-xs text-noir-400 hover:text-red-400 transition-colors py-1"
              >
                Очистить подборку
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
