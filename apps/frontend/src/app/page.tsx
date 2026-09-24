"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Award, HeartHandshake } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { useSelectionStore } from "@/store/selection-store";
import type { ProductSummaryDto } from "@/types/api";

const INITIAL_SHOWCASE_PRODUCTS: (ProductSummaryDto & {
  specs: { label: string; value: string }[];
})[] = [
  {
    id: 1,
    sku: "MRZ-RNG-001",
    name: "Кольцо «Созвездие Граната»",
    slug: "koltso-sozvezdie-granata",
    categoryName: "Кольца",
    mainImageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    isVisible: true,
    specs: [
      { label: "Металл", value: "Золото 585°" },
      { label: "Вставка", value: "Природный гранат" },
    ],
  },
  {
    id: 2,
    sku: "MRZ-EAR-002",
    name: "Серьги «Капли Росы»",
    slug: "sergi-kapli-rosy",
    categoryName: "Серьги",
    mainImageUrl: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
    isVisible: true,
    specs: [
      { label: "Металл", value: "Белое золото 750°" },
      { label: "Вставка", value: "Бриллианты 0.45 ct" },
    ],
  },
  {
    id: 3,
    sku: "MRZ-NCK-003",
    name: "Колье «Восточный Рассвет»",
    slug: "kole-vostochnyy-rassvet",
    categoryName: "Колье",
    mainImageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    isVisible: true,
    specs: [
      { label: "Металл", value: "Золото 585°" },
      { label: "Вставка", value: "Сапфиры" },
    ],
  },
  {
    id: 4,
    sku: "MRZ-BRC-004",
    name: "Браслет «Царское Плетение»",
    slug: "braslet-tsarskoe-pletenie",
    categoryName: "Браслеты",
    mainImageUrl: "https://images.unsplash.com/photo-1611591475155-4284ec28d351?auto=format&fit=crop&w=800&q=80",
    isVisible: true,
    specs: [
      { label: "Металл", value: "Золото 585°" },
      { label: "Вес", value: "18.4 г" },
    ],
  },
  {
    id: 5,
    sku: "MRZ-RNG-005",
    name: "Перстень «Изумрудный Оазис»",
    slug: "persten-izumrudnyy-oazis",
    categoryName: "Кольца",
    mainImageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80",
    isVisible: true,
    specs: [
      { label: "Металл", value: "Желтое золото 750°" },
      { label: "Вставка", value: "Колумбийский изумруд" },
    ],
  },
  {
    id: 6,
    sku: "MRZ-EAR-006",
    name: "Серьги «Сияние Вечности»",
    slug: "sergi-siyanie-vechnosti",
    categoryName: "Серьги",
    mainImageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    isVisible: true,
    specs: [
      { label: "Металл", value: "Комбинированное золото" },
      { label: "Вставка", value: "Бриллиант и сапфир" },
    ],
  },
];

const CATEGORIES = ["Все изделия", "Кольца", "Серьги", "Колье", "Браслеты"];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("Все изделия");
  const openSelection = useSelectionStore((s) => s.openSelection);

  const filteredProducts =
    selectedCategory === "Все изделия"
      ? INITIAL_SHOWCASE_PRODUCTS
      : INITIAL_SHOWCASE_PRODUCTS.filter(
          (p) => p.categoryName === selectedCategory
        );

  return (
    <div className="flex flex-col space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gold-500/20 bg-gradient-to-b from-noir-900 via-noir-950 to-noir-950 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(184,142,62,0.18),rgba(255,255,255,0))]" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-950/40 px-4 py-1.5 text-xs font-semibold tracking-wider text-gold-300 uppercase backdrop-blur-md mb-8">
            <Sparkles className="h-3.5 w-3.5 text-gold-400" />
            <span>Эксклюзивная мастерская Marziya Gold</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            Авторские ювелирные изделия{" "}
            <span className="text-gold-gradient block mt-2">
              ручной работы
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-noir-300 leading-relaxed max-w-2xl mx-auto">
            Каждое изделие создается мастером в единственном экземпляре или лимитированной серией. Выберите понравившиеся украшения в вашу персональную подборку для обсуждения индивидуального заказа.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#catalog"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-7 py-3.5 text-sm font-semibold text-noir-950 hover:from-gold-400 hover:to-gold-300 transition-all shadow-gold"
            >
              <span>Смотреть каталог</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={openSelection}
              className="inline-flex items-center gap-2 rounded-xl border border-gold-400/40 bg-noir-900/80 px-7 py-3.5 text-sm font-semibold text-gold-200 hover:border-gold-300 hover:bg-gold-500/10 transition-all"
            >
              <Sparkles className="h-4 w-4 text-gold-400" />
              <span>Моя подборка</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 border-t border-noir-800/80 pt-10 text-left">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold-500/20 bg-noir-900 text-gold-400 shrink-0">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold text-gold-200">
                  Благородные металлы
                </h4>
                <p className="text-xs text-noir-400">
                  Строгий контроль пробы золота 585° и 750°
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold-500/20 bg-noir-900 text-gold-400 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold text-gold-200">
                  Драгоценные камни
                </h4>
                <p className="text-xs text-noir-400">
                  Натуральные камни с проверенным происхождением
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold-500/20 bg-noir-900 text-gold-400 shrink-0">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold text-gold-200">
                  Прямой диалог с мастером
                </h4>
                <p className="text-xs text-noir-400">
                  Индивидуальный подбор размера и гравировки
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Showcase Section */}
      <section id="catalog" className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row mb-10">
          <div>
            <span className="text-xs font-semibold tracking-wider text-gold-400 uppercase">
              Галерея украшений
            </span>
            <h2 className="font-serif text-3xl font-bold text-white mt-1">
              Каталог изделий
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                  selectedCategory === category
                    ? "bg-gold-500 text-noir-950 shadow-gold"
                    : "border border-noir-700 bg-noir-900 text-noir-300 hover:border-gold-500/40 hover:text-gold-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              specs={product.specs}
            />
          ))}
        </div>
      </section>

      {/* Bespoke Atelier Philosophy Section */}
      <section id="about" className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gold-500/30 bg-gradient-to-br from-noir-900 to-noir-950 p-8 sm:p-14 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="text-xs font-semibold tracking-wider text-gold-400 uppercase">
              Философия мастерской
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Почему в Marziya Gold нет шаблонных покупок?
            </h2>
            <p className="text-sm leading-relaxed text-noir-300">
              Ювелирные изделия высшей категории требуют индивидуальной подгонки.
              Размер кольца, оттенок золота, чистота минерала и характер гравировки —
              каждая деталь согласовывается непосредственно с автором.
            </p>
            <p className="text-sm leading-relaxed text-noir-300">
              Формируя подборку и нажимая <strong>«Отправить запрос»</strong>, вы
              передаете мастеру свои пожелания без предоплат. Мы свяжемся с вами
              для персональной консультации и демонстрации образцов.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={openSelection}
                className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-semibold text-noir-950 hover:bg-gold-400 transition-colors shadow-gold"
              >
                <Sparkles className="h-4 w-4" />
                <span>Открыть «Мою подборку»</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
