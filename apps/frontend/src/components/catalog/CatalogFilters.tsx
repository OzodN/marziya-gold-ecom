"use client";

import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Gem,
  Check,
  Layers,
  Sparkles,
} from "lucide-react";
import type { CategoryDto, StoneTypeDto, FilterGroupDto } from "@/types/api";

export interface FilterValues {
  categorySlug: string;
  stoneTypeId?: number;
  metal?: string;
  probe?: string;
}

interface CatalogFiltersProps {
  categories: CategoryDto[];
  stoneTypes: StoneTypeDto[];
  filterKeys?: FilterGroupDto[];
  values: FilterValues;
  onChange: (newValues: FilterValues) => void;
  onReset: () => void;
  className?: string;
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  categories,
  stoneTypes,
  values,
  onChange,
  onReset,
  className = "",
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Calculate active filter count (excluding "all" category)
  const activeCount =
    (values.categorySlug && values.categorySlug !== "all" ? 1 : 0) +
    (values.stoneTypeId ? 1 : 0) +
    (values.metal ? 1 : 0) +
    (values.probe ? 1 : 0);

  // Close mobile drawer on Escape key
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const handleCategorySelect = (slug: string) => {
    onChange({
      ...values,
      categorySlug: slug,
    });
  };

  const handleStoneTypeSelect = (id?: number) => {
    onChange({
      ...values,
      stoneTypeId: values.stoneTypeId === id ? undefined : id,
    });
  };

  const handleMetalSelect = (metal?: string) => {
    onChange({
      ...values,
      metal: values.metal === metal ? undefined : metal,
    });
  };

  const handleProbeSelect = (probe?: string) => {
    onChange({
      ...values,
      probe: values.probe === probe ? undefined : probe,
    });
  };

  // Metals & Probes definitions
  const METALS = ["Желтое золото", "Белое золото", "Красное золото"];
  const PROBES = ["585", "750"];

  // Shared Filter Sections Component
  const renderFilterSections = (isMobileSheet = false) => (
    <div className="space-y-7">
      {/* 1. Categories (Chips) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-400">
          <Layers className="h-3.5 w-3.5" />
          <span>Категории изделий</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleCategorySelect("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
              !values.categorySlug || values.categorySlug === "all"
                ? "bg-gold-500 font-semibold text-noir-950 shadow-gold"
                : "border border-noir-700/80 bg-noir-900/60 text-noir-300 hover:border-gold-500/40 hover:text-gold-200"
            }`}
          >
            Все категории
          </button>
          {categories.map((cat) => {
            const isSelected = values.categorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.slug)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-gold-500 font-semibold text-noir-950 shadow-gold"
                    : "border border-noir-700/80 bg-noir-900/60 text-noir-300 hover:border-gold-500/40 hover:text-gold-200"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Stones / Gems */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-400">
          <Gem className="h-3.5 w-3.5" />
          <span>Драгоценные вставки</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {stoneTypes.map((stone) => {
            const isSelected = values.stoneTypeId === stone.id;
            return (
              <button
                key={stone.id}
                type="button"
                onClick={() => handleStoneTypeSelect(stone.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "border border-gold-400/80 bg-gold-500/25 text-gold-200 font-semibold shadow-sm"
                    : "border border-noir-700/80 bg-noir-900/60 text-noir-300 hover:border-gold-500/40 hover:text-gold-200"
                }`}
              >
                {isSelected && <Check className="h-3 w-3 stroke-[2.5]" />}
                <span>{stone.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Noble Metal */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Благородный металл</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {METALS.map((metal) => {
            const isSelected = values.metal === metal;
            return (
              <button
                key={metal}
                type="button"
                onClick={() => handleMetalSelect(metal)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "border border-gold-400/80 bg-gold-500/25 text-gold-200 font-semibold shadow-sm"
                    : "border border-noir-700/80 bg-noir-900/60 text-noir-300 hover:border-gold-500/40 hover:text-gold-200"
                }`}
              >
                {isSelected && <Check className="h-3 w-3 stroke-[2.5]" />}
                <span>{metal}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Probe / Hallmark */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Проба золота</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PROBES.map((probe) => {
            const isSelected = values.probe === probe;
            return (
              <button
                key={probe}
                type="button"
                onClick={() => handleProbeSelect(probe)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "border border-gold-400/80 bg-gold-500/25 text-gold-200 font-semibold shadow-sm"
                    : "border border-noir-700/80 bg-noir-900/60 text-noir-300 hover:border-gold-500/40 hover:text-gold-200"
                }`}
              >
                {isSelected && <Check className="h-3 w-3 stroke-[2.5]" />}
                <span>{probe}°</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Button */}
      {activeCount > 0 && !isMobileSheet && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2 text-xs font-medium text-noir-400 hover:text-gold-300 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Сбросить все фильтры ({activeCount})</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={className}>
      {/* ================================================================= */}
      {/* MOBILE TRIGGER & ACTIVE PILLS SUMMARY (lg:hidden)                 */}
      {/* ================================================================= */}
      <div className="lg:hidden flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-gold-500/30 bg-noir-900/90 px-4 py-2.5 text-xs font-medium text-gold-200 shadow-sm transition-all hover:border-gold-400 hover:text-white"
        >
          <SlidersHorizontal className="h-4 w-4 text-gold-400" />
          <span>Фильтры</span>
          {activeCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-noir-950">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-noir-400 hover:text-gold-300 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Сбросить ({activeCount})</span>
          </button>
        )}
      </div>

      {/* ================================================================= */}
      {/* DESKTOP SIDEBAR (hidden lg:block)                                 */}
      {/* ================================================================= */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-28 rounded-2xl border border-noir-800 bg-noir-900/70 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-noir-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gold-400" />
              <h3 className="font-serif text-base font-semibold tracking-wide text-white uppercase">
                Фильтры
              </h3>
            </div>
            {activeCount > 0 && (
              <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-[11px] font-semibold text-gold-300">
                {activeCount}
              </span>
            )}
          </div>

          {renderFilterSections(false)}
        </div>
      </aside>

      {/* ================================================================= */}
      {/* MOBILE BOTTOM SHEET / DRAWER (MODAL)                              */}
      {/* ================================================================= */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Фильтры каталога"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-noir-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Drawer */}
          <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl border-t border-gold-500/30 bg-noir-900 shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Drawer Pull Handle */}
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-noir-700" />

            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-noir-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-gold-400" />
                <h3 className="font-serif text-lg font-semibold tracking-wide text-gold-200">
                  Фильтры каталога
                </h3>
                {activeCount > 0 && (
                  <span className="rounded-full bg-gold-500 px-2 py-0.5 text-xs font-bold text-noir-950">
                    {activeCount}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="rounded-full p-2 text-noir-400 hover:bg-noir-800 hover:text-white transition-colors"
                aria-label="Закрыть фильтры"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="overflow-y-auto px-6 py-5">
              {renderFilterSections(true)}
            </div>

            {/* Drawer Footer Actions */}
            <div className="border-t border-noir-800 bg-noir-950/90 p-4 px-6 flex items-center gap-3">
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onReset();
                  }}
                  className="rounded-xl border border-noir-700 py-3 px-4 text-xs font-semibold text-noir-300 hover:text-white transition-colors"
                >
                  Сбросить
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="flex-1 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 py-3 text-xs font-semibold uppercase tracking-wider text-noir-950 shadow-gold"
              >
                Применить фильтры
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
