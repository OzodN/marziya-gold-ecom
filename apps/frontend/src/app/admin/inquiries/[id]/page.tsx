"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Copy,
  Check,
  MessageSquare,
  ShieldCheck,
  Save,
  Clock,
  History,
  AlertTriangle,
  CheckCircle2,
  Gem,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { getAdminInquiryById, updateAdminInquiryStatus } from "@/lib/admin-api";
import { useAdminStore } from "@/store/admin-store";
import type {
  InquiryDetailDto,
  InquiryStatus,
  ProductSnapshotDto,
} from "@/types/api";
import {
  STATUS_META,
  formatInquiryStatus,
  formatFullDate,
  formatDateTime,
} from "@/lib/inquiry-utils";

export default function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const numericId = Number(id);

  const { pollNewCount } = useAdminStore();

  const [inquiry, setInquiry] = useState<InquiryDetailDto | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Load inquiry details
  const fetchInquiry = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAdminInquiryById(numericId);
      setInquiry(data);
      setSelectedStatus(data.status);
    } catch (err: unknown) {
      console.error("Ошибка загрузки данных заявки:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : `Не удалось загрузить данные по заявке #${id}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, numericId]);

  useEffect(() => {
    fetchInquiry();
  }, [fetchInquiry]);

  // Unsaved changes detection
  const hasChanges =
    inquiry !== null &&
    selectedStatus !== null &&
    selectedStatus !== inquiry.status;

  // Browser prompt on tab close if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  // Copy phone number helper
  const handleCopyPhone = () => {
    if (!inquiry?.clientPhone) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(inquiry.clientPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  // Save status change
  const handleSaveStatus = async () => {
    if (!inquiry || !selectedStatus || !hasChanges) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccessMessage(null);

    try {
      const updated = await updateAdminInquiryStatus(numericId, selectedStatus);
      setInquiry(updated);
      setSelectedStatus(updated.status);
      setSaveSuccessMessage(
        `Статус заявки успешно изменен на «${formatInquiryStatus(updated.status)}»`
      );
      // Immediately refresh badge in layout
      pollNewCount();
    } catch (err: unknown) {
      console.error("Ошибка сохранения статуса:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Не удалось сохранить статус заявки"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 animate-pulse">
        <div className="h-6 w-40 rounded bg-noir-800" />
        <div className="h-16 w-full rounded-2xl bg-noir-900/60 border border-noir-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-noir-900/60 border border-noir-800" />
          <div className="h-64 rounded-2xl bg-noir-900/60 border border-noir-800" />
        </div>
        <div className="h-96 rounded-2xl bg-noir-900/60 border border-noir-800" />
      </div>
    );
  }

  // Error state
  if (errorMessage && !inquiry) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/20 text-red-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 font-serif text-xl font-bold text-white">
          Заявка не найдена
        </h2>
        <p className="mt-2 text-xs text-noir-400 max-w-md mx-auto">
          {errorMessage}
        </p>
        <Link
          href="/admin/inquiries"
          className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-2.5 text-xs font-semibold text-noir-950 shadow-gold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Вернуться к списку заявок</span>
        </Link>
      </div>
    );
  }

  if (!inquiry) return null;

  const currentMeta = STATUS_META[inquiry.status] || STATUS_META.NEW;
  const historyList = inquiry.statusHistory || inquiry.history || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* ========================================================
          TOP NAVIGATION & HEADER
         ======================================================== */}
      <div>
        <Link
          href="/admin/inquiries"
          className="group inline-flex min-h-[44px] items-center gap-2 text-xs font-medium text-noir-400 hover:text-gold-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-lg pr-3"
        >
          <ArrowLeft className="h-4 w-4 text-noir-500 group-hover:text-gold-400 transition-colors" />
          <span>← Назад к списку заявок</span>
        </Link>

        <div className="mt-3 flex flex-col gap-4 border-b border-noir-800/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Заявка #{inquiry.id}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${currentMeta.badgeClass}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${currentMeta.dotClass}`} />
                <span>{currentMeta.label}</span>
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-2 text-xs text-noir-400">
              <Calendar className="h-3.5 w-3.5 text-noir-500" />
              <span>Поступила: {formatFullDate(inquiry.createdAt)}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-noir-500 font-semibold block">
              Позиций в подборке
            </span>
            <span className="font-serif text-lg font-bold text-gold-300">
              {inquiry.items.reduce((sum, it) => sum + (it.quantity || 1), 0)} шт.
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          FEEDBACK ALERTS
         ======================================================== */}
      {saveSuccessMessage && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMessage(null)}
            aria-label="Закрыть уведомление об успехе"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-emerald-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <span className="text-base font-bold">✕</span>
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            aria-label="Закрыть сообщение об ошибке"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-red-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <span className="text-base font-bold">✕</span>
          </button>
        </div>
      )}

      {/* ========================================================
          CLIENT PROFILE & STATUS MANAGEMENT GRID
         ======================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card 1: Client Profile */}
        <div className="rounded-2xl border border-noir-800 bg-noir-900/60 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-noir-800/80 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-gold-400 uppercase">
                <User className="h-4 w-4" />
                <span>Профиль клиента</span>
              </div>
              <span className="rounded bg-noir-800 px-2 py-0.5 text-[10px] text-noir-400">
                Заявитель
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-noir-500 block">
                  Имя клиента
                </span>
                <span className="font-serif text-lg font-bold text-white">
                  {inquiry.clientName}
                </span>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-noir-500 block">
                  Номер телефона
                </span>
                <span className="font-mono text-sm text-gold-300">
                  {inquiry.clientPhone}
                </span>
              </div>

              {/* Action buttons: Call & Copy */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <a
                  href={`tel:${inquiry.clientPhone.replace(/\s+/g, "")}`}
                  className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-2.5 text-xs font-semibold text-gold-200 hover:bg-gold-500/20 hover:border-gold-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                  <Phone className="h-4 w-4 text-gold-400" />
                  <span>Позвонить</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyPhone}
                  aria-label="Скопировать номер телефона"
                  className={`flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all ${
                    copiedPhone
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                      : "border-noir-700 bg-noir-800/80 text-noir-300 hover:text-white hover:border-noir-600"
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400`}
                >
                  {copiedPhone ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-noir-400" />
                      <span>Скопировать</span>
                    </>
                  )}
                </button>
              </div>

              {/* Client comment card */}
              <div className="pt-2">
                <span className="text-[11px] uppercase tracking-wider text-noir-500 block mb-1.5">
                  Комментарий к запросу
                </span>
                {inquiry.comment ? (
                  <div className="rounded-xl border border-noir-800 bg-noir-950/80 p-3.5 text-xs text-noir-200 leading-relaxed italic flex gap-2.5">
                    <MessageSquare className="h-4 w-4 text-gold-400 flex-shrink-0 mt-0.5" />
                    <span>«{inquiry.comment}»</span>
                  </div>
                ) : (
                  <div className="rounded-xl border border-noir-800/60 bg-noir-950/40 p-3 text-xs text-noir-500 italic">
                    Клиент не оставил дополнительного комментария
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Manual Status Management */}
        <div className="rounded-2xl border border-noir-800 bg-noir-900/60 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-noir-800/80 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-gold-400 uppercase">
                <ShieldCheck className="h-4 w-4" />
                <span>Управление статусом</span>
              </div>
              <span className="text-[11px] text-noir-400">
                Ручное сохранение
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="status-select"
                  className="text-[11px] uppercase tracking-wider text-noir-400 block mb-1.5 font-semibold"
                >
                  Выбрать статус заявки
                </label>
                <div className="relative">
                  <select
                    id="status-select"
                    value={selectedStatus || inquiry.status}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as InquiryStatus)
                    }
                    className="w-full min-h-[44px] rounded-xl border border-noir-700 bg-noir-950 px-4 py-2.5 text-xs sm:text-sm text-white focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer"
                  >
                    <option value="NEW">Новая (NEW) — Ожидает контакта</option>
                    <option value="CONTACTED">
                      Связались (CONTACTED) — Детали согласованы
                    </option>
                    <option value="IN_PROGRESS">
                      В работе (IN_PROGRESS) — Запущено в производство
                    </option>
                    <option value="COMPLETED">
                      Завершена (COMPLETED) — Изделие передано
                    </option>
                    <option value="REJECTED">
                      Отклонена (REJECTED) — Отказ клиента
                    </option>
                  </select>
                </div>
              </div>

              {/* Status explanation */}
              {selectedStatus && (
                <div className="rounded-xl border border-noir-800 bg-noir-950/60 p-3 text-xs text-noir-300 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-gold-400 mt-0.5 flex-shrink-0" />
                  <span>{STATUS_META[selectedStatus]?.description}</span>
                </div>
              )}

              {/* Warning when status is changed but unsaved */}
              {hasChanges && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-start gap-2 animate-fadeIn">
                  <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>
                    Статус изменен на{" "}
                    <strong>«{formatInquiryStatus(selectedStatus!)}»</strong>.
                    Нажмите «Сохранить изменения» для фиксации в истории аудита.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Explicit Save Button */}
          <div className="mt-6 pt-4 border-t border-noir-800/80">
            <button
              type="button"
              onClick={handleSaveStatus}
              disabled={!hasChanges || isSaving}
              className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                hasChanges && !isSaving
                  ? "bg-gradient-to-r from-gold-500 to-gold-400 text-noir-950 hover:from-gold-400 hover:to-gold-300 shadow-gold cursor-pointer"
                  : "bg-noir-800 text-noir-500 border border-noir-700/60 cursor-not-allowed opacity-60"
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400`}
            >
              <Save
                className={`h-4 w-4 ${isSaving ? "animate-spin" : ""}`}
              />
              <span>
                {isSaving
                  ? "Сохранение статуса..."
                  : hasChanges
                  ? "Сохранить изменения"
                  : "Изменений нет"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          HISTORICAL SNAPSHOT: ORDERED ITEMS
         ======================================================== */}
      <div className="rounded-2xl border border-gold-500/20 bg-noir-900/60 p-6 backdrop-blur-md shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-noir-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-gold-400 uppercase">
              <Sparkles className="h-4 w-4" />
              <span>Исторический слепок изделий (Snapshot)</span>
            </div>
            <h2 className="mt-1 font-serif text-xl font-bold text-white">
              Запрошенные изделия из подборки
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gold-400/90 rounded-lg border border-gold-500/20 bg-gold-500/5 px-2.5 py-1">
            <ShieldCheck className="h-3.5 w-3.5 text-gold-400" />
            <span>Неизменяемый слепок при отправке</span>
          </div>
        </div>

        {/* List of snapshot items */}
        <div className="space-y-6">
          {inquiry.items.map((item, index) => {
            const snapshot: ProductSnapshotDto =
              item.snapshot || item.productSnapshot || ({} as ProductSnapshotDto);
            const chars = snapshot.characteristics || [];
            const stones = snapshot.stones || [];

            return (
              <div
                key={item.id || index}
                className="overflow-hidden rounded-xl border border-noir-800 bg-noir-950/70 p-4 sm:p-6 transition-all hover:border-gold-500/30"
              >
                <div className="flex flex-col gap-6 md:flex-row">
                  {/* Photo thumbnail */}
                  <div className="relative h-44 w-full md:w-44 flex-shrink-0 overflow-hidden rounded-xl border border-noir-800 bg-noir-900">
                    {snapshot.mainImageUrl ? (
                      <Image
                        src={snapshot.mainImageUrl}
                        alt={snapshot.name || "Изделие"}
                        fill
                        sizes="(max-width: 768px) 100vw, 176px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-noir-600">
                        <Gem className="h-10 w-10 text-gold-500/30" />
                      </div>
                    )}
                  </div>

                  {/* Item Description & Snapshot Specs */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md border border-gold-500/30 bg-gold-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-gold-300">
                            {snapshot.sku || `ID: ${item.productId || item.id}`}
                          </span>
                          <span className="text-xs text-noir-400">
                            Количество:{" "}
                            <strong className="text-white font-mono">
                              {item.quantity || 1} шт.
                            </strong>
                          </span>
                        </div>
                        <h3 className="mt-1.5 font-serif text-lg font-bold text-white">
                          {snapshot.name || "Ювелирное изделие"}
                        </h3>
                      </div>
                    </div>

                    {/* Dynamic characteristics table/chips */}
                    {chars.length > 0 && (
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-noir-500 font-semibold block mb-2">
                          Характеристики изделия
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {chars.map((char, cIdx) => (
                            <div
                              key={cIdx}
                              className="rounded-lg border border-noir-800 bg-noir-900/60 px-3 py-1.5 text-xs"
                            >
                              <span className="text-noir-500 block text-[10px]">
                                {char.name}
                              </span>
                              <span className="text-noir-100 font-medium">
                                {char.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stones information from snapshot */}
                    {stones.length > 0 && (
                      <div className="border-t border-noir-800/80 pt-3">
                        <span className="text-[11px] uppercase tracking-wider text-noir-500 font-semibold block mb-2">
                          Вставки и драгоценные камни
                        </span>
                        <div className="space-y-2">
                          {stones.map((stone, sIdx) => (
                            <div
                              key={sIdx}
                              className="rounded-xl border border-noir-800/80 bg-noir-900/40 p-3 text-xs"
                            >
                              <div className="flex items-center gap-1.5 font-semibold text-gold-300">
                                <Gem className="h-3.5 w-3.5 text-gold-400" />
                                <span>{stone.stoneTypeName || "Камень"}</span>
                              </div>
                              {stone.characteristics &&
                                stone.characteristics.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {stone.characteristics.map(
                                      (sChar, scIdx) => (
                                        <span
                                          key={scIdx}
                                          className="rounded-md border border-noir-800 bg-noir-950/60 px-2 py-0.5 text-[11px] text-noir-300"
                                        >
                                          <span className="text-noir-500">
                                            {sChar.name}:{" "}
                                          </span>
                                          <strong>{sChar.value}</strong>
                                        </span>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          STATUS AUDIT TRAIL / TIMELINE
         ======================================================== */}
      <div className="rounded-2xl border border-noir-800 bg-noir-900/60 p-6 backdrop-blur-md shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-noir-800/80 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-gold-400 uppercase">
            <History className="h-4 w-4" />
            <span>Журнал аудита статусов</span>
          </div>
          <span className="text-xs text-noir-400">
            Записей: {historyList.length}
          </span>
        </div>

        {historyList.length === 0 ? (
          <p className="text-xs text-noir-400 italic">
            История изменений статуса пока отсутствует.
          </p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-noir-800">
            {historyList.map((entry, idx) => {
              const newMeta =
                STATUS_META[entry.newStatus as InquiryStatus] ||
                STATUS_META.NEW;
              const isFirst = idx === 0;

              return (
                <div key={entry.id || idx} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-[19px] top-1.5 h-3 w-3 rounded-full border-2 border-noir-950 ${newMeta.dotClass}`}
                  />

                  <div className="rounded-xl border border-noir-800/80 bg-noir-950/60 p-4 transition-all group-hover:border-gold-500/20">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2">
                        {entry.oldStatus ? (
                          <div className="flex items-center gap-2 text-xs font-medium text-noir-200">
                            <span className="line-through text-noir-500">
                              {formatInquiryStatus(entry.oldStatus)}
                            </span>
                            <span className="text-gold-400">→</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold border ${newMeta.badgeClass}`}
                            >
                              {formatInquiryStatus(entry.newStatus)}
                            </span>
                          </div>
                        ) : (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${newMeta.badgeClass}`}
                          >
                            Создана ({formatInquiryStatus(entry.newStatus)})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-noir-400">
                        <Clock className="h-3 w-3 text-noir-500" />
                        <span>{formatDateTime(entry.changedAt)}</span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-noir-400">
                      Изменил:{" "}
                      <strong className="text-noir-200">
                        {entry.changedBy || "Мастер"}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
