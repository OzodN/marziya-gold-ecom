"use client";

import React from "react";
import Link from "next/link";
import {
  Inbox,
  Gem,
  ExternalLink,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FolderTree,
  SlidersHorizontal,
  Settings,
} from "lucide-react";
import { useAdminStore } from "@/store/admin-store";

export default function AdminDashboardPage() {
  const {
    newInquiriesCount,
    lastPolledAt,
    isPolling,
    pollNewCount,
    user,
  } = useAdminStore();

  const handleManualRefresh = async () => {
    await pollNewCount();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome & Status */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-noir-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-gold-400 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Панель управления мастера</span>
          </div>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {user?.username ? `Мастерская: ${user.username}` : "Обзор мастерской"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-noir-400">
            Оперативный контроль поступающих клиентских заявок и каталога изделий
          </p>
        </div>

        {/* Polling status & Manual sync button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-noir-800 bg-noir-900/60 px-3.5 py-2 text-xs text-noir-400 backdrop-blur-sm">
            <Clock className="h-3.5 w-3.5 text-gold-400/80" />
            <span>
              Синхронизация:{" "}
              <strong className="text-noir-200">
                {lastPolledAt ? lastPolledAt : "загрузка..."}
              </strong>
            </span>
            <span className="hidden md:inline text-noir-500">• 30 сек</span>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isPolling}
            aria-label="Обновить количество заявок"
            className="flex min-h-[44px] items-center gap-2 rounded-xl border border-gold-500/30 bg-noir-900/80 px-4 py-2 text-xs font-medium text-gold-200 transition-all hover:border-gold-400 hover:bg-gold-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-gold-400 ${
                isPolling ? "animate-spin" : ""
              }`}
            />
            <span>{isPolling ? "Проверка..." : "Обновить"}</span>
          </button>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: New Inquiries (Polling Highlight) */}
        <div className="relative overflow-hidden rounded-2xl border border-gold-500/25 bg-gradient-to-br from-noir-900/90 to-noir-950 p-6 shadow-xl backdrop-blur-md">
          <div className="pointer-events-none absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-gold-500/5 blur-2xl" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-gold-400 uppercase">
              Заявки клиентов
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10 text-gold-400">
              <Inbox className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-white">
              {newInquiriesCount}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                newInquiriesCount > 0
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                  : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              }`}
            >
              {newInquiriesCount > 0 ? (
                <>Ожидают звонка мастера</>
              ) : (
                <>Все заявки обработаны</>
              )}
            </span>
          </div>

          <p className="mt-3 text-xs text-noir-400 leading-relaxed">
            Поступившие запросы от покупателей с выбранными изделиями из «Моей подборки».
          </p>

          <div className="mt-6 pt-4 border-t border-noir-800">
            <Link
              href="/admin/inquiries"
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2.5 text-xs sm:text-sm font-semibold text-noir-950 transition-all hover:from-gold-400 hover:to-gold-300 shadow-gold"
            >
              <span>Перейти к списку заявок</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Card 2: Products Catalog */}
        <div className="relative overflow-hidden rounded-2xl border border-noir-800 bg-gradient-to-br from-noir-900/70 to-noir-950 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-noir-400 uppercase">
              Каталог изделий
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-noir-800 bg-noir-900 text-gold-400">
              <Gem className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white block">
              Ювелирные изделия
            </span>
            <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-gold-300">
              <ShieldCheck className="h-3.5 w-3.5 text-gold-400" />
              <span>Индивидуальное изготовление</span>
            </span>
          </div>

          <p className="mt-3 text-xs text-noir-400 leading-relaxed">
            Управление изделиями ручной работы, добавление драгоценных камней, металла и параметров пробы.
          </p>

          <div className="mt-6 pt-4 border-t border-noir-800">
            <Link
              href="/admin/products"
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-noir-700 bg-noir-900/80 px-4 py-2.5 text-xs sm:text-sm font-medium text-noir-200 transition-colors hover:border-gold-500/40 hover:text-gold-200"
            >
              <span>Управление изделиями</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Card 3: Storefront Status */}
        <div className="relative overflow-hidden rounded-2xl border border-noir-800 bg-gradient-to-br from-noir-900/70 to-noir-950 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-noir-400 uppercase">
              Витрина сайта
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white block">
              Витрина активна
            </span>
            <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Открытый каталог доступен клиентам</span>
            </span>
          </div>

          <p className="mt-3 text-xs text-noir-400 leading-relaxed">
            Клиенты могут просматривать изделия, фильтровать по характеристикам и формировать «Мою подборку».
          </p>

          <div className="mt-6 pt-4 border-t border-noir-800">
            <Link
              href="/catalog"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-noir-700 bg-noir-900/80 px-4 py-2.5 text-xs sm:text-sm font-medium text-noir-200 transition-colors hover:border-gold-500/40 hover:text-gold-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <span>Открыть витрину каталога</span>
              <ExternalLink className="h-4 w-4 text-noir-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-semibold tracking-wide text-white">
          Разделы управления
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/inquiries"
            className="group flex flex-col justify-between rounded-xl border border-noir-800 bg-noir-900/40 p-4 transition-all hover:border-gold-500/30 hover:bg-noir-900/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 text-gold-400 group-hover:bg-gold-500/20 transition-colors">
                <Inbox className="h-4 w-4" />
              </div>
              {newInquiriesCount > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-noir-950">
                  +{newInquiriesCount}
                </span>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-white group-hover:text-gold-200 transition-colors">
                Заявки клиентов
              </h3>
              <p className="mt-1 text-xs text-noir-400">
                Просмотр и смена статусов обращений
              </p>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="group flex flex-col justify-between rounded-xl border border-noir-800 bg-noir-900/40 p-4 transition-all hover:border-gold-500/30 hover:bg-noir-900/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 text-gold-400 group-hover:bg-gold-500/20 transition-colors">
              <FolderTree className="h-4 w-4" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-white group-hover:text-gold-200 transition-colors">
                Категории
              </h3>
              <p className="mt-1 text-xs text-noir-400">
                Кольца, серьги, браслеты, колье
              </p>
            </div>
          </Link>

          <Link
            href="/admin/characteristics"
            className="group flex flex-col justify-between rounded-xl border border-noir-800 bg-noir-900/40 p-4 transition-all hover:border-gold-500/30 hover:bg-noir-900/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 text-gold-400 group-hover:bg-gold-500/20 transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-white group-hover:text-gold-200 transition-colors">
                Справочники
              </h3>
              <p className="mt-1 text-xs text-noir-400">
                Типы камней и ключи параметров
              </p>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="group flex flex-col justify-between rounded-xl border border-noir-800 bg-noir-900/40 p-4 transition-all hover:border-gold-500/30 hover:bg-noir-900/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 text-gold-400 group-hover:bg-gold-500/20 transition-colors">
              <Settings className="h-4 w-4" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-white group-hover:text-gold-200 transition-colors">
                Контакты и мастер
              </h3>
              <p className="mt-1 text-xs text-noir-400">
                Телефон, Telegram, биография мастера
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Workflow Guidelines Accordion / Helper Card */}
      <div className="rounded-2xl border border-gold-500/15 bg-noir-900/60 p-6 backdrop-blur-md">
        <h3 className="font-serif text-base font-semibold text-gold-200">
          Регламент работы мастера с поступающими заявками
        </h3>
        <p className="mt-1 text-xs text-noir-400">
          Соблюдение канонического жизненного цикла заявки обеспечивает точность индивидуального заказа
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-noir-800 bg-noir-950/60 p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-300">
                1
              </span>
              <span className="text-xs font-semibold text-white uppercase">
                Новая заявка (NEW)
              </span>
            </div>
            <p className="mt-2 text-xs text-noir-400 leading-relaxed">
              Клиент отправил запрос из подборки. Проверьте перечень изделий и номер телефона в разделе «Заявки».
            </p>
          </div>

          <div className="rounded-xl border border-noir-800 bg-noir-950/60 p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-300">
                2
              </span>
              <span className="text-xs font-semibold text-white uppercase">
                Связь с клиентом (CONTACTED)
              </span>
            </div>
            <p className="mt-2 text-xs text-noir-400 leading-relaxed">
              Позвоните или напишите в Telegram. Согласуйте размер, пробу золота, чистоту камней и переведите статус.
            </p>
          </div>

          <div className="rounded-xl border border-noir-800 bg-noir-950/60 p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                3
              </span>
              <span className="text-xs font-semibold text-white uppercase">
                В работе / Завершено
              </span>
            </div>
            <p className="mt-2 text-xs text-noir-400 leading-relaxed">
              После согласования деталей переведите статус в IN_PROGRESS (в работе), а по готовности — в COMPLETED.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
