"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SelectionSheet } from "@/components/selection/SelectionSheet";
import { InquiryModal } from "@/components/selection/InquiryModal";

interface StorefrontShellProps {
  children: React.ReactNode;
}

/**
 * Shell component that encapsulates storefront navigation and drawers.
 * On admin routes (/admin/*), it renders children directly without storefront chrome.
 */
export function StorefrontShell({ children }: StorefrontShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>

      {/* Global Drawers & Modals for Storefront Selection */}
      <SelectionSheet />
      <InquiryModal />
    </>
  );
}
