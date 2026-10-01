import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { ProductCard } from "../ProductCard";
import { useSelectionStore } from "@/store/selection-store";
import type { ProductSummaryDto } from "@/types/api";

const mockProductWithImage: ProductSummaryDto = {
  id: 1,
  sku: "MG-R-001",
  name: "Кольцо «Сияние Востока»",
  slug: "koltso-siyanie-vostoka",
  categoryName: "Кольца",
  mainImageUrl: "https://example.com/ring.jpg",
  isVisible: true,
};

const mockProductWithoutImage: ProductSummaryDto = {
  id: 2,
  sku: "MG-E-002",
  name: "Серьги «Бухарская роза»",
  slug: "sergi-buharskaya-roza",
  categoryName: "Серьги",
  isVisible: true,
};

describe("ProductCard", () => {
  beforeEach(() => {
    localStorage.clear();
    useSelectionStore.setState({
      items: [],
      isOpen: false,
      isInquiryModalOpen: false,
    });
  });

  it("renders product name, category, and image when image URL is provided", () => {
    render(<ProductCard product={mockProductWithImage} />);

    expect(screen.getByText("Кольцо «Сияние Востока»")).toBeInTheDocument();
    expect(screen.getByText("Кольца")).toBeInTheDocument();
    expect(screen.getByText("MG-R-001")).toBeInTheDocument();

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/ring.jpg");
    expect(img).toHaveAttribute("alt", "Кольцо «Сияние Востока» — фото 1");
  });

  it("renders fallback placeholder when no image is provided", () => {
    render(<ProductCard product={mockProductWithoutImage} />);

    expect(screen.getByText("Серьги «Бухарская роза»")).toBeInTheDocument();
    expect(screen.getByText("Серьги")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("adds item to selection store and updates button label when clicked", () => {
    render(<ProductCard product={mockProductWithImage} />);

    const addToSelectionBtn = screen.getByRole("button", {
      name: /В подборку/i,
    });
    expect(addToSelectionBtn).toBeInTheDocument();

    fireEvent.click(addToSelectionBtn);

    // Verify item is added to zustand store
    const storeItems = useSelectionStore.getState().items;
    expect(storeItems).toHaveLength(1);
    expect(storeItems[0].product.id).toBe(1);
    expect(storeItems[0].quantity).toBe(1);

    // Immediate feedback state shows "Добавлено"
    expect(screen.getByText("Добавлено")).toBeInTheDocument();
    expect(screen.getByText("В подборке")).toBeInTheDocument();
  });

  it("renders characteristics preview if specs prop is passed", () => {
    const specs = [
      { label: "Металл", value: "Желтое золото 585°" },
      { label: "Вставка", value: "Бриллиант 0.50 ct" },
    ];

    render(<ProductCard product={mockProductWithImage} specs={specs} />);

    expect(screen.getByText(/Желтое золото 585°/i)).toBeInTheDocument();
    expect(screen.getByText(/Бриллиант 0.50 ct/i)).toBeInTheDocument();
  });
});
