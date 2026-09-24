"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface CatalogSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CatalogSearch: React.FC<CatalogSearchProps> = ({
  value,
  onChange,
  placeholder = "Поиск по названию или артикулу (SKU)...",
  className = "",
}) => {
  const [internalValue, setInternalValue] = useState(value);

  // Sync internal state when external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounce internal input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [internalValue, value, onChange]);

  const handleClear = () => {
    setInternalValue("");
    onChange("");
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="pointer-events-none absolute left-3.5 flex items-center text-gold-400/80">
        <Search className="h-4 w-4 stroke-[2]" />
      </div>

      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Поиск по каталогу"
        className="w-full rounded-xl border border-noir-700/80 bg-noir-900/90 py-2.5 pl-10 pr-11 text-sm text-white placeholder-noir-400 transition-all duration-200 focus:border-gold-400 focus:bg-noir-900 focus:outline-none focus:ring-1 focus:ring-gold-400/60"
      />

      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Очистить поиск"
          className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-full text-noir-400 transition-colors hover:bg-noir-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
