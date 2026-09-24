import React from "react";
import Link from "next/link";
import { Gem, ArrowLeft } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-gold-500/30 bg-noir-900/80 text-gold-400 shadow-xl">
        <Gem className="h-12 w-12 stroke-[1.2]" />
      </div>

      <span className="font-mono text-xs uppercase tracking-widest text-gold-400 mb-2">
        Marziya Gold
      </span>

      <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-wide text-white mb-3">
        Изделие не найдено
      </h1>

      <p className="max-w-md text-sm text-noir-300 leading-relaxed mb-8">
        Возможно, адрес страницы изменился или изделие было снято с демонстрации. Вы можете ознакомиться с полной коллекцией авторских украшений в нашем каталоге.
      </p>

      <Link
        href="/catalog"
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-gold-500 bg-gold-500/10 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-gold-300 transition-all duration-200 hover:bg-gold-500 hover:text-noir-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Перейти в каталог</span>
      </Link>
    </div>
  );
}
