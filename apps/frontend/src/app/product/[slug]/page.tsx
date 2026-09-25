import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getContactSettings, DEMO_PRODUCT_DETAILS } from "@/lib/api";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { StickyActionBar } from "@/components/product/StickyActionBar";
import { BackButton } from "@/components/product/BackButton";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-generate static routes for all seed jewelry pieces
 */
export function generateStaticParams() {
  return DEMO_PRODUCT_DETAILS.map((product) => ({
    slug: product.slug,
  }));
}

/**
 * Dynamic SEO metadata for luxury master jewelry
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Изделие не найдено | Marziya Gold",
      description: "Запрашиваемое ювелирное изделие не найдено в каталоге Marziya Gold.",
    };
  }

  const categoryName = product.category?.name || product.categoryName || "Ювелирные изделия";
  const title = `${product.name} | Marziya Gold`;
  const description =
    product.description ||
    `Авторское ювелирное изделие «${product.name}» (${categoryName}) ручной работы мастера Marziya Gold. Индивидуальное изготовление под заказ.`;

  const mainImageUrl = product.images?.[0]?.url;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.sku,
      categoryName,
      "авторские ювелирные изделия",
      "ручная работа",
      "золото",
      "Marziya Gold",
      ...(product.stones?.map((s) => s.stoneTypeName).filter(Boolean) as string[]),
    ],
    openGraph: {
      title,
      description,
      type: "website",
      images: mainImageUrl ? [{ url: mainImageUrl, alt: product.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: mainImageUrl ? [mainImageUrl] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, contacts] = await Promise.all([
    getProductBySlug(slug),
    getContactSettings(),
  ]);

  if (!product) {
    notFound();
  }

  // Schema.org Product JSON-LD structured data
  const categoryName = product.category?.name || product.categoryName || "Ювелирные изделия";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: (product.images || []).map((img) => img.url).filter(Boolean),
    category: categoryName,
    brand: {
      "@type": "Brand",
      name: "Marziya Gold",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      availability: "https://schema.org/MadeToOrder",
      itemCondition: "https://schema.org/NewCondition",
    },
    additionalProperty: (product.characteristics || []).map((c) => ({
      "@type": "PropertyValue",
      name: c.name,
      value: c.value,
    })),
  };

  return (
    <>
      {/* Schema.org JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-noir-950 pb-24 sm:pb-16">
        <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-7xl">
          {/* Back to Catalog Arrow Button */}
          <div className="mb-4 flex items-center gap-3">
            <BackButton
              fallbackUrl={
                product.category?.slug
                  ? `/catalog/${product.category.slug}`
                  : product.categorySlug
                  ? `/catalog/${product.categorySlug}`
                  : "/catalog"
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-start">
            {/* Left Column: Interactive Product Gallery */}
            <div className="lg:col-span-7 lg:sticky lg:top-28">
              <ProductGallery
                images={product.images}
                productName={product.name}
              />
            </div>

            {/* Right Column: Detailed Product Info, Characteristics, Counter & Contacts */}
            <div className="lg:col-span-5">
              <ProductInfo product={product} contacts={contacts} />
            </div>
          </div>
        </div>

        {/* Mobile Sticky Action Bar */}
        <StickyActionBar product={product} />
      </div>
    </>
  );
}
