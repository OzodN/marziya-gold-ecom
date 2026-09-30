"use client";

import React, { useEffect, useState } from "react";
import { Gem, Plus, Trash2, X, Save, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import {
  getAdminStoneTypes,
  createAdminStoneType,
  deleteAdminStoneType,
} from "@/lib/admin-api";
import type { StoneTypeAdminDto } from "@/types/api";

export default function StoneTypesPage() {
  const [types, setTypes] = useState<StoneTypeAdminDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    isActive: true,
  });

  const fetchTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAdminStoneTypes();
      setTypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  // Global escape key listener
  useEffect(() => {
    if (!isFormOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseForm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFormOpen]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleOpenForm = () => {
    setFormErrors({});
    setFormData({
      name: "",
      isActive: true,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormErrors({ name: "Название обязательно" });
      return;
    }
    try {
      await createAdminStoneType(formData);
      showSuccess("Тип камня создан");
      handleCloseForm();
      fetchTypes();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка сохранения");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Вы уверены, что хотите удалить этот тип камня?")) {
      try {
        await deleteAdminStoneType(id);
        showSuccess("Тип камня удален");
        fetchTypes();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Ошибка удаления");
      }
    }
  };

  if (isLoading && types.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-noir-800 rounded"></div>
        <div className="h-64 bg-noir-900/80 rounded-2xl border border-noir-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/characteristics"
            aria-label="Назад к справочникам"
            className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border border-noir-800 bg-noir-900 text-noir-300 hover:border-gold-500/40 hover:text-gold-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            title="Назад к справочникам"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-serif text-2xl font-bold text-gold-200 tracking-wide flex items-center gap-3">
            <Gem className="h-6 w-6 text-gold-400" />
            Типы камней
          </h1>
        </div>
        <button
          onClick={handleOpenForm}
          className="flex items-center gap-2 min-h-[44px] px-4 rounded-xl bg-gold-500 text-noir-950 font-semibold hover:bg-gold-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          <Plus className="h-4 w-4" />
          <span>Новый тип</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-green-950/50 border border-green-900 text-green-400 flex items-center gap-2 animate-in fade-in">
          <Check className="h-5 w-5" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-900 text-red-200 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchTypes} className="px-3 py-1 rounded bg-red-900/50 hover:bg-red-800 transition-colors">
            Повторить
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-noir-800 bg-noir-900/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-noir-300">
            <thead className="bg-noir-950/50 border-b border-noir-800 text-noir-400">
              <tr>
                <th className="px-6 py-4 font-medium">Название</th>
                <th className="px-6 py-4 font-medium text-center">Статус</th>
                <th className="px-6 py-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-noir-800">
              {types.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-noir-500">
                    Типы камней не найдены.
                  </td>
                </tr>
              ) : (
                types.map((item) => (
                  <tr key={item.id} className="hover:bg-noir-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-noir-100">{item.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${item.isActive ? 'bg-green-950 text-green-400' : 'bg-noir-800 text-noir-400'}`}>
                        {item.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        aria-label="Удалить тип камня"
                        className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl hover:bg-red-950/50 text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog" 
          aria-modal="true" 
          aria-label="Новый тип камня"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseForm} />
          <div className="relative w-full max-w-md rounded-2xl border border-noir-800 bg-noir-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-semibold text-gold-200">
                Новый тип камня
              </h2>
              <button
                onClick={handleCloseForm}
                aria-label="Закрыть"
                className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl hover:bg-noir-900 text-noir-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-noir-300">Название</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                  }}
                  className={`w-full min-h-[44px] rounded-xl border ${formErrors.name ? 'border-red-500' : 'border-noir-800'} bg-noir-900 px-4 py-2 text-noir-100 placeholder:text-noir-600 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500`}
                  placeholder="Например: Бриллиант"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              <label className="flex items-center gap-3 cursor-pointer group min-h-[44px]">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-noir-800 border border-noir-700 peer-checked:bg-gold-500 peer-checked:border-gold-500 transition-colors"></div>
                  <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-noir-400 peer-checked:bg-noir-950 peer-checked:translate-x-5 transition-all"></div>
                </div>
                <span className="text-sm font-medium text-noir-300 group-hover:text-noir-200">
                  Активен
                </span>
              </label>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 min-h-[44px] rounded-xl border border-noir-800 text-noir-300 font-medium hover:bg-noir-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-gold-500 text-noir-950 font-semibold hover:bg-gold-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                  <Save className="h-4 w-4" />
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
