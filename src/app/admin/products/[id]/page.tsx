import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getProductById, getVariantsForProduct } from "@/lib/catalog";
import { ProductForm } from "@/components/admin/product-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories, variants] = await Promise.all([
    getProductById(id),
    getCategories(),
    getVariantsForProduct(id),
  ]);
  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="text-sm font-medium text-[var(--gold)] hover:underline">
        ← Back to products
      </Link>
      <h2 className="font-display mt-4 text-2xl font-semibold text-[var(--foreground)]">
        Edit product
      </h2>
      <div className="mt-6">
        <ProductForm categories={categories} product={product} variants={variants} />
      </div>
    </div>
  );
}
