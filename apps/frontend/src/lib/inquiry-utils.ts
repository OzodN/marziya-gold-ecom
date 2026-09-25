import type { InquiryStatus } from "@/types/api";

export interface StatusMeta {
  label: string;
  badgeClass: string;
  dotClass: string;
  description: string;
}

export const STATUS_META: Record<InquiryStatus, StatusMeta> = {
  NEW: {
    label: "Новая",
    badgeClass:
      "bg-gold-500/20 text-gold-300 border-gold-400/40 shadow-[0_0_12px_rgba(204,169,108,0.25)] animate-pulse",
    dotClass: "bg-gold-400 shadow-[0_0_8px_rgba(204,169,108,0.8)]",
    description: "Новая заявка, ожидает первого контакта мастера",
  },
  CONTACTED: {
    label: "Связались",
    badgeClass: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    dotClass: "bg-blue-400",
    description: "Мастер связался с клиентом для уточнения деталей",
  },
  IN_PROGRESS: {
    label: "В работе",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    dotClass: "bg-amber-400",
    description: "Изделия запущены в индивидуальное производство",
  },
  COMPLETED: {
    label: "Завершена",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    dotClass: "bg-emerald-400",
    description: "Изделия изготовлены и переданы клиенту",
  },
  REJECTED: {
    label: "Отклонена",
    badgeClass: "bg-noir-800 text-noir-400 border-noir-700",
    dotClass: "bg-noir-500",
    description: "Отказ клиента или невозможность выполнения",
  },
};

export function formatInquiryStatus(status: InquiryStatus | string): string {
  if (status in STATUS_META) {
    return STATUS_META[status as InquiryStatus].label;
  }
  return status;
}

export function formatItemCount(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) {
    return `${count} изделий`;
  }
  if (mod10 === 1) {
    return `${count} изделие`;
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return `${count} изделия`;
  }
  return `${count} изделий`;
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function formatFullDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}
