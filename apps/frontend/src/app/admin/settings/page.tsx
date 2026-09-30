"use client";

import React, { useEffect, useState } from "react";
import { Settings, Save, CheckCircle2 } from "lucide-react";
import { getAdminSettings, updateAdminSettings } from "@/lib/admin-api";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    telegramUsername: "",
    phoneNumber: "",
    masterBio: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const data = await getAdminSettings();
        setFormData({
          telegramUsername: data.telegramUsername || "",
          phoneNumber: data.phoneNumber || "",
          masterBio: data.masterBio || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки настроек");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await updateAdminSettings(formData);
      setFormData({
        telegramUsername: updated.telegramUsername || "",
        phoneNumber: updated.phoneNumber || "",
        masterBio: updated.masterBio || "",
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения настроек");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-2xl">
        <div className="h-8 w-64 bg-noir-800 rounded"></div>
        <div className="h-96 bg-noir-900/80 rounded-2xl border border-noir-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-serif text-2xl font-bold text-gold-200 tracking-wide flex items-center gap-3">
        <Settings className="h-6 w-6 text-gold-400" />
        Контакты и мастер
      </h1>

      <div className="rounded-2xl border border-noir-800 bg-noir-900/80 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="phoneNumber" className="text-sm font-medium text-noir-300">
              Телефон мастера
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full min-h-[44px] rounded-xl border border-noir-800 bg-noir-950 px-4 py-2 text-noir-100 placeholder:text-noir-600 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
              placeholder="+998 90 123 45 67"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="telegramUsername" className="text-sm font-medium text-noir-300">
              Telegram username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-noir-500 font-medium">
                @
              </span>
              <input
                id="telegramUsername"
                type="text"
                value={formData.telegramUsername}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val.startsWith('@')) val = val.substring(1);
                  setFormData({ ...formData, telegramUsername: val });
                }}
                className="w-full min-h-[44px] rounded-xl border border-noir-800 bg-noir-950 pl-8 pr-4 py-2 text-noir-100 placeholder:text-noir-600 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                placeholder="username"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="masterBio" className="text-sm font-medium text-noir-300">
              О мастере
            </label>
            <textarea
              id="masterBio"
              rows={5}
              value={formData.masterBio}
              onChange={(e) => setFormData({ ...formData, masterBio: e.target.value })}
              className="w-full rounded-xl border border-noir-800 bg-noir-950 px-4 py-3 text-noir-100 placeholder:text-noir-600 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 resize-none"
              placeholder="Краткая информация о мастере, опыт работы и философия..."
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-900 text-red-200">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <div className="flex-1">
              {success && (
                <div className="flex items-center gap-2 text-green-400 text-sm animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Настройки успешно сохранены</span>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 min-h-[44px] px-6 rounded-xl bg-gold-500 text-noir-950 font-semibold hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Сохранение..." : "Сохранить настройки"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
