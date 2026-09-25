"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Inbox,
  Gem,
  FolderTree,
  SlidersHorizontal,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  Sparkles,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAdminStore } from "@/store/admin-store";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoadingAuth,
    newInquiriesCount,
    checkAuth,
    logout,
    pollNewCount,
  } = useAdminStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  // Check authentication on initial load or navigation
  useEffect(() => {
    if (isLoginPage) return;

    checkAuth().then((adminUser) => {
      if (!adminUser) {
        router.replace("/admin/login");
      }
    });
  }, [checkAuth, isLoginPage, router]);

  // 30-second background polling of GET /api/v1/admin/inquiries/new-count
  useEffect(() => {
    if (isLoginPage || !isAuthenticated) return;

    // Immediate first poll
    pollNewCount();

    const intervalId = setInterval(() => {
      pollNewCount();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, isLoginPage, pollNewCount]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // If on login route, bypass admin shell completely
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Content-aware loading skeleton while checking master auth
  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen bg-noir-950 text-noir-100">
        {/* Sidebar Skeleton */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-noir-800/80 bg-noir-900/60 p-6 space-y-8 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-noir-800" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-28 rounded bg-noir-800" />
              <div className="h-3 w-20 rounded bg-noir-800/60" />
            </div>
          </div>
          <div className="space-y-3 pt-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 w-full rounded-xl bg-noir-800/50" />
            ))}
          </div>
        </aside>

        {/* Content Skeleton */}
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-noir-800/80 bg-noir-900/40 px-6 flex items-center justify-between animate-pulse">
            <div className="h-5 w-40 rounded bg-noir-800" />
            <div className="h-8 w-24 rounded-full bg-noir-800/60" />
          </header>
          <main className="flex-1 p-6 space-y-6 animate-pulse">
            <div className="h-8 w-64 rounded bg-noir-800" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 rounded-2xl bg-noir-900/80 border border-noir-800" />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // If not authenticated and finished loading, show redirecting state
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-noir-950 text-gold-300">
        <p className="font-serif text-sm">Перенаправление на страницу авторизации...</p>
      </div>
    );
  }

  const navItems: NavItem[] = [
    {
      name: "Дашборд",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Заявки клиентов",
      href: "/admin/inquiries",
      icon: Inbox,
      badgeCount: newInquiriesCount,
    },
    {
      name: "Каталог изделий",
      href: "/admin/products",
      icon: Gem,
    },
    {
      name: "Категории",
      href: "/admin/categories",
      icon: FolderTree,
    },
    {
      name: "Справочники",
      href: "/admin/characteristics",
      icon: SlidersHorizontal,
    },
    {
      name: "Контакты и мастер",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    if (confirm("Вы уверены, что хотите выйти из панели мастера?")) {
      await logout();
      router.replace("/admin/login");
    }
  };

  const renderNavLinks = () => (
    <nav className="flex-1 space-y-1.5 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
              isActive
                ? "bg-gradient-to-r from-gold-500/20 to-gold-400/10 text-gold-200 border border-gold-400/30 shadow-sm"
                : "text-noir-300 hover:bg-noir-800/60 hover:text-white"
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400`}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={`h-4 w-4 transition-colors ${
                  isActive
                    ? "text-gold-400"
                    : "text-noir-400 group-hover:text-gold-300"
                }`}
              />
              <span>{item.name}</span>
            </div>

            {item.badgeCount !== undefined && item.badgeCount > 0 && (
              <span
                className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold transition-transform ${
                  isActive
                    ? "bg-gold-500 text-noir-950 font-extrabold shadow-gold"
                    : "bg-amber-500 text-noir-950 animate-pulse"
                }`}
                title="Новые неразобранные заявки"
              >
                {item.badgeCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-noir-950 text-noir-100 selection:bg-gold-500 selection:text-noir-950">
      {/* ========================================================
          DESKTOP SIDEBAR NAVIGATION
         ======================================================== */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-gold-500/15 bg-noir-900/80 backdrop-blur-md">
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-noir-800/80 px-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-lg p-1"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/30 bg-noir-950 p-2 shadow-gold">
              <Image
                src="/images/icon-gold.png"
                alt="Marziya Gold"
                width={36}
                height={36}
                className="h-full w-full object-contain drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-sm font-semibold tracking-wider text-gold-200 uppercase">
                Marziya Gold
              </span>
              <span className="text-[10px] tracking-widest text-gold-400/80 uppercase font-medium">
                Панель мастера
              </span>
            </div>
          </Link>
        </div>

        {/* Master Identity Card */}
        <div className="border-b border-noir-800/80 px-6 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-noir-800 bg-noir-950/60 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-white truncate">
                {user?.username || "Мастер"}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-gold-400/90 font-medium">
                <ShieldCheck className="h-3 w-3 text-gold-400" />
                <span>Мастерская</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        {renderNavLinks()}

        {/* Bottom Sidebar Footer Actions */}
        <div className="border-t border-noir-800/80 p-4 space-y-2">
          {/* Link to public storefront */}
          <Link
            href="/catalog"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-noir-800 bg-noir-950/40 px-3.5 py-2.5 text-xs font-medium text-noir-300 hover:border-gold-500/40 hover:text-gold-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-gold-400" />
              <span>Витрина каталога</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-noir-500" />
          </Link>

          {/* Master Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium text-noir-400 hover:bg-red-950/30 hover:text-red-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <LogOut className="h-4 w-4 text-noir-500 hover:text-red-400" />
            <span>Выйти из панели</span>
          </button>
        </div>
      </aside>

      {/* ========================================================
          MAIN CONTENT AREA & TOP NAVBAR
         ======================================================== */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gold-500/15 bg-noir-950/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Открыть меню навигации"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-noir-800 text-noir-300 hover:text-white hover:border-gold-500/40 lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <Menu className="h-5 w-5" />
            </button>

            <span className="font-serif text-sm font-semibold tracking-wider text-gold-200 uppercase lg:hidden">
              Marziya Gold
            </span>
          </div>

          {/* Header Right Quick Status Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Inquiries Badge Button */}
            <Link
              href="/admin/inquiries"
              className={`relative flex min-h-[44px] items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs font-medium transition-all ${
                newInquiriesCount > 0
                  ? "border border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-sm"
                  : "border border-noir-800 bg-noir-900/60 text-noir-400 hover:text-noir-200"
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400`}
            >
              <Bell
                className={`h-4 w-4 ${
                  newInquiriesCount > 0 ? "text-amber-400" : "text-noir-400"
                }`}
              />
              <span className="hidden sm:inline">Новые заявки:</span>
              <span
                className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                  newInquiriesCount > 0
                    ? "bg-amber-500 text-noir-950 animate-pulse"
                    : "bg-noir-800 text-noir-300"
                }`}
              >
                {newInquiriesCount}
              </span>
            </Link>

            {/* Quick Link to Storefront on Mobile/Desktop */}
            <Link
              href="/catalog"
              target="_blank"
              rel="noopener noreferrer"
              title="Открыть открытую витрину каталога"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-noir-800 bg-noir-900/60 text-noir-400 hover:border-gold-500/40 hover:text-gold-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-noir-950 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* ========================================================
          MOBILE NAVIGATION DRAWER (Slide-over)
         ======================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-gold-500/20 bg-noir-950 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex h-16 items-center justify-between border-b border-noir-800 px-5">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/images/icon-gold.png"
                  alt="Marziya Gold"
                  width={32}
                  height={32}
                  className="drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]"
                />
                <span className="font-serif text-sm font-semibold tracking-wider text-gold-200 uppercase">
                  Панель мастера
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Закрыть меню"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-noir-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Master User Card */}
            <div className="border-b border-noir-800 px-5 py-3">
              <div className="flex items-center gap-2.5 text-xs text-noir-300">
                <User className="h-4 w-4 text-gold-400" />
                <span className="font-semibold text-white">{user?.username || "Мастер"}</span>
                <span className="rounded bg-gold-500/20 px-1.5 py-0.5 text-[10px] text-gold-300">
                  Мастерская
                </span>
              </div>
            </div>

            {/* Navigation links */}
            {renderNavLinks()}

            {/* Mobile Drawer Footer */}
            <div className="border-t border-noir-800 p-4 space-y-2">
              <Link
                href="/catalog"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-noir-800 bg-noir-900/60 px-4 py-2.5 text-xs font-medium text-noir-300 hover:text-gold-200"
              >
                <span>Витрина каталога</span>
                <ExternalLink className="h-4 w-4" />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-medium text-red-300 hover:bg-red-950/30"
              >
                <LogOut className="h-4 w-4" />
                <span>Выйти из панели</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
