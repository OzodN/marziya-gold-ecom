import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { InquiryModal } from "../InquiryModal";
import { useSelectionStore } from "@/store/selection-store";
import { submitInquiry } from "@/lib/api";
import type { ProductSummaryDto } from "@/types/api";

vi.mock("@/lib/api", () => ({
  submitInquiry: vi.fn(),
  validateBatch: vi.fn().mockResolvedValue([]),
}));

const mockProduct: ProductSummaryDto = {
  id: 1,
  sku: "MG-R-001",
  name: "Кольцо «Сияние Востока»",
  slug: "koltso-siyanie-vostoka",
  categoryName: "Кольца",
  mainImageUrl: "https://example.com/ring.jpg",
  isVisible: true,
};

describe("InquiryModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useSelectionStore.setState({
      items: [
        { product: mockProduct, quantity: 1, addedAt: Date.now(), isAvailable: true },
      ],
      isOpen: false,
      isInquiryModalOpen: true,
    });
  });

  it("does not render when isInquiryModalOpen is false", () => {
    useSelectionStore.setState({ isInquiryModalOpen: false });
    render(<InquiryModal />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("validates empty name and phone on form submit without calling API", async () => {
    render(<InquiryModal />);

    const submitBtn = screen.getByRole("button", { name: "Отправить запрос" });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText("Пожалуйста, укажите ваше имя")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Укажите контактный номер телефона")
    ).toBeInTheDocument();

    expect(submitInquiry).not.toHaveBeenCalled();
  });

  it("clears field error when user types into the field", async () => {
    render(<InquiryModal />);

    const submitBtn = screen.getByRole("button", { name: "Отправить запрос" });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText("Пожалуйста, укажите ваше имя")
    ).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Ваше имя/i);
    fireEvent.change(nameInput, { target: { value: "Азиз" } });

    expect(
      screen.queryByText("Пожалуйста, укажите ваше имя")
    ).not.toBeInTheDocument();
  });

  it("successfully submits inquiry and renders success screen", async () => {
    vi.mocked(submitInquiry).mockResolvedValueOnce({
      id: 9999,
      status: "NEW",
      message: "Заявка успешно принята",
    });

    render(<InquiryModal />);

    const nameInput = screen.getByLabelText(/Ваше имя/i);
    const phoneInput = screen.getByLabelText(/Телефон \/ Telegram/i);
    const commentInput = screen.getByLabelText(/Комментарий к изделиям/i);

    fireEvent.change(nameInput, { target: { value: "Азиз Каримов" } });
    fireEvent.change(phoneInput, { target: { value: "+998 90 123-45-67" } });
    fireEvent.change(commentInput, { target: { value: "Размер кольца 17.5" } });

    const submitBtn = screen.getByRole("button", { name: "Отправить запрос" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitInquiry).toHaveBeenCalledTimes(1);
    });

    expect(submitInquiry).toHaveBeenCalledWith({
      clientName: "Азиз Каримов",
      clientPhone: "+998 90 123-45-67",
      comment: "Размер кольца 17.5",
      items: [{ productId: 1, quantity: 1 }],
    });

    // Check success confirmation screen
    expect(
      await screen.findByText("Запрос успешно отправлен!")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ювелирный мастер свяжется с вами/i)
    ).toBeInTheDocument();

    // Verify selection items were cleared in store
    expect(useSelectionStore.getState().items).toHaveLength(0);

    // Return to catalog button closes modal
    const backBtn = screen.getByRole("button", { name: "Вернуться к каталогу" });
    fireEvent.click(backBtn);
    expect(useSelectionStore.getState().isInquiryModalOpen).toBe(false);
  });

  it("displays server error message when submission fails", async () => {
    vi.mocked(submitInquiry).mockRejectedValueOnce(
      new Error("Сетевая ошибка при отправке заявки")
    );

    render(<InquiryModal />);

    const nameInput = screen.getByLabelText(/Ваше имя/i);
    const phoneInput = screen.getByLabelText(/Телефон \/ Telegram/i);

    fireEvent.change(nameInput, { target: { value: "Азиз" } });
    fireEvent.change(phoneInput, { target: { value: "+998 90 123-45-67" } });

    const submitBtn = screen.getByRole("button", { name: "Отправить запрос" });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText("Сетевая ошибка при отправке заявки")
    ).toBeInTheDocument();
    expect(useSelectionStore.getState().items).toHaveLength(1);
  });
});
