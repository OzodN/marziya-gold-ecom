"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Eye, EyeOff, Edit, Trash2 } from "lucide-react";
import { getAdminProducts, toggleAdminProductVisibility, getAdminCategories, deleteAdminProduct } from "@/lib/admin-api";
import type { ProductSummaryDto, CategoryAdminDto, PageResponseProductSummaryDto } from "@/types/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductSummaryDto[]>([]);
  const [categories, setCategories] = useState<CategoryAdminDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // debounced
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [isVisible, setIsVisible] = useState<boolean | "">("");

  useEffect(() => {
    getAdminCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(q);
      setPage(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [q]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminProducts({
        page,
        size: 20,
        q: searchQuery || undefined,
        categoryId: categoryId === "" ? undefined : categoryId,
        isVisible: isVisible === "" ? undefined : isVisible,
      });
      setProducts(res.content);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, categoryId, isVisible]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleToggleVisibility = async (id: number, current: boolean) => {
    try {
      setProducts(products.map(p => p.id === id ? { ...p, isVisible: !current } : p));
      await toggleAdminProductVisibility(id, !current);
    } catch (err) {
      console.error(err);
      // Revert on error
      setProducts(products.map(p => p.id === id ? { ...p, isVisible: current } : p));
    }
  };
  
  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить изделие?")) return;
    try {
      await deleteAdminProduct(id);
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Ошибка при удалении");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-bold text-gold-200 tracking-wide">
          Каталог изделий
        </h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-gold-500 text-noir-950 font-medium hover:bg-gold-400 transition-colors min-h-[44px]"
        >
          <Plus className="w-5 h-5" />
          Новое изделие
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-noir-400" />
          <input
            type="text"
            placeholder="Поиск по названию или артикулу..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-noir-900 border border-noir-700 text-white rounded-xl focus:outline-none focus:border-gold-500 min-h-[44px]"
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value ? Number(e.target.value) : ""); setPage(0); }}
          className="bg-noir-900 border border-noir-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-gold-500 min-h-[44px]"
        >
          <option value="">Все категории</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={isVisible.toString()}
          onChange={(e) => {
            const val = e.target.value;
            setIsVisible(val === "" ? "" : val === "true");
            setPage(0);
          }}
          className="bg-noir-900 border border-noir-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-gold-500 min-h-[44px]"
        >
          <option value="">Все статусы</option>
          <option value="true">Видимые</option>
          <option value="false">Скрытые</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-[80px] rounded-xl bg-noir-800 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-noir-400 bg-noir-900/50 rounded-2xl border border-noir-800">
          <p>Изделия не найдены</p>
        </div>
      ) : (
        <div className="bg-noir-900/80 rounded-2xl border border-noir-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-noir-800 text-noir-300 text-sm">
                <th className="p-4 font-medium">Фото</th>
                <th className="p-4 font-medium">Артикул</th>
                <th className="p-4 font-medium">Название</th>
                <th className="p-4 font-medium">Категория</th>
                <th className="p-4 font-medium">Видимость</th>
                <th className="p-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-noir-800">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-noir-800/50 transition-colors group">
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-noir-950 flex items-center justify-center">
                      {product.mainImageUrl ? (
                        <img src={product.mainImageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-noir-500">Нет фото</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-noir-200">{product.sku}</td>
                  <td className="p-4 text-white font-medium">{product.name}</td>
                  <td className="p-4 text-noir-300">{product.categoryName}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleVisibility(product.id, product.isVisible)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors min-h-[36px] ${
                        product.isVisible 
                          ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" 
                          : "bg-noir-800 text-noir-400 hover:bg-noir-700"
                      }`}
                    >
                      {product.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {product.isVisible ? "Видим" : "Скрыт"}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="inline-flex p-2 text-gold-500 hover:text-gold-400 transition-colors bg-noir-950 border border-noir-700 rounded-xl"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="inline-flex p-2 text-red-500 hover:text-red-400 transition-colors bg-noir-950 border border-noir-700 rounded-xl"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                page === i
                  ? "bg-gold-500 text-noir-950 font-medium"
                  : "bg-noir-900 border border-noir-700 text-noir-300 hover:text-gold-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
