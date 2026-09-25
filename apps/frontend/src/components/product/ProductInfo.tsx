"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Sparkles,
  Plus,
  Minus,
  Check,
  Send,
  Phone,
  Gem,
  ShieldCheck,
  Hammer,
} from "lucide-react";
import { useSelectionStore, useIsSelectionHydrated } from "@/store/selection-store";
import { getContactSettings } from "@/lib/api";
import type { ContactSettingsDto, ProductDetailDto, ProductSummaryDto } from "@/types/api";

interface ProductInfoProps {
  product: ProductDetailDto;
  contacts?: ContactSettingsDto;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product, contacts: initialContacts }) => {
  const { addToSelection, hasItem, openSelection } = useSelectionStore();
  const isHydrated = useIsSelectionHydrated();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [contacts, setContacts] = useState<ContactSettingsDto | undefined>(initialContacts);

  useEffect(() => {
    if (initialContacts) {
      setContacts(initialContacts);
    } else {
      getContactSettings().then(setContacts).catch(() => {});
    }
  }, [initialContacts]);

  const telegramHandle = (contacts?.telegramUsername || "marziyagold").replace(/^@/, "");
  const telegramUrl = `https://t.me/${telegramHandle}`;

  const phoneNumber = contacts?.phoneNumber || "+998901234567";
  const phoneClean = phoneNumber.replace(/[^0-9+]/g, "");
  const phoneUrl = `tel:${phoneClean}`;

  const isInSelection = isHydrated && hasItem(product.id);

  const categoryName = product.category?.name || product.categoryName || "Изделия";
  const categorySlug = product.category?.slug || product.categorySlug || "koltsa";

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
      categoryName: categoryName,
      mainImageUrl: product.images?.[0]?.url || "",
      isVisible: product.isVisible ?? true,
    };

    addToSelection(summary, quantity);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* 1. Breadcrumbs: Главная -> Каталог -> [Категория] -> [Название] */}
      <nav aria-label="Хлебные крошки" className="flex items-center gap-1.5 text-xs text-noir-400">
        <Link
          href="/"
          className="transition-colors hover:text-gold-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
        >
          Главная
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-noir-600" />
        <Link
          href="/catalog"
          className="transition-colors hover:text-gold-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
        >
          Каталог
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-noir-600" />
        <Link
          href={`/catalog/${categorySlug}`}
          className="transition-colors hover:text-gold-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
        >
          {categoryName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-noir-600" />
        <span
          aria-current="page"
          className="truncate max-w-[180px] sm:max-w-xs font-medium text-gold-300/90"
        >
          {product.name}
        </span>
      </nav>

      {/* 2. Category badge & SKU */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Link
          href={`/catalog/${categorySlug}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3.5 py-1 text-xs font-medium uppercase tracking-wider text-gold-300 transition-colors hover:bg-gold-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          <Sparkles className="h-3.5 w-3.5 text-gold-400" />
          <span>{categoryName}</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-noir-400">Артикул:</span>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-400">
            {product.sku}
          </span>
        </div>
      </div>

      {/* 3. Title H1 */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide text-white leading-tight">
          {product.name}
        </h1>
      </div>

      {/* 4. Bespoke Callout Banner: "Изделие изготавливается под заказ мастером" */}
      <div className="relative overflow-hidden rounded-2xl border border-gold-500/30 bg-gradient-to-br from-gold-500/10 via-noir-900/90 to-noir-950 p-4 sm:p-5 shadow-lg">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/20 text-gold-400 border border-gold-500/30">
            <Hammer className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-sm font-semibold tracking-wide text-gold-200">
              Изделие изготавливается под заказ мастером
            </h3>
            <p className="text-xs leading-relaxed text-noir-300">
              Каждое ювелирное украшение создается вручную по индивидуальным параметрам.
              Вы можете согласовать пробу золота, размер и характеристики камней перед началом работы.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Author's Description */}
      {product.description && (
        <div className="space-y-2 pt-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-noir-400">
            Описание работы мастера
          </h2>
          <p className="text-sm leading-relaxed text-noir-200 sm:text-base">
            {product.description}
          </p>
        </div>
      )}

      {/* 6. Characteristics Table */}
      {product.characteristics && product.characteristics.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-noir-400">
            Характеристики изделия
          </h2>
          <div className="overflow-hidden rounded-xl border border-noir-800 bg-noir-900/70 shadow-inner">
            <dl className="divide-y divide-noir-800/80">
              {product.characteristics.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm hover:bg-noir-800/30 transition-colors"
                >
                  <dt className="text-noir-400">{c.name}</dt>
                  <dd className="font-medium text-noir-100 text-right">{c.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {/* 7. Precious Stones Blocks */}
      {product.stones && product.stones.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Gem className="h-4 w-4 text-gold-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-noir-400">
              Драгоценные вставки и камни
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {product.stones.map((stone, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-noir-800 bg-noir-900/70 p-4 transition-all duration-200 hover:border-gold-500/40"
              >
                <div className="flex items-center justify-between pb-2 border-b border-noir-800">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-gold-400" />
                    <span className="font-serif text-sm font-medium text-gold-200">
                      {stone.stoneTypeName || "Драгоценный камень"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-noir-400">
                    Вставка #{idx + 1}
                  </span>
                </div>

                {stone.characteristics && stone.characteristics.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {stone.characteristics.map((sc, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-noir-400">{sc.name}:</span>
                        <span className="font-medium text-noir-200">{sc.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Selection Action Box: Counter + "В подборку" */}
      <div className="space-y-3 pt-3">
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {/* Quantity Counter [ - ] N [ + ] */}
          <div className="flex items-center justify-between sm:justify-start rounded-xl border border-noir-700/80 bg-noir-900 p-1">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-noir-300 transition-colors hover:bg-noir-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              aria-label="Уменьшить количество"
            >
              <Minus className="h-4 w-4" />
            </button>

            <span
              className="min-w-[48px] text-center font-mono text-sm font-medium text-white select-none px-2"
              aria-live="polite"
              aria-label={`Выбрано количество: ${quantity}`}
            >
              {quantity}
            </span>

            <button
              type="button"
              onClick={handleIncrement}
              disabled={quantity >= 99}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-noir-300 transition-colors hover:bg-noir-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              aria-label="Увеличить количество"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Main Action Button: "В подборку" */}
          <button
            id="main-add-to-selection-button"
            type="button"
            onClick={handleAddToSelection}
            className={`flex-1 flex min-h-[44px] items-center justify-center gap-2.5 rounded-xl px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 shadow-md ${
              justAdded
                ? "border border-gold-400 bg-gold-400 text-noir-950 font-bold"
                : isInSelection
                ? "border border-gold-400/50 bg-gold-500/20 text-gold-200 hover:bg-gold-500/30"
                : "border border-gold-500 bg-gradient-to-r from-gold-500 to-gold-600 text-noir-950 font-bold hover:from-gold-400 hover:to-gold-500 hover:shadow-gold"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4 stroke-[2.5]" />
                <span>Добавлено в подборку</span>
              </>
            ) : isInSelection ? (
              <>
                <Sparkles className="h-4 w-4 text-gold-400" />
                <span>Добавить еще ({quantity})</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>В подборку</span>
              </>
            )}
          </button>
        </div>

        {/* Post-add helper banner */}
        {isInSelection && (
          <div className="flex items-center justify-between rounded-lg border border-gold-500/20 bg-noir-900/60 px-4 py-2.5 text-xs text-gold-300">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-gold-400" />
              Изделие уже есть в вашей подборке
            </span>
            <button
              type="button"
              onClick={openSelection}
              className="font-medium text-white underline underline-offset-4 hover:text-gold-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
            >
              Открыть подборку
            </button>
          </div>
        )}
      </div>

      {/* 9. Direct Master Contacts Block: Telegram & Phone */}
      <div className="rounded-2xl border border-noir-800 bg-gradient-to-b from-noir-900/90 to-noir-950 p-5 space-y-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gold-400" />
            <h3 className="font-serif text-sm font-semibold tracking-wide text-gold-200">
              Связаться с мастером напрямую
            </h3>
          </div>
          <p className="text-xs text-noir-400 leading-relaxed">
            Обсудите детали изделия, точный размер и сроки изготовления напрямую с мастером в удобном мессенджере или по телефону.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Telegram button */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center justify-center gap-2.5 rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gold-300 transition-all duration-200 hover:border-gold-400 hover:bg-gold-500/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            aria-label={`Написать мастеру в Telegram: @${telegramHandle}`}
          >
            <Send className="h-4 w-4 text-gold-400" />
            <span>Написать в Telegram</span>
          </a>

          {/* Call button */}
          <a
            href={phoneUrl}
            className="flex min-h-[44px] items-center justify-center gap-2.5 rounded-xl border border-noir-700 bg-noir-800/80 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-noir-200 transition-all duration-200 hover:border-gold-500/40 hover:bg-noir-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            aria-label={`Позвонить мастеру: ${phoneNumber}`}
          >
            <Phone className="h-4 w-4 text-gold-400" />
            <span>Позвонить мастеру</span>
          </a>
        </div>
      </div>
    </div>
  );
};
