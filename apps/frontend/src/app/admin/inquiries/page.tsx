"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Inbox,
  Search,
  X,
  Phone,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Sparkles,
  Layers,
  Calendar,
  User,
  Filter,
  AlertCircle,
} from "lucide-react";
import { getAdminInquiries } from "@/lib/admin-api";
import { useAdminStore } from "@/store/admin-store";
import type { InquiryStatus, InquirySummaryDto } from "@/types/api";
import {
  STATUS_META,
  formatInquiryStatus,
  formatItemCount,
  formatDateTime,
} from "@/lib/inquiry-utils";

type FilterTab = "ALL" | InquiryStatus;

interface TabConfig {
  key: FilterTab;
  label: string;
  count?: number;
}

export default function AdminInquiriesPage() {
  const { newInquiriesCount, pollNewCount } = useAdminStore();

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const [inquiries, setInquiries] = useState<InquirySummaryDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch inquiries from API
  const loadInquiries = useCallback(
    async (targetPage: number, targetTab: FilterTab) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await getAdminInquiries(targetPage, pageSize, targetTab);
        setInquiries(res.items);
        setTotalCount(res.totalCount);
        setTotalPages(res.totalPages);
      } catch (error) {
        console.error("Ошибка загрузки списка заявок:", error);
        setErrorMessage(
          "Не удалось загрузить список заявок с сервера. Проверьте соединение с базой данных."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    loadInquiries(page, activeTab);
  }, [page, activeTab, loadInquiries]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadInquiries(page, activeTab), pollNewCount()]);
    setIsRefreshing(false);
  };

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setPage(0);
  };

  const handleCopyPhone = (id: number, phone: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(phone);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Client-side search filtering on current inquiries page
  const filteredInquiries = useMemo(() => {
    if (!searchQuery.trim()) return inquiries;
    const query = searchQuery.trim().toLowerCase();
    return inquiries.filter(
      (inq) =>
        inq.clientName.toLowerCase().includes(query) ||
        inq.clientPhone.toLowerCase().includes(query) ||
        String(inq.id).includes(query)
    );
  }, [inquiries, searchQuery]);

  const tabs: TabConfig[] = [
    { key: "ALL", label: "Все" },
    {
      key: "NEW",
      label: "Новые",
      count: newInquiriesCount > 0 ? newInquiriesCount : undefined,
    },
    { key: "CONTACTED", label: "Связались" },
    { key: "IN_PROGRESS", label: "В работе" },
    { key: "COMPLETED", label: "Завершены" },
    { key: "REJECTED", label: "Отклонены" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ========================================================
          PAGE HEADER
         ======================================================== */}
      <div className="flex flex-col gap-4 border-b border-noir-800/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-gold-400 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Управление заявками мастерской</span>
          </div>
          <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Заявки клиентов
          </h1>
          <p className="mt-1 text-xs text-noir-400 sm:text-sm">
            Обращения и сформированные подборки изделий от клиентов
          </p>
        </div>

        {/* Action button to refresh */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            aria-label="Обновить список заявок"
            className="flex min-h-[44px] items-center gap-2 rounded-xl border border-gold-500/30 bg-noir-900/80 px-4 py-2 text-xs font-medium text-gold-200 transition-all hover:border-gold-400 hover:bg-gold-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 text-gold-400 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span>{isRefreshing ? "Синхронизация..." : "Обновить"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          FILTER TABS & SEARCH BAR
         ======================================================== */}
      <div className="space-y-4">
        {/* Horizontal Status Filter Tabs */}
        <div className="flex overflow-x-auto pb-1 no-scrollbar border-b border-noir-800">
          <div className="flex gap-1.5 min-w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`relative flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                    isActive
                      ? "bg-gradient-to-r from-gold-500/20 to-gold-400/10 text-gold-200 border border-gold-500/30 shadow-sm"
                      : "text-noir-400 hover:bg-noir-900 hover:text-white border border-transparent"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                        isActive
                          ? "bg-gold-500 text-noir-950 font-extrabold shadow-gold"
                          : "bg-amber-500 text-noir-950 animate-pulse"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search input bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-noir-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени клиента, телефону или номеру заявки..."
              className="w-full min-h-[44px] rounded-xl border border-noir-800 bg-noir-900/60 pl-10 pr-10 text-xs sm:text-sm text-noir-100 placeholder-noir-500 transition-colors focus:border-gold-500/50 focus:bg-noir-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Очистить поиск"
                className="absolute right-1 top-1/2 -translate-y-1/2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-noir-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="text-xs text-noir-400 self-start sm:self-center">
              Найдено: <strong className="text-gold-300">{filteredInquiries.length}</strong>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          INQUIRIES LIST / TABLE
         ======================================================== */}
      {isLoading ? (
        /* Loading Skeleton */
        <div className="rounded-2xl border border-noir-800 bg-noir-900/40 p-4 sm:p-6 space-y-4 animate-pulse">
          <div className="h-6 w-48 rounded bg-noir-800" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-noir-800/80 bg-noir-950/60 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-16 rounded-lg bg-noir-800" />
                  <div className="space-y-2">
                    <div className="h-4 w-36 rounded bg-noir-800" />
                    <div className="h-3 w-28 rounded bg-noir-800/60" />
                  </div>
                </div>
                <div className="h-7 w-24 rounded-full bg-noir-800" />
              </div>
            ))}
          </div>
        </div>
      ) : errorMessage ? (
        /* Error State (DEF-16) */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/20 px-6 py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-900/30 text-red-400 shadow-inner">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h3 className="mt-4 font-serif text-lg font-semibold text-white">
            Ошибка синхронизации данных
          </h3>
          <p className="mt-1 max-w-md text-xs text-red-200/80 leading-relaxed">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => loadInquiries(page, activeTab)}
            className="mt-6 flex min-h-[44px] items-center gap-2 rounded-xl border border-gold-500/30 bg-gold-500/10 px-5 py-2.5 text-xs font-semibold text-gold-300 transition-colors hover:bg-gold-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Повторить попытку</span>
          </button>
        </div>
      ) : filteredInquiries.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-noir-800/80 bg-noir-900/30 px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-noir-800 bg-noir-900 text-noir-500 shadow-inner">
            <Inbox className="h-8 w-8 text-gold-500/50" />
          </div>
          <h3 className="mt-4 font-serif text-lg font-semibold text-white">
            {searchQuery
              ? "По запросу ничего не найдено"
              : activeTab === "ALL"
              ? "Список заявок пуст"
              : `Нет заявок в статусе «${formatInquiryStatus(activeTab)}»`}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-noir-400">
            {searchQuery
              ? "Попробуйте изменить поисковый запрос или сбросить фильтры поиска."
              : "Когда клиенты оформят запрос из «Моей подборки», они сразу отобразятся здесь."}
          </p>
          {(searchQuery || activeTab !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveTab("ALL");
              }}
              className="mt-6 flex min-h-[44px] items-center gap-2 rounded-xl border border-gold-500/30 bg-gold-500/10 px-5 py-2.5 text-xs font-semibold text-gold-300 transition-colors hover:bg-gold-500/20"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Показать все заявки</span>
            </button>
          )}
        </div>
      ) : (
        /* Table of Inquiries */
        <div className="overflow-hidden rounded-2xl border border-noir-800 bg-noir-900/60 backdrop-blur-md shadow-xl">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs text-noir-300">
              <thead className="border-b border-noir-800 bg-noir-950/80 text-[11px] font-semibold uppercase tracking-wider text-noir-400">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Заявка
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Клиент
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Телефон
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Состав подборки
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Статус
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Действие
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-noir-800/60">
                {filteredInquiries.map((inquiry) => {
                  const statusMeta =
                    STATUS_META[inquiry.status] || STATUS_META.NEW;
                  const isCopied = copiedId === inquiry.id;

                  return (
                    <tr
                      key={inquiry.id}
                      className="group transition-colors hover:bg-noir-800/40"
                    >
                      {/* ID & Date */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/inquiries/${inquiry.id}`}
                          className="font-serif font-bold text-sm text-gold-300 group-hover:text-gold-200 transition-colors focus:outline-none focus-visible:underline"
                        >
                          #{inquiry.id}
                        </Link>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-noir-400">
                          <Calendar className="h-3 w-3 text-noir-500" />
                          <span>{formatDateTime(inquiry.createdAt)}</span>
                        </div>
                      </td>

                      {/* Client Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-noir-800 text-gold-400">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-white text-xs sm:text-sm">
                            {inquiry.clientName}
                          </span>
                        </div>
                      </td>

                      {/* Phone Link & Copy Button */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${inquiry.clientPhone.replace(/\s+/g, "")}`}
                            className="flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 text-xs font-mono text-noir-200 hover:text-gold-300 hover:underline transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400"
                            title="Позвонить клиенту"
                          >
                            <Phone className="h-3.5 w-3.5 text-gold-400" />
                            <span>{inquiry.clientPhone}</span>
                          </a>

                          <button
                            type="button"
                            onClick={(e) =>
                              handleCopyPhone(inquiry.id, inquiry.clientPhone, e)
                            }
                            aria-label={`Скопировать номер ${inquiry.clientPhone}`}
                            className={`flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border transition-all ${
                              isCopied
                                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                                : "border-noir-800 text-noir-400 hover:border-gold-500/40 hover:text-white"
                            }`}
                            title={isCopied ? "Скопировано!" : "Скопировать номер"}
                          >
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Item Count */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-noir-300">
                          <Layers className="h-3.5 w-3.5 text-noir-500" />
                          <span>{formatItemCount(inquiry.itemCount || 1)}</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${statusMeta.badgeClass}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClass}`}
                          />
                          <span>{statusMeta.label}</span>
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/inquiries/${inquiry.id}`}
                          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-noir-700 bg-noir-800/80 px-3.5 py-2 text-xs font-medium text-noir-200 transition-all hover:border-gold-500/40 hover:bg-gold-500/10 hover:text-gold-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                        >
                          <span>Открыть</span>
                          <ChevronRight className="h-3.5 w-3.5 text-noir-400 group-hover:text-gold-300" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Responsive Card List View */}
          <div className="divide-y divide-noir-800/80 lg:hidden">
            {filteredInquiries.map((inquiry) => {
              const statusMeta = STATUS_META[inquiry.status] || STATUS_META.NEW;
              const isCopied = copiedId === inquiry.id;

              return (
                <div
                  key={inquiry.id}
                  className="p-4 space-y-3 transition-colors hover:bg-noir-800/30"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="font-serif font-bold text-base text-gold-300 hover:text-gold-200"
                    >
                      Заявка #{inquiry.id}
                    </Link>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${statusMeta.badgeClass}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClass}`}
                      />
                      <span>{statusMeta.label}</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-noir-300">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <User className="h-3.5 w-3.5 text-gold-400" />
                      <span>{inquiry.clientName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-noir-400">
                      <Calendar className="h-3.5 w-3.5 text-noir-500" />
                      <span>{formatDateTime(inquiry.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-noir-400">
                      <Layers className="h-3.5 w-3.5 text-noir-500" />
                      <span>{formatItemCount(inquiry.itemCount || 1)}</span>
                    </div>
                  </div>

                  {/* Mobile Actions: Call, Copy, Open */}
                  <div className="flex items-center gap-2 pt-1 border-t border-noir-800/60">
                    <a
                      href={`tel:${inquiry.clientPhone.replace(/\s+/g, "")}`}
                      className="flex-1 flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-noir-700 bg-noir-800/60 px-3 py-2 text-xs font-medium text-noir-200 hover:text-gold-300 hover:border-gold-500/40"
                    >
                      <Phone className="h-3.5 w-3.5 text-gold-400" />
                      <span className="truncate">{inquiry.clientPhone}</span>
                    </a>

                    <button
                      type="button"
                      onClick={(e) =>
                        handleCopyPhone(inquiry.id, inquiry.clientPhone, e)
                      }
                      aria-label="Скопировать номер телефона"
                      className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border transition-all ${
                        isCopied
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                          : "border-noir-700 bg-noir-800/60 text-noir-400 hover:text-white"
                      }`}
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>

                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="flex min-h-[44px] items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2 text-xs font-semibold text-noir-950 shadow-gold"
                    >
                      <span>Открыть</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          PAGINATION CONTROLS
         ======================================================== */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-noir-800/80 pt-4">
          <div className="text-xs text-noir-400">
            Страница <strong className="text-white">{page + 1}</strong> из{" "}
            <strong className="text-white">{totalPages}</strong> • Всего:{" "}
            <strong className="text-gold-300">{totalCount}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={page === 0}
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-noir-800 bg-noir-900/60 px-3.5 py-2 text-xs font-medium text-noir-300 hover:border-gold-500/40 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Назад</span>
            </button>

            {Array.from({ length: totalPages }, (_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPage(idx)}
                className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-xs font-medium transition-all ${
                  page === idx
                    ? "border border-gold-400/40 bg-gold-500/20 text-gold-200 font-bold shadow-sm"
                    : "border border-noir-800 bg-noir-900/40 text-noir-400 hover:text-white hover:border-noir-700"
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                setPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={page >= totalPages - 1}
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-noir-800 bg-noir-900/60 px-3.5 py-2 text-xs font-medium text-noir-300 hover:border-gold-500/40 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <span>Вперед</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
