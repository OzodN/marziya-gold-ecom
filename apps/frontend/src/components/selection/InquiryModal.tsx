"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Sparkles, Send, Loader2 } from "lucide-react";
import { useSelectionStore } from "@/store/selection-store";
import { submitInquiry } from "@/lib/api";
import type { InquiryCreateRequestDto } from "@/types/api";

export const InquiryModal: React.FC = () => {
  const {
    isInquiryModalOpen,
    closeInquiryModal,
    items,
    clearSelection,
  } = useSelectionStore();

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    general?: string;
  }>({});

  const handleClose = () => {
    setSubmitSuccess(false);
    setFieldErrors({});
    closeInquiryModal();
  };

  // Закрытие модального окна по клавише Escape
  useEffect(() => {
    if (!isInquiryModalOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isInquiryModalOpen]);

  if (!isInquiryModalOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { name?: string; phone?: string; general?: string } = {};

    if (!clientName.trim()) {
      errors.name = "Пожалуйста, укажите ваше имя";
    }

    if (!clientPhone.trim()) {
      errors.phone = "Укажите контактный номер телефона";
    }

    if (items.length === 0) {
      errors.general =
        "В подборке нет изделий. Добавьте изделия перед отправкой запроса.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    const payload: InquiryCreateRequestDto = {
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      comment: comment.trim() || undefined,
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    try {
      await submitInquiry(payload);
      setSubmitSuccess(true);
      clearSelection();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Не удалось отправить запрос.";
      setFieldErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border border-gold-500/30 bg-noir-900 p-6 sm:p-8 shadow-2xl"
      >
        {/* Close Button - min-h-[44px] min-w-[44px] */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-noir-400 hover:bg-noir-800 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>

        {submitSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/20 text-gold-400">
              <CheckCircle2 className="h-8 w-8 text-gold-400" />
            </div>
            <h3
              id="inquiry-modal-title"
              className="font-serif text-2xl font-semibold text-gold-200"
            >
              Запрос успешно отправлен!
            </h3>
            <p className="text-sm text-noir-300 leading-relaxed max-w-sm mx-auto">
              Ювелирный мастер свяжется с вами по указанному телефону или в Telegram в ближайшее время для обсуждения деталей, размеров и изготовления.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="w-full min-h-[44px] rounded-xl bg-gold-500 py-3 px-4 text-sm font-semibold text-noir-950 hover:bg-gold-400 transition-colors shadow-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                Вернуться к каталогу
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 space-y-2 pr-8">
              <div className="flex items-center gap-2 text-gold-400">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Индивидуальный заказ
                </span>
              </div>
              <h2
                id="inquiry-modal-title"
                className="font-serif text-2xl font-semibold text-white"
              >
                Отправить запрос мастеру
              </h2>
              <p className="text-xs text-noir-400">
                В запросе передается ваша подборка ({items.reduce((s, i) => s + i.quantity, 0)} шт.). Мастер свяжется с вами для согласования деталей.
              </p>
            </div>

            {fieldErrors.general && (
              <div className="mb-4 rounded-lg bg-red-950/50 border border-red-500/30 p-3 text-xs text-red-300">
                {fieldErrors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="clientName"
                  className="block text-xs font-medium uppercase tracking-wider text-noir-300 mb-1.5"
                >
                  Ваше имя *
                </label>
                <input
                  id="clientName"
                  type="text"
                  placeholder="Азиз"
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (fieldErrors.name) {
                      setFieldErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  className={`w-full rounded-xl border bg-noir-800/80 px-4 py-2.5 text-sm text-white placeholder-noir-500 transition-colors focus:outline-none focus:ring-1 ${
                    fieldErrors.name
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-noir-700 focus:border-gold-400 focus:ring-gold-400"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="clientPhone"
                  className="block text-xs font-medium uppercase tracking-wider text-noir-300 mb-1.5"
                >
                  Телефон / Telegram *
                </label>
                <input
                  id="clientPhone"
                  type="tel"
                  placeholder="+998 (90) 123-45-67"
                  value={clientPhone}
                  onChange={(e) => {
                    setClientPhone(e.target.value);
                    if (fieldErrors.phone) {
                      setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                    }
                  }}
                  className={`w-full rounded-xl border bg-noir-800/80 px-4 py-2.5 text-sm text-white placeholder-noir-500 transition-colors focus:outline-none focus:ring-1 ${
                    fieldErrors.phone
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-noir-700 focus:border-gold-400 focus:ring-gold-400"
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.phone}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="comment"
                  className="block text-xs font-medium uppercase tracking-wider text-noir-300 mb-1.5"
                >
                  Комментарий к изделиям (необязательно)
                </label>
                <textarea
                  id="comment"
                  rows={3}
                  placeholder="Желаемый размер кольца, индивидуальная гравировка или пожелания к камням..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-noir-700 bg-noir-800/80 px-4 py-2.5 text-sm text-white placeholder-noir-500 transition-colors focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 py-3.5 px-4 text-sm font-semibold text-noir-950 hover:from-gold-400 hover:to-gold-300 transition-all shadow-gold disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Отправка запроса...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Отправить запрос</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
