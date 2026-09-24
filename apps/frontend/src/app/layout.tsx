import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SelectionSheet } from "@/components/selection/SelectionSheet";
import { InquiryModal } from "@/components/selection/InquiryModal";

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marziya Gold | Авторские ювелирные изделия ручной работы",
  description:
    "Эксклюзивный каталог золотых украшений с драгоценными камнями. Ручная работа мастера, создание индивидуальных ювелирных шедевров под заказ.",
  keywords: [
    "ювелирные изделия",
    "золото",
    "бриллианты",
    "ручная работа",
    "авторские украшения",
    "Marziya Gold",
    "Ташкент",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-noir-950 font-sans text-noir-100 antialiased selection:bg-gold-500 selection:text-noir-950">
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>

        {/* Global Drawers & Modals for Selection */}
        <SelectionSheet />
        <InquiryModal />
      </body>
    </html>
  );
}
