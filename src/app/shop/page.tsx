import { redirect } from "next/navigation";

/** Categories + catalog grid live on /products and /shop/[slug]. */
export default function ShopIndexPage() {
  redirect("/products");
}
