"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallbackUrl?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  fallbackUrl = "/catalog",
}) => {
  return (
    <Link
      href={fallbackUrl}
      className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-noir-800 bg-noir-900/90 text-gold-300 shadow-md backdrop-blur-md transition-all duration-200 hover:border-gold-400 hover:bg-noir-800 hover:text-white hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
      aria-label="Вернуться назад в каталог изделий"
      title="Назад в каталог"
    >
      <ArrowLeft className="h-5 w-5 stroke-[2]" />
    </Link>
  );
};
