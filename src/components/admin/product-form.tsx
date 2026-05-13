import type { CategoryRow, ProductRow, ProductVariantRow } from "@/lib/catalog";
import { createProduct, updateProduct } from "@/app/admin/actions";
import { ProductImagesField } from "@/components/admin/product-images-field";
import { ProductVariantsField } from "@/components/admin/product-variants-field";
import { priceHintLabel } from "@/lib/site";

type Props = {
  categories: CategoryRow[];
  product?: ProductRow;
  variants?: ProductVariantRow[];
};

export function ProductForm({ categories, product, variants }: Props) {
  const action = product
    ? updateProduct.bind(null, product.id)
    : createProduct;

  return (
    <form action={action} className="max-w-xl space-y-4">
      <label className="block text-sm">
        <span className="text-[var(--foreground-muted)]">Name</span>
        <input
          name="name"
          required
          defaultValue={product?.name}
          className="ui-input"
        />
      </label>
      <label className="block text-sm">
        <span className="text-[var(--foreground-muted)]">Category</span>
        <select
          name="category_id"
          defaultValue={product?.category_id ?? ""}
          className="ui-select"
        >
          <option value="">None</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-[var(--foreground-muted)]">Description</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className="ui-input resize-y"
        />
      </label>
      <div className="block text-sm">
        <span className="mb-1 block text-[var(--foreground-muted)]">Product images</span>
        <p className="mb-2 text-xs text-[var(--foreground-muted)]">
          First image is used on cards and cart. Shoppers can swipe through all on the product page.
        </p>
        <ProductImagesField defaultUrls={product?.image_urls ?? []} />
      </div>
      <label className="block text-sm">
        <span className="text-[var(--foreground-muted)]">{priceHintLabel} (optional)</span>
        <input
          name="price_hint"
          defaultValue={product?.price_hint ?? ""}
          className="ui-input"
          placeholder='e.g. From KES 1,500 or Ask on WhatsApp'
        />
      </label>
      <div className="block text-sm">
        <ProductVariantsField initialVariants={variants ?? []} />
      </div>
      <label className="block text-sm">
        <span className="text-[var(--foreground-muted)]">Quantity in stock</span>
        <input
          name="stock_quantity"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          defaultValue={
            product?.stock_quantity === null || product?.stock_quantity === undefined
              ? ""
              : String(product.stock_quantity)
          }
          className="ui-input"
          placeholder="Leave blank for unlimited"
        />
        <p className="mt-1 text-xs text-[var(--foreground-muted)]">
          Blank = unlimited (no auto sold-out from orders). A number = tracked: when a customer
          taps <strong className="text-[var(--foreground-muted)]">Open WhatsApp</strong>, we reduce
          stock by their cart qty (best-effort — not tied to WhatsApp delivery). At 0 it marks sold
          out automatically.
        </p>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="sold_out"
          defaultChecked={product?.sold_out ?? false}
          className="size-4 rounded border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--gold)] accent-[var(--gold)]"
        />
        <span className="text-[var(--foreground-muted)]">Sold out (manual)</span>
      </label>
      <button
        type="submit"
        className="rounded-xl bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-[var(--on-gold)] transition hover:bg-[var(--gold-hover)]"
      >
        {product ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
