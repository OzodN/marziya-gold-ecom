"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
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

  // Extract all available images for card-level swiping
  const rawImages = (product.imageUrls && product.imageUrls.length > 0)
    ? product.imageUrls
    : (product.images && product.images.length > 0)
    ? product.images
    : product.mainImageUrl
    ? [product.mainImageUrl]
    : [];

  const images = rawImages.length > 0 ? rawImages : [""];
  const totalImages = images.length;
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Swipe & Drag gesture tracking
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const hasSwipedRef = useRef(false);
  const [isGrabbing, setIsGrabbing] = useState(false);

  const isInSelection = isHydrated && hasItem(product.id);

  const nextImage = () => {
    if (totalImages <= 1) return;
    setActiveImgIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    if (totalImages <= 1) return;
    setActiveImgIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    hasSwipedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = touchStartXRef.current - e.touches[0].clientX;
    const deltaY = touchStartYRef.current - e.touches[0].clientY;
    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
      hasSwipedRef.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = touchStartXRef.current - endX;
    const deltaY = touchStartYRef.current - endY;

    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY)) {
      hasSwipedRef.current = true;
      if (deltaX > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Desktop Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || totalImages <= 1) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    hasSwipedRef.current = false;
    setIsGrabbing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    const deltaY = e.clientY - dragStartYRef.current;
    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
      hasSwipedRef.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsGrabbing(false);

    const deltaX = e.clientX - dragStartXRef.current;
    const deltaY = e.clientY - dragStartYRef.current;

    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY)) {
      hasSwipedRef.current = true;
      if (deltaX < 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsGrabbing(false);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (hasSwipedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasSwipedRef.current = false;
    }
  };

  const handleAddToSelection = () => {
    addToSelection(product, 1);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1500);
  };

  const currentImage = images[activeImgIndex];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-noir-700/80 bg-noir-900/90 transition-all duration-300 hover:border-gold-500/50 hover:shadow-card hover:-translate-y-1">
      {/* Product Image with direct touch & mouse swipe support */}
      <Link
        href={`/product/${product.slug}`}
        onClick={handleLinkClick}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 select-none"
      >
        <div
          className={`relative aspect-square w-full overflow-hidden bg-noir-800 ${
            totalImages > 1 ? (isGrabbing ? "cursor-grabbing" : "cursor-grab") : ""
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {currentImage ? (
            <Image
              src={currentImage}
              alt={`${product.name} — фото ${activeImgIndex + 1}`}
              fill
              className="object-cover pointer-events-none transition-transform duration-500 ease-out group-hover:scale-105"
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

          {/* In-Card Minimalist Dots indicator (no arrow buttons, pure swipe) */}
          {totalImages > 1 && (
            <div className="absolute bottom-2.5 left-0 right-0 flex justify-center items-center gap-1.5 pointer-events-auto">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveImgIndex(idx);
                  }}
                  className="flex h-6 min-w-[20px] items-center justify-center p-1 focus:outline-none"
                  aria-label={`Фото ${idx + 1} из ${totalImages}`}
                >
                  <span
                    className={`h-1 rounded-full transition-all duration-300 ${
                      activeImgIndex === idx
                        ? "w-5 bg-gold-400 shadow-gold"
                        : "w-1.5 bg-noir-400/50 hover:bg-gold-300/60"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-1.5">
          <span className="font-mono text-[11px] tracking-wider text-gold-400/80 uppercase">
            {product.sku}
          </span>
          <Link
            href={`/product/${product.slug}`}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
          >
            <h3 className="font-serif text-lg font-medium text-white transition-colors group-hover:text-gold-200 line-clamp-1 hover:underline">
              {product.name}
            </h3>
          </Link>

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
            className={`flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
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
