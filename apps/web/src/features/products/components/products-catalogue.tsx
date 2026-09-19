"use client";

import { useState } from "react";
import { toast } from "@repo/ui/components/toast";
import { useQueryStates } from "nuqs";
import type { Product } from "../types/product";
import type { ProductFormValues } from "../schema/product-form-schema";
import { getProductsPage } from "../utils/get-products-page";
import { formatProductCount } from "../utils/product-labels";
import { productSearchParams } from "../utils/search-params";
import { toProduct } from "../utils/to-product";
import { AddProductDialog } from "./add-product-dialog";
import { ProductCardList } from "./product-card-list";
import { ProductTable } from "./product-table";

/**
 * The catalogue, and the one place that owns it.
 *
 * There is no API, so "adding a product" is a `useState` seeded from the mock
 * rows the route hands in. That is also why the page number lives in nuqs
 * rather than in the URL a server component reads: nuqs' setter is shallow by
 * default, so paging rewrites the address bar without a round-trip, and a
 * product added a moment ago is still there on page two.
 *
 * Both layouts render and CSS picks one at `lg`.
 */
export function ProductsCatalogue({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [{ page }, setSearchParams] = useQueryStates(productSearchParams);
  const productsPage = getProductsPage(page, products);

  /**
   * What "Zapisz produkt" does. The dialog has already validated every step,
   * so there is nothing to check here — only to place.
   *
   * The new row goes on *top*, and the listing jumps back to page one. The
   * Figma frame appends instead, which puts an eighth product on a page two
   * nobody is looking at: the visitor would be told it worked and see nothing
   * change. The id is the lowercased SKU, matching the seeded rows.
   */
  const addProduct = (values: ProductFormValues) => {
    setProducts((current) => [
      toProduct(values, values.sku.trim().toLowerCase()),
      ...current,
    ]);
    void setSearchParams({ page: 1 });
    toast.add({ title: "Produkt został dodany", type: "success" });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-4 lg:gap-6">
      <header className="flex items-center justify-between gap-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-neutral-950">Produkty</h1>
          <p className="text-sm text-neutral-500">
            {formatProductCount(productsPage.total)} w katalogu
          </p>
        </div>
        <AddProductDialog onSubmit={addProduct} />
      </header>

      <div className="hidden lg:block">
        <ProductTable {...productsPage} />
      </div>
      <div className="lg:hidden">
        <ProductCardList {...productsPage} />
      </div>
    </div>
  );
}
