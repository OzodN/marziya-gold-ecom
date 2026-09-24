import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";
import type { ProductSummaryDto, ProductAvailabilityDto } from "@/types/api";

export interface SelectionItem {
  product: ProductSummaryDto;
  quantity: number;
  addedAt: number;
  isAvailable?: boolean;
}

export interface SelectionStore {
  /**
   * Список изделий в подборке клиента
   */
  items: SelectionItem[];

  /**
   * Состояние открытия шторки/модалки "Моя подборка"
   */
  isOpen: boolean;

  /**
   * Состояние открытия модального окна "Отправить запрос"
   */
  isInquiryModalOpen: boolean;

  // Управление отображением
  openSelection: () => void;
  closeSelection: () => void;
  toggleSelection: () => void;

  openInquiryModal: () => void;
  closeInquiryModal: () => void;

  // Операции с подборкой
  addToSelection: (product: ProductSummaryDto, quantity?: number) => void;
  removeFromSelection: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearSelection: () => void;
  hasItem: (productId: number) => boolean;

  // Тихая валидация доступности изделий
  markBatchAvailability: (availabilities: ProductAvailabilityDto[]) => void;

  // Селекторы/вспомогательные геттеры
  getTotalCount: () => number;
}

export const useSelectionStore = create<SelectionStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isInquiryModalOpen: false,

      openSelection: () => set({ isOpen: true }),
      closeSelection: () => set({ isOpen: false }),
      toggleSelection: () => set((state) => ({ isOpen: !state.isOpen })),

      openInquiryModal: () => set({ isInquiryModalOpen: true, isOpen: false }),
      closeInquiryModal: () => set({ isInquiryModalOpen: false }),

      addToSelection: (product: ProductSummaryDto, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity,
            };
            return { items: updated };
          }

          return {
            items: [
              ...state.items,
              {
                product,
                quantity: Math.max(1, quantity),
                addedAt: Date.now(),
                isAvailable: true,
              },
            ],
          };
        });
      },

      removeFromSelection: (productId: number) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromSelection(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearSelection: () => {
        set({ items: [] });
      },

      hasItem: (productId: number) => {
        return get().items.some((item) => item.product.id === productId);
      },

      markBatchAvailability: (availabilities: ProductAvailabilityDto[]) => {
        const availabilityMap = new Map(
          availabilities.map((a) => [a.productId, a.isAvailable])
        );

        set((state) => ({
          items: state.items.map((item) => {
            const isAvail = availabilityMap.get(item.product.id);
            if (isAvail !== undefined) {
              return { ...item, isAvailable: isAvail };
            }
            return item;
          }),
        }));
      },

      getTotalCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "marziya-selection-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

/**
 * Хук для безопасного получения количества изделий в подборке на клиенте (без SSR-mismatch)
 */
export function useSelectionCount(): number {
  const [mounted, setMounted] = useState(false);
  const count = useSelectionStore((s) => s.getTotalCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? count : 0;
}

/**
 * Хук для проверки готовности гидратации состояния из localStorage
 */
export function useIsSelectionHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
