import Link from "next/link";
import { getCategories } from "@/lib/catalog";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <Link href="/admin/products" className="text-sm font-medium text-[var(--gold)] hover:underline">
        ← Back to products
      </Link>
      <h2 className="font-display mt-4 text-2xl font-semibold text-[var(--foreground)]">
        New product
      </h2>
      <div className="mt-6">
        <ProductForm categories={categories} variants={[]} />
      </div>
    </div>
  );
}
