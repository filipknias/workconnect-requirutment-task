"use client";

import { useState } from "react";
import { toast } from "@repo/ui/components/toast";
import { useQueryStates } from "nuqs";
import type { Product } from "../types/product";
import { getProductsPage } from "../utils/get-products-page";
import { formatProductCount } from "../utils/product-labels";
import { productSearchParams } from "../utils/search-params";
import { AddProductDialog } from "./add-product-dialog";
import { ProductCardList } from "./product-card-list";
import { ProductTable } from "./product-table";

// Added products live only in this `useState`; the page is in shallow nuqs so
// paging never refetches and drops them.
export function ProductsCatalogue({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [{ page }, setSearchParams] = useQueryStates(productSearchParams);
  const productsPage = getProductsPage(page, products);

  const addProduct = (product: Product) => {
    setProducts((current) => [product, ...current]);
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
