"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Shield,
} from "lucide-react";
import { useAdminStore } from "@/store/admin-store";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, checkAuth, isAuthenticated, isLoadingAuth } = useAdminStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    checkAuth().then((user) => {
      if (user) {
        router.replace("/admin/dashboard");
      }
    });
  }, [checkAuth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setErrorMessage("Пожалуйста, укажите логин мастера.");
      return;
    }
    if (!password) {
      setErrorMessage("Пожалуйста, введите пароль.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        username: trimmedUsername,
        password,
      });
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Не удалось войти в панель. Проверьте данные и повторите попытку.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already authenticated, show clean loader while redirecting
  if (isAuthenticated && !isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-noir-950 p-4">
        <div className="flex flex-col items-center gap-3 text-gold-300">
          <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
          <p className="font-serif text-sm tracking-wide">
            Переход в панель мастера...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-noir-950 px-4 py-12 sm:px-6 lg:px-8 selection:bg-gold-500 selection:text-noir-950">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_20%,rgba(184,142,62,0.12),rgba(9,9,11,0))]" />

      {/* Top back navigation */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-noir-800 bg-noir-900/60 px-4 py-2 text-xs font-medium text-noir-300 backdrop-blur-sm transition-colors hover:border-gold-500/40 hover:text-gold-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>На витрину мастерской</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Master Branding & Emblem */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-500/30 bg-gradient-to-b from-noir-900 to-noir-950 p-3 shadow-gold">
            <Image
              src="/images/icon-gold.png"
              alt="Marziya Gold"
              width={52}
              height={52}
              priority
              className="h-full w-full object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
            />
          </div>

          <span className="font-serif text-xs font-semibold tracking-widest text-gold-400 uppercase">
            Marziya Gold
          </span>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Панель мастера
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-noir-400 max-w-xs">
            Авторизованный доступ к управлению каталогом изделий и поступающим заявкам
          </p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-2xl border border-gold-500/20 bg-noir-900/80 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          {/* Error Alert Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-xs sm:text-sm text-red-200 animate-fadeIn"
            >
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Username Input */}
            <div className="space-y-2">
              <label
                htmlFor="admin-username"
                className="block text-xs font-medium tracking-wide text-noir-200 uppercase"
              >
                Логин мастера
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-noir-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="master"
                  disabled={isSubmitting}
                  className="block w-full min-h-[44px] rounded-xl border border-noir-700 bg-noir-950/70 pl-10 pr-4 text-sm text-white placeholder-noir-500 transition-colors focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium tracking-wide text-noir-200 uppercase"
              >
                Пароль
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-noir-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className="block w-full min-h-[44px] rounded-xl border border-noir-700 bg-noir-950/70 pl-10 pr-12 text-sm text-white placeholder-noir-500 transition-colors focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  className="absolute inset-y-0 right-0 flex min-h-[44px] min-w-[44px] items-center justify-center text-noir-400 hover:text-gold-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-r-xl"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-6 py-3 text-sm font-semibold text-noir-950 transition-all hover:from-gold-400 hover:to-gold-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-noir-900 disabled:cursor-not-allowed disabled:opacity-60 shadow-gold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-noir-950" />
                    <span>Проверка ключей доступа...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 text-noir-950" />
                    <span>Войти в панель</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="text-center text-xs text-noir-500">
          <p>Закрытый контур управления ювелирной мастерской Marziya Gold.</p>
          <p className="mt-1 text-[11px] text-noir-600">
            Сессия защищена криптографическими HttpOnly Cookie.
          </p>
        </div>
      </div>
    </div>
  );
}
