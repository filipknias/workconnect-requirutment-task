import { AddProductButton } from "@/features/products/components/add-product-button";
import { ProductCardList } from "@/features/products/components/product-card-list";
import { ProductTable } from "@/features/products/components/product-table";
import { getProductsPage } from "@/features/products/get-products-page";
import { formatProductCount } from "@/features/products/product-labels";
import { loadProductSearchParams } from "@/features/products/search-params";

/**
 * Both layouts render and CSS picks one at `lg`. The page is a server
 * component, so the pagination links are real hrefs and paging is a navigation
 * rather than client state.
 *
 * `bg-neutral-50` is on the page rather than left to the body: `globals.css`
 * still declares a dark palette this page does not honour, and without it the
 * body would go dark behind white cards in a dark-mode browser.
 */
export default async function Home({ searchParams }: PageProps<"/">) {
  const { page } = await loadProductSearchParams(searchParams);
  const productsPage = getProductsPage(page);

  return (
    <main className="flex-1 bg-neutral-50 px-4 pt-6 pb-10 lg:px-6 lg:py-12">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-4 lg:gap-6">
        <header className="flex items-center justify-between gap-1">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-neutral-950">Produkty</h1>
            <p className="text-sm text-neutral-500">
              {formatProductCount(productsPage.total)} w katalogu
            </p>
          </div>
          <AddProductButton />
        </header>

        <div className="hidden lg:block">
          <ProductTable {...productsPage} />
        </div>
        <div className="lg:hidden">
          <ProductCardList {...productsPage} />
        </div>
      </div>
    </main>
  );
}
