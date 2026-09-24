"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useSelectionStore, useSelectionCount } from "@/store/selection-store";

export const Header: React.FC = () => {
  const openSelection = useSelectionStore((state) => state.openSelection);
  const count = useSelectionCount();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gold-500/20 bg-noir-950/85 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Title */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/images/icon-gold.png"
              alt="Marziya Gold"
              width={44}
              height={44}
              priority
              className="h-full w-full object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl sm:text-2xl font-semibold tracking-wider text-gold-200 group-hover:text-gold-100 transition-colors uppercase">
              Marziya Gold
            </span>
            <span className="text-[10px] tracking-widest text-gold-400/80 uppercase">
              Мастерская ювелирного искусства
            </span>
          </div>
        </Link>

        {/* Navigation & Action Controls */}
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/#catalog"
            className="hidden text-sm font-medium tracking-wide text-noir-200 hover:text-gold-300 transition-colors sm:block"
          >
            Каталог изделий
          </Link>
          <Link
            href="/#about"
            className="hidden text-sm font-medium tracking-wide text-noir-200 hover:text-gold-300 transition-colors md:block"
          >
            О мастере
          </Link>
          <Link
            href="/#contacts"
            className="hidden text-sm font-medium tracking-wide text-noir-200 hover:text-gold-300 transition-colors sm:block"
          >
            Контакты
          </Link>

          {/* Кнопка "Моя подборка" */}
          <button
            type="button"
            onClick={openSelection}
            className="relative flex items-center gap-2 rounded-full border border-gold-400/40 bg-gradient-to-r from-gold-500/10 to-gold-400/20 px-4 py-2 text-sm font-medium text-gold-200 hover:border-gold-300 hover:text-white transition-all shadow-sm hover:shadow-gold"
            aria-label="Открыть мою подборку"
          >
            <Sparkles className="h-4 w-4 text-gold-400" />
            <span className="font-medium">Моя подборка</span>
            {count > 0 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1.5 text-xs font-bold text-noir-950">
                {count}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
