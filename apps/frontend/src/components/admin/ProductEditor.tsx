"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, X, Plus, Trash2, ArrowLeft, ArrowLeft as MoveLeft, ArrowRight as MoveRight, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  createAdminProduct,
  updateAdminProduct,
  uploadMedia,
  getAdminCategories,
  getAdminCharacteristicKeys,
  getAdminStoneTypes,
} from "@/lib/admin-api";
import type {
  ProductDetailDto,
  ProductSaveRequestDto,
  CategoryAdminDto,
  CharacteristicKeyDto,
  StoneTypeAdminDto,
  CharacteristicEntryDto
} from "@/types/api";

interface ProductEditorProps {
  initialData?: ProductDetailDto | null;
}

export default function ProductEditor({ initialData }: ProductEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryAdminDto[]>([]);
  const [charKeys, setCharKeys] = useState<CharacteristicKeyDto[]>([]);
  const [stoneTypes, setStoneTypes] = useState<StoneTypeAdminDto[]>([]);

  // Form State
  const [sku, setSku] = useState(initialData?.sku || "");
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [categoryId, setCategoryId] = useState<number | "">(initialData?.category?.id || "");
  const [isVisible, setIsVisible] = useState(initialData?.isVisible ?? true);
  
  const [images, setImages] = useState<{ url: string; publicId?: string }[]>(
    (initialData?.images || []).map(img => ({ url: img.url }))
  );
  
  const [characteristics, setCharacteristics] = useState<CharacteristicEntryDto[]>(
    initialData?.characteristics || []
  );

  const [stones, setStones] = useState<{ stoneTypeId?: number; characteristics: CharacteristicEntryDto[] }[]>(
    (initialData?.stones || []).map(s => ({
      stoneTypeId: s.stoneTypeId,
      characteristics: s.characteristics || [],
    }))
  );

  // Validation State
  const [validationErrors, setValidationErrors] = useState<{ sku?: string; name?: string; categoryId?: string }>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, keys, stypes] = await Promise.all([
          getAdminCategories(),
          getAdminCharacteristicKeys(),
          getAdminStoneTypes(),
        ]);
        setCategories(cats);
        setCharKeys(keys);
        setStoneTypes(stypes);
      } catch (err) {
        console.error("Failed to load reference data", err);
      }
    }
    loadData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileList = Array.from(e.target.files);
    setUploading(true);
    setError(null);
    try {
      const newImages = [...images];
      for (let i = 0; i < fileList.length; i++) {
        setUploadProgress(`Загрузка ${i + 1}/${fileList.length}...`);
        const file = fileList[i];
        const res = await uploadMedia(file);
        newImages.push(res);
      }
      setImages(newImages);
    } catch (err) {
      console.error("Image upload failed", err);
      setError("Ошибка загрузки изображения в Cloudflare R2");
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    if (window.confirm("Удалить это фото?")) {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const handleMoveImage = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= images.length) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index + direction];
    newImages[index + direction] = temp;
    setImages(newImages);
  };

  const handleSave = async () => {
    // Validation
    const errors: { sku?: string; name?: string; categoryId?: string } = {};
    if (!sku.trim()) errors.sku = "Артикул обязателен";
    if (!name.trim()) errors.name = "Название обязательно";
    if (categoryId === "") errors.categoryId = "Выберите категорию";
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError("Пожалуйста, исправьте ошибки заполнения формы");
      return;
    }

    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const payload: ProductSaveRequestDto = {
        sku,
        name,
        description,
        categoryId: Number(categoryId),
        isVisible,
        imageUrls: images.map(img => img.url),
        characteristics,
        stones: stones.map((s, idx) => ({
          stoneTypeId: s.stoneTypeId,
          sortOrder: idx,
          characteristics: s.characteristics,
        })),
      };

      if (initialData?.id) {
        await updateAdminProduct(initialData.id, payload);
      } else {
        await createAdminProduct(payload);
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Ошибка при сохранении изделия");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/products" 
            aria-label="Назад"
            className="flex items-center justify-center min-w-[44px] min-h-[44px] hover:bg-noir-800 rounded-xl transition-colors text-noir-400 hover:text-gold-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif text-2xl font-bold text-gold-200 tracking-wide">
            {initialData ? "Редактирование изделия" : "Новое изделие"}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2 rounded-xl text-noir-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={loading || uploading}
            className="px-6 py-2 rounded-xl bg-gold-500 text-noir-950 font-medium hover:bg-gold-400 transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {loading ? "Сохранение..." : uploading ? "Загрузка фото..." : "Сохранить изделие"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-900/50 text-red-200">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="rounded-2xl border border-noir-800 bg-noir-900/80 p-6 space-y-6">
        <h2 className="text-xl font-serif text-gold-200">Основная информация</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-noir-300">Артикул *</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => {
                setSku(e.target.value);
                if (validationErrors.sku) setValidationErrors(prev => ({ ...prev, sku: undefined }));
              }}
              className={`w-full bg-noir-950 border ${validationErrors.sku ? 'border-red-500' : 'border-noir-700'} text-white rounded-xl px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 transition-colors min-h-[44px]`}
              placeholder="Например: R-1234"
            />
            {validationErrors.sku && <p className="text-sm text-red-500">{validationErrors.sku}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm text-noir-300">Название *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationErrors.name) setValidationErrors(prev => ({ ...prev, name: undefined }));
              }}
              className={`w-full bg-noir-950 border ${validationErrors.name ? 'border-red-500' : 'border-noir-700'} text-white rounded-xl px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 transition-colors min-h-[44px]`}
              placeholder="Кольцо с бриллиантом"
            />
            {validationErrors.name && <p className="text-sm text-red-500">{validationErrors.name}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm text-noir-300">Категория *</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value ? Number(e.target.value) : "");
                if (validationErrors.categoryId) setValidationErrors(prev => ({ ...prev, categoryId: undefined }));
              }}
              className={`w-full bg-noir-950 border ${validationErrors.categoryId ? 'border-red-500' : 'border-noir-700'} text-white rounded-xl px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 transition-colors min-h-[44px]`}
            >
              <option value="">Выберите категорию</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {validationErrors.categoryId && <p className="text-sm text-red-500">{validationErrors.categoryId}</p>}
          </div>
          <div className="space-y-2 flex flex-col justify-center">
            <label className="flex items-center gap-3 cursor-pointer mt-6 min-h-[44px]">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="w-5 h-5 rounded border-noir-700 text-gold-500 focus-visible:ring-2 focus-visible:ring-gold-400 focus:outline-none bg-noir-950"
              />
              <span className="text-noir-200">Видимость на сайте</span>
            </label>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-noir-300">Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-noir-950 border border-noir-700 text-white rounded-xl px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 transition-colors"
          />
        </div>
      </div>

      {/* Images */}
      <div className="rounded-2xl border border-noir-800 bg-noir-900/80 p-6 space-y-6">
        <h2 className="text-xl font-serif text-gold-200">Фотографии</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-noir-700 group bg-noir-950">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              
              {/* Top Right: Delete */}
              <button
                type="button"
                aria-label="Удалить фото"
                onClick={() => handleRemoveImage(i)}
                className="absolute top-2 right-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-red-500/80 hover:bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Bottom: Reorder */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  aria-label="Сдвинуть влево"
                  disabled={i === 0}
                  onClick={() => handleMoveImage(i, -1)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-noir-950/80 hover:bg-noir-800 text-white rounded-xl disabled:opacity-50"
                >
                  <MoveLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  aria-label="Сдвинуть вправо"
                  disabled={i === images.length - 1}
                  onClick={() => handleMoveImage(i, 1)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-noir-950/80 hover:bg-noir-800 text-white rounded-xl disabled:opacity-50"
                >
                  <MoveRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          <label className={`aspect-square rounded-xl border-2 border-dashed ${uploading ? 'border-gold-500 bg-gold-950/20' : 'border-noir-700 hover:border-gold-500 bg-noir-950/50'} flex flex-col items-center justify-center cursor-pointer transition-colors text-noir-400 hover:text-gold-200 group min-h-[120px]`}>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={loading || uploading} />
            {uploading ? (
              <div className="flex flex-col items-center gap-2 p-2 text-center animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
                <span className="text-xs text-gold-300 font-medium">{uploadProgress || "Загрузка в R2..."}</span>
              </div>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-center px-2">Загрузить фото</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Characteristics */}
      <div className="rounded-2xl border border-noir-800 bg-noir-900/80 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif text-gold-200">Характеристики</h2>
          <button
            type="button"
            onClick={() => setCharacteristics([...characteristics, { name: "", value: "" }])}
            className="flex items-center justify-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors min-h-[44px] px-3 rounded-xl hover:bg-noir-800"
          >
            <Plus className="w-4 h-4" />
            Добавить характеристику
          </button>
        </div>
        
        {characteristics.length === 0 ? (
          <div className="text-center py-6 text-noir-400 text-sm">
            Нет добавленных характеристик
          </div>
        ) : (
          <div className="space-y-3">
            {characteristics.map((char, i) => (
              <div key={i} className="flex gap-3 items-start">
                <input
                  type="text"
                  placeholder="Название (например: Металл)"
                  value={char.name}
                  onChange={(e) => {
                    const newChars = [...characteristics];
                    newChars[i].name = e.target.value;
                    setCharacteristics(newChars);
                  }}
                  className="flex-1 bg-noir-950 border border-noir-700 text-white rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 min-h-[44px]"
                  list="char-keys-list"
                />
                <input
                  type="text"
                  placeholder="Значение"
                  value={char.value}
                  onChange={(e) => {
                    const newChars = [...characteristics];
                    newChars[i].value = e.target.value;
                    setCharacteristics(newChars);
                  }}
                  className="flex-1 bg-noir-950 border border-noir-700 text-white rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 min-h-[44px]"
                />
                <button
                  type="button"
                  aria-label="Удалить характеристику"
                  onClick={() => setCharacteristics(characteristics.filter((_, idx) => idx !== i))}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-noir-400 hover:text-red-400 transition-colors bg-noir-950 border border-noir-700 rounded-xl"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <datalist id="char-keys-list">
              {charKeys.map(k => (
                <option key={k.id} value={k.name} />
              ))}
            </datalist>
          </div>
        )}
      </div>

      {/* Stones */}
      <div className="rounded-2xl border border-noir-800 bg-noir-900/80 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif text-gold-200">Камни</h2>
          <button
            type="button"
            onClick={() => setStones([...stones, { characteristics: [] }])}
            className="flex items-center justify-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors min-h-[44px] px-3 rounded-xl hover:bg-noir-800"
          >
            <Plus className="w-4 h-4" />
            Добавить камень
          </button>
        </div>

        {stones.length === 0 ? (
          <div className="text-center py-6 text-noir-400 text-sm">
            Нет добавленных камней
          </div>
        ) : (
          <div className="space-y-4">
            {stones.map((stone, si) => (
              <div key={si} className="p-4 border border-noir-700 rounded-xl bg-noir-950/50 space-y-4">
                <div className="flex items-center justify-between">
                  <select
                    value={stone.stoneTypeId || ""}
                    onChange={(e) => {
                      const newStones = [...stones];
                      newStones[si].stoneTypeId = e.target.value ? Number(e.target.value) : undefined;
                      setStones(newStones);
                    }}
                    className="flex-1 max-w-[300px] bg-noir-950 border border-noir-700 text-white rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 min-h-[44px]"
                  >
                    <option value="">Выберите тип камня</option>
                    {stoneTypes.map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label="Удалить камень"
                    onClick={() => setStones(stones.filter((_, idx) => idx !== si))}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-noir-400 hover:text-red-400 transition-colors rounded-xl hover:bg-noir-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="pl-4 border-l-2 border-noir-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-noir-300">Характеристики камня</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newStones = [...stones];
                        newStones[si].characteristics.push({ name: "", value: "" });
                        setStones(newStones);
                      }}
                      className="text-xs text-gold-500 hover:text-gold-400 transition-colors min-h-[44px] px-3 rounded-xl hover:bg-noir-900 flex items-center justify-center"
                    >
                      + Добавить
                    </button>
                  </div>
                  {stone.characteristics.map((char, ci) => (
                    <div key={ci} className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Название"
                        value={char.name}
                        onChange={(e) => {
                          const newStones = [...stones];
                          newStones[si].characteristics[ci].name = e.target.value;
                          setStones(newStones);
                        }}
                        className="flex-1 bg-noir-950 border border-noir-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 min-h-[44px]"
                      />
                      <input
                        type="text"
                        placeholder="Значение"
                        value={char.value}
                        onChange={(e) => {
                          const newStones = [...stones];
                          newStones[si].characteristics[ci].value = e.target.value;
                          setStones(newStones);
                        }}
                        className="flex-1 bg-noir-950 border border-noir-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 min-h-[44px]"
                      />
                      <button
                        type="button"
                        aria-label="Удалить характеристику камня"
                        onClick={() => {
                          const newStones = [...stones];
                          newStones[si].characteristics = newStones[si].characteristics.filter((_, idx) => idx !== ci);
                          setStones(newStones);
                        }}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-noir-500 hover:text-red-400 transition-colors rounded-lg hover:bg-noir-900"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
