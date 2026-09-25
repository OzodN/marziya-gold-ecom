"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Gem,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react";
import type { ProductImageDto } from "@/types/api";

interface ProductGalleryProps {
  images?: ProductImageDto[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  productName,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Touch swipe tracking references (Main gallery)
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const touchEndYRef = useRef<number | null>(null);

  // Desktop Mouse drag tracking for main gallery
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [isGrabbing, setIsGrabbing] = useState(false);

  // Lightbox swipe & pan tracking
  const lbDraggingRef = useRef(false);
  const lbStartXRef = useRef(0);
  const lbStartYRef = useRef(0);
  const lbHasDraggedRef = useRef(false);
  const [isLbGrabbing, setIsLbGrabbing] = useState(false);

  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const hasPanMovedRef = useRef(false);

  // Focus trap references for Lightbox
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const galleryImages = images.length > 0
    ? images
    : [{ url: "", sortOrder: 0 }];

  const totalImages = galleryImages.length;
  const currentImage = galleryImages[activeIndex];

  // Reset zoom & pan helper
  const resetZoom = useCallback(() => {
    setLightboxScale(1);
    setPan({ x: 0, y: 0 });
    setIsPanning(false);
    isPanningRef.current = false;
    hasPanMovedRef.current = false;
  }, []);

  // Navigation callbacks
  const goToNext = useCallback(() => {
    if (totalImages <= 1) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => (prev + 1) % totalImages);
    resetZoom();
    setTimeout(() => setIsTransitioning(false), 250);
  }, [totalImages, resetZoom]);

  const goToPrev = useCallback(() => {
    if (totalImages <= 1) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => (prev - 1 + totalImages) % totalImages);
    resetZoom();
    setTimeout(() => setIsTransitioning(false), 250);
  }, [totalImages, resetZoom]);

  const selectImage = useCallback((index: number) => {
    if (index === activeIndex) return;
    setIsTransitioning(true);
    setActiveIndex(index);
    resetZoom();
    setTimeout(() => setIsTransitioning(false), 250);
  }, [activeIndex, resetZoom]);

  // Touch swipe handlers (Main Gallery)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchEndXRef.current = null;
    touchEndYRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
    touchEndYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (
      touchStartXRef.current === null ||
      touchEndXRef.current === null ||
      touchStartYRef.current === null ||
      touchEndYRef.current === null
    ) {
      return;
    }

    const deltaX = touchStartXRef.current - touchEndXRef.current;
    const deltaY = touchStartYRef.current - touchEndYRef.current;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchEndXRef.current = null;
    touchEndYRef.current = null;
  };

  // Mouse drag handlers for Main Gallery (Desktop swipe)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    hasDraggedRef.current = false;
    setIsGrabbing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    const deltaY = e.clientY - dragStartYRef.current;
    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
      hasDraggedRef.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsGrabbing(false);

    const deltaX = e.clientX - dragStartXRef.current;
    const deltaY = e.clientY - dragStartYRef.current;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsGrabbing(false);
    }
  };

  // Zoom manipulation handlers in Lightbox
  const handleZoomIn = () => {
    setLightboxScale((prev) => {
      const next = Math.min(3.5, Math.round((prev + 0.4) * 10) / 10);
      return next;
    });
  };

  const handleZoomOut = () => {
    setLightboxScale((prev) => {
      const next = Math.max(1, Math.round((prev - 0.4) * 10) / 10);
      if (next <= 1) {
        setPan({ x: 0, y: 0 });
      }
      return next;
    });
  };

  // Mouse wheel zoom in Lightbox
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setLightboxScale((prev) => {
      const next = Math.min(3.5, Math.max(1, Math.round((prev + delta) * 10) / 10));
      if (next <= 1) {
        setPan({ x: 0, y: 0 });
      }
      return next;
    });
  };

  // Lightbox unified mouse drag (Pan when scale > 1, Swipe when scale === 1)
  const handleLbMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (lightboxScale > 1) {
      isPanningRef.current = true;
      setIsPanning(true);
      hasPanMovedRef.current = false;
      panStartRef.current = {
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      };
    } else {
      lbDraggingRef.current = true;
      lbStartXRef.current = e.clientX;
      lbStartYRef.current = e.clientY;
      lbHasDraggedRef.current = false;
      setIsLbGrabbing(true);
    }
  };

  const handleLbMouseMove = (e: React.MouseEvent) => {
    if (lightboxScale > 1 && isPanningRef.current) {
      const newX = e.clientX - panStartRef.current.x;
      const newY = e.clientY - panStartRef.current.y;
      const dist = Math.hypot(
        e.clientX - (panStartRef.current.x + pan.x),
        e.clientY - (panStartRef.current.y + pan.y)
      );
      if (dist > 6) {
        hasPanMovedRef.current = true;
      }
      const boundX = window.innerWidth * 0.45 * (lightboxScale - 1);
      const boundY = window.innerHeight * 0.45 * (lightboxScale - 1);
      const clampedX = Math.max(-boundX, Math.min(boundX, newX));
      const clampedY = Math.max(-boundY, Math.min(boundY, newY));
      setPan({ x: clampedX, y: clampedY });
    } else if (lightboxScale === 1 && lbDraggingRef.current) {
      const deltaX = e.clientX - lbStartXRef.current;
      const deltaY = e.clientY - lbStartYRef.current;
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        lbHasDraggedRef.current = true;
      }
    }
  };

  const handleLbMouseUp = (e: React.MouseEvent) => {
    if (lightboxScale > 1) {
      isPanningRef.current = false;
      setIsPanning(false);
    } else if (lbDraggingRef.current) {
      lbDraggingRef.current = false;
      setIsLbGrabbing(false);
      const deltaX = e.clientX - lbStartXRef.current;
      const deltaY = e.clientY - lbStartYRef.current;
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          goToNext();
        } else {
          goToPrev();
        }
      }
    }
  };

  const handleLbMouseLeave = () => {
    isPanningRef.current = false;
    setIsPanning(false);
    lbDraggingRef.current = false;
    setIsLbGrabbing(false);
  };

  // Click on the image inside Lightbox to toggle zoom
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasPanMovedRef.current || lbHasDraggedRef.current) {
      hasPanMovedRef.current = false;
      lbHasDraggedRef.current = false;
      return;
    }

    if (lightboxScale > 1) {
      resetZoom();
    } else {
      setLightboxScale(2.2);
      setPan({ x: 0, y: 0 });
    }
  };

  // Keyboard navigation, Focus Trap & lock body scroll for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    resetZoom();
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    const focusTimer = setTimeout(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      }
    }, 50);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsLightboxOpen(false);
        resetZoom();
        return;
      }

      if (e.key === "ArrowRight") {
        goToNext();
        return;
      }

      if (e.key === "ArrowLeft") {
        goToPrev();
        return;
      }

      if (e.key === "Tab") {
        if (!lightboxRef.current) return;

        const focusableElements = Array.from(
          lightboxRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (
            document.activeElement === firstElement ||
            !lightboxRef.current.contains(document.activeElement)
          ) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (
            document.activeElement === lastElement ||
            !lightboxRef.current.contains(document.activeElement)
          ) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);

      if (
        previousActiveElementRef.current &&
        typeof previousActiveElementRef.current.focus === "function"
      ) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isLightboxOpen, goToNext, goToPrev, resetZoom]);

  // Fullscreen Lightbox Modal content
  const lightboxModal = isLightboxOpen && currentImage?.url && (
    <div
      ref={lightboxRef}
      className="fixed inset-0 z-[100] flex flex-col bg-noir-950/95 backdrop-blur-xl animate-in fade-in duration-200 select-none"
      role="dialog"
      aria-modal="true"
      aria-label={`Полноэкранный просмотр: ${productName}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        setIsLightboxOpen(false);
        resetZoom();
      }}
    >
      {/* Prominent Always-Visible Floating Close [X] Button */}
      <button
        ref={closeButtonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsLightboxOpen(false);
          resetZoom();
        }}
        className="fixed top-4 right-4 z-[130] flex h-12 w-12 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-gold-500/60 bg-noir-900/90 text-gold-300 shadow-2xl backdrop-blur-md transition-all duration-200 hover:border-gold-400 hover:bg-noir-800 hover:text-white hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        aria-label="Закрыть полноэкранный режим"
        title="Закрыть (Escape)"
      >
        <X className="h-6 w-6 stroke-[2.2]" />
      </button>

      {/* Top Bar with Title, Counter and Interactive Zoom Controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between px-6 py-3.5 pr-20 border-b border-noir-800/80 bg-noir-950/70"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-serif text-sm font-medium tracking-wide text-gold-200 truncate">
            {productName}
          </span>
          {totalImages > 1 && (
            <span className="shrink-0 rounded-full bg-noir-800 px-2.5 py-0.5 text-xs font-mono text-noir-300">
              {activeIndex + 1} / {totalImages}
            </span>
          )}
        </div>

        {/* Zoom Controls: [ - ] 100% [ + ] [ Сбросить ] */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={lightboxScale <= 1}
            className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-noir-800 bg-noir-900 text-gold-300 transition-colors hover:border-gold-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            aria-label="Уменьшить масштаб"
            title="Отдалить"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span
            className="min-w-[48px] text-center font-mono text-xs font-semibold text-gold-300 select-none"
            aria-label={`Текущий масштаб: ${Math.round(lightboxScale * 100)}%`}
          >
            {Math.round(lightboxScale * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={lightboxScale >= 3.5}
            className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-noir-800 bg-noir-900 text-gold-300 transition-colors hover:border-gold-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            aria-label="Увеличить масштаб"
            title="Приблизить"
          >
            <Plus className="h-4 w-4" />
          </button>

          {lightboxScale > 1 && (
            <button
              type="button"
              onClick={resetZoom}
              className="ml-1 flex h-10 items-center gap-1.5 rounded-lg border border-gold-500/40 bg-gold-500/10 px-3 text-xs font-medium text-gold-300 transition-colors hover:border-gold-400 hover:bg-gold-500/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              aria-label="Сбросить масштаб к 100%"
              title="Сбросить масштаб"
            >
              <RotateCcw className="h-3.5 w-3.5 text-gold-400" />
              <span className="hidden sm:inline">100%</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Fullscreen Viewer Area with Hardware-Accelerated Zoom & Pan */}
      <div
        onClick={() => {
          setIsLightboxOpen(false);
          resetZoom();
        }}
        onWheel={handleWheel}
        onMouseDown={handleLbMouseDown}
        onMouseMove={handleLbMouseMove}
        onMouseUp={handleLbMouseUp}
        onMouseLeave={handleLbMouseLeave}
        className={`relative flex flex-1 items-center justify-center p-4 sm:p-8 overflow-hidden ${
          lightboxScale === 1
            ? isLbGrabbing ? "cursor-grabbing" : "cursor-grab"
            : isPanning ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <div
          className={`relative max-h-full max-w-full aspect-square w-full sm:w-auto h-[72vh] select-none ${
            lightboxScale > 1
              ? isPanning ? "cursor-grabbing" : "cursor-grab"
              : "cursor-zoom-in"
          }`}
          style={{
            transform: `scale(${lightboxScale}) translate3d(${pan.x / lightboxScale}px, ${pan.y / lightboxScale}px, 0)`,
            transition: isPanning ? "none" : "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
            transformOrigin: "center center",
            willChange: "transform",
          }}
          onClick={handleImageClick}
        >
          <Image
            src={currentImage.url}
            alt={`${productName} в высоком разрешении`}
            fill
            className="object-contain pointer-events-none"
            sizes="100vw"
            priority
            quality={95}
          />
        </div>

        {/* Prev / Next navigation inside Lightbox (available when scale === 1) */}
        {totalImages > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-noir-700 bg-noir-900/90 text-gold-300 shadow-xl backdrop-blur-md transition-all hover:border-gold-400 hover:bg-noir-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              aria-label="Предыдущее изображение"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-noir-700 bg-noir-900/90 text-gold-300 shadow-xl backdrop-blur-md transition-all hover:border-gold-400 hover:bg-noir-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              aria-label="Следующее изображение"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Lightbox Bottom Thumbnails Bar */}
      {totalImages > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-2 overflow-x-auto border-t border-noir-800/80 bg-noir-950/70 p-4"
        >
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectImage(idx)}
              className={`relative min-h-[48px] min-w-[48px] h-12 w-12 overflow-hidden rounded-lg border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                activeIndex === idx
                  ? "border-gold-400 ring-2 ring-gold-400/40"
                  : "border-noir-700 opacity-60 hover:opacity-100"
              }`}
              aria-label={`Переключить на фото ${idx + 1}`}
            >
              {img.url && (
                <Image
                  src={img.url}
                  alt={`Миниатюра ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Display Box */}
      <div
        className={`group relative aspect-square w-full overflow-hidden rounded-2xl border border-noir-800 bg-noir-900 shadow-2xl select-none ${
          isGrabbing ? "cursor-grabbing" : "cursor-grab"
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {currentImage?.url ? (
          <div
            onClick={() => {
              if (hasDraggedRef.current) return;
              setIsLightboxOpen(true);
            }}
            className="relative h-full w-full"
            role="button"
            tabIndex={0}
            aria-label={`Увеличить изображение ${activeIndex + 1} из ${totalImages}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsLightboxOpen(true);
              }
            }}
          >
            <Image
              src={currentImage.url}
              alt={`${productName} — ракурс ${activeIndex + 1}`}
              fill
              priority={activeIndex === 0}
              className={`object-cover object-center pointer-events-none transition-all duration-500 ease-out group-hover:scale-[1.03] ${
                isTransitioning ? "opacity-60 scale-98" : "opacity-100 scale-100"
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
            />
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-noir-800 to-noir-900 text-gold-500/30">
            <Gem className="h-20 w-20 stroke-[1.2]" />
            <span className="mt-3 font-serif text-xs uppercase tracking-widest text-gold-400/60">
              Marziya Gold
            </span>
          </div>
        )}

        {/* Fullscreen zoom hint badge */}
        {currentImage?.url && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-noir-700/80 bg-noir-950/80 text-gold-300 backdrop-blur-md transition-all duration-200 hover:border-gold-400 hover:bg-noir-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            aria-label="Открыть полноэкранный зум"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}

        {/* Previous Image Arrow */}
        {totalImages > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-noir-700/80 bg-noir-950/80 text-gold-300 opacity-90 backdrop-blur-md transition-all duration-200 hover:border-gold-400 hover:bg-noir-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Предыдущее фото"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Next Image Arrow */}
        {totalImages > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-noir-700/80 bg-noir-950/80 text-gold-300 opacity-90 backdrop-blur-md transition-all duration-200 hover:border-gold-400 hover:bg-noir-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Следующее фото"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Dots pagination indicator (Visible primarily on mobile & touch) */}
        {totalImages > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-1.5 pointer-events-auto">
            {galleryImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  selectImage(idx);
                }}
                className="flex h-11 min-h-[44px] min-w-[44px] items-center justify-center px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-full"
                aria-label={`Перейти к фотографии ${idx + 1}`}
              >
                <span
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeIndex === idx
                      ? "w-7 bg-gold-400 shadow-gold"
                      : "w-2 bg-noir-500/70 hover:bg-gold-300/60"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {totalImages > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectImage(idx)}
              className={`group relative flex-shrink-0 min-h-[56px] min-w-[56px] h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                activeIndex === idx
                  ? "border-gold-400 ring-2 ring-gold-400/30 scale-105"
                  : "border-noir-800 bg-noir-900 opacity-70 hover:border-gold-500/40 hover:opacity-100"
              }`}
              aria-label={`Выбрать фото ${idx + 1} изделия ${productName}`}
            >
              {img.url ? (
                <Image
                  src={img.url}
                  alt={`${productName} миниатюра ${idx + 1}`}
                  fill
                  className="object-cover pointer-events-none"
                  sizes="80px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-noir-800 text-gold-400/40">
                  <Gem className="h-6 w-6" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal rendered via Portal into body */}
      {mounted && lightboxModal && createPortal(lightboxModal, document.body)}
    </div>
  );
};
