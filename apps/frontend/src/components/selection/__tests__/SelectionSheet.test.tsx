import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { SelectionSheet } from "../SelectionSheet";
import { useSelectionStore } from "@/store/selection-store";
import type { ProductSummaryDto } from "@/types/api";

vi.mock("@/lib/api", () => ({
  validateBatch: vi.fn().mockResolvedValue([]),
}));

const mockProduct1: ProductSummaryDto = {
  id: 1,
  sku: "MG-R-001",
  name: "Кольцо «Сияние Востока»",
  slug: "koltso-siyanie-vostoka",
  categoryName: "Кольца",
  mainImageUrl: "https://example.com/ring.jpg",
  isVisible: true,
};

const mockProduct2: ProductSummaryDto = {
  id: 2,
  sku: "MG-E-002",
  name: "Серьги «Бухарская роза»",
  slug: "sergi-buharskaya-roza",
  categoryName: "Серьги",
  mainImageUrl: "https://example.com/earrings.jpg",
  isVisible: true,
};

describe("SelectionSheet", () => {
  beforeEach(() => {
    localStorage.clear();
    useSelectionStore.setState({
      items: [],
      isOpen: false,
      isInquiryModalOpen: false,
    });
  });

  it("does not render when isOpen is false", () => {
    render(<SelectionSheet />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders empty state when selection has no items", () => {
    useSelectionStore.setState({ isOpen: true, items: [] });
    render(<SelectionSheet />);

    expect(screen.getByRole("dialog", { name: "Моя подборка" })).toBeInTheDocument();
    expect(screen.getByText("Ваша подборка пуста")).toBeInTheDocument();
    expect(
      screen.getByText(/Добавьте понравившиеся авторские изделия/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Перейти к изделиям" })).toBeInTheDocument();
    expect(screen.queryByText("Отправить запрос")).not.toBeInTheDocument();
  });

  it("renders items list, handles quantity increment/decrement, and checkout button action", () => {
    useSelectionStore.setState({
      isOpen: true,
      items: [
        { product: mockProduct1, quantity: 1, addedAt: Date.now(), isAvailable: true },
        { product: mockProduct2, quantity: 2, addedAt: Date.now(), isAvailable: true },
      ],
    });

    render(<SelectionSheet />);

    // Check item rendering
    expect(screen.getByText("Кольцо «Сияние Востока»")).toBeInTheDocument();
    expect(screen.getByText("Серьги «Бухарская роза»")).toBeInTheDocument();
    expect(screen.getByText("MG-R-001")).toBeInTheDocument();
    expect(screen.getByText("MG-E-002")).toBeInTheDocument();

    // Check total count badge
    expect(screen.getByText("3 шт.")).toBeInTheDocument();

    // Quantity increment
    const plusButtons = screen.getAllByRole("button", { name: "Увеличить количество" });
    fireEvent.click(plusButtons[0]);
    expect(useSelectionStore.getState().items[0].quantity).toBe(2);

    // Quantity decrement
    const minusButtons = screen.getAllByRole("button", { name: "Уменьшить количество" });
    fireEvent.click(minusButtons[0]);
    expect(useSelectionStore.getState().items[0].quantity).toBe(1);

    // Checkout button click opens InquiryModal and closes SelectionSheet
    const checkoutButton = screen.getByRole("button", { name: /Отправить запрос/i });
    expect(checkoutButton).toBeInTheDocument();

    fireEvent.click(checkoutButton);

    expect(useSelectionStore.getState().isInquiryModalOpen).toBe(true);
    expect(useSelectionStore.getState().isOpen).toBe(false);
  });

  it("removes item when remove button is clicked", () => {
    useSelectionStore.setState({
      isOpen: true,
      items: [
        { product: mockProduct1, quantity: 1, addedAt: Date.now(), isAvailable: true },
      ],
    });

    render(<SelectionSheet />);

    const removeBtn = screen.getByRole("button", {
      name: `Удалить ${mockProduct1.name} из подборки`,
    });
    fireEvent.click(removeBtn);

    expect(useSelectionStore.getState().items).toHaveLength(0);
  });

  it("clears all items when clear button is clicked", () => {
    useSelectionStore.setState({
      isOpen: true,
      items: [
        { product: mockProduct1, quantity: 1, addedAt: Date.now(), isAvailable: true },
        { product: mockProduct2, quantity: 2, addedAt: Date.now(), isAvailable: true },
      ],
    });

    render(<SelectionSheet />);

    const clearBtn = screen.getByRole("button", { name: "Очистить подборку" });
    fireEvent.click(clearBtn);

    expect(useSelectionStore.getState().items).toHaveLength(0);
  });
});
