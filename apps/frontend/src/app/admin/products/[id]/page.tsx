"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductEditor from "@/components/admin/ProductEditor";
import { getAdminProductById } from "@/lib/admin-api";
import type { ProductDetailDto } from "@/types/api";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(params.id);
    if (isNaN(id)) {
      setError("Неверный ID");
      setLoading(false);
      return;
    }

    getAdminProductById(id)
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Ошибка загрузки изделия");
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20 text-red-400 bg-noir-900/50 rounded-2xl border border-noir-800">
        <p>{error || "Изделие не найдено"}</p>
        <button
          onClick={() => router.push("/admin/products")}
          className="mt-4 px-4 py-2 bg-noir-800 rounded-xl text-white hover:bg-noir-700"
        >
          Вернуться к списку
        </button>
      </div>
    );
  }

  return <ProductEditor initialData={product} />;
}
