"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  pageNumber: number; // 0-indexed
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  pageNumber,
  totalPages,
  totalElements,
  pageSize = 12,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) {
    return null;
  }

  // Calculate shown range
  const startItem = totalElements ? pageNumber * pageSize + 1 : 0;
  const endItem = totalElements
    ? Math.min((pageNumber + 1) * pageSize, totalElements)
    : 0;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const delta = 1;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 ||
        i === totalPages - 1 ||
        (i >= pageNumber - delta && i <= pageNumber + delta)
      ) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-col items-center justify-between gap-4 sm:flex-row ${className}`}
    >
      {/* Information text */}
      {totalElements !== undefined && (
        <p className="text-xs text-noir-400">
          Показано{" "}
          <span className="font-medium text-gold-300">
            {totalElements === 0 ? 0 : `${startItem}–${endItem}`}
          </span>{" "}
          из <span className="font-medium text-gold-300">{totalElements}</span>{" "}
          изделий
        </p>
      )}

      {/* Pagination controls */}
      <nav
        role="navigation"
        aria-label="Пагинация каталога"
        className="flex items-center gap-1.5"
      >
        {/* Previous page */}
        <button
          type="button"
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber <= 0}
          aria-label="Предыдущая страница"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-noir-700/80 bg-noir-900/90 text-noir-300 transition-all hover:border-gold-500/50 hover:text-gold-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-noir-700 disabled:hover:text-noir-300"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page buttons */}
        {pages.map((p, idx) => {
          if (typeof p === "string") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-9 w-7 items-center justify-center text-xs text-noir-500"
              >
                …
              </span>
            );
          }

          const isCurrent = p === pageNumber;
          return (
            <button
              key={`page-${p}`}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={isCurrent ? "page" : undefined}
              aria-label={`Страница ${p + 1}`}
              className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-xs font-medium transition-all ${
                isCurrent
                  ? "bg-gold-500 font-bold text-noir-950 shadow-gold"
                  : "border border-noir-700/80 bg-noir-900/90 text-noir-300 hover:border-gold-500/50 hover:text-gold-200"
              }`}
            >
              {p + 1}
            </button>
          );
        })}

        {/* Next page */}
        <button
          type="button"
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber >= totalPages - 1}
          aria-label="Следующая страница"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-noir-700/80 bg-noir-900/90 text-noir-300 transition-all hover:border-gold-500/50 hover:text-gold-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-noir-700 disabled:hover:text-noir-300"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};
