import { Suspense } from "react";
import { ProductsCatalogue } from "@/features/products/components/products-catalogue";
import { PRODUCTS } from "@/features/products/data/products";

/**
 * A shell around the catalogue. The listing itself is a client component — a
 * product added in the wizard has nowhere to live but React state until there
 * is an API — so this route's whole job is to hand it the seed rows.
 *
 * The `Suspense` boundary is what nuqs' Next adapter needs: it reads the page
 * number through `useSearchParams`, which cannot be prerendered into a static
 * shell without one. Next refuses the build otherwise.
 *
 * `bg-neutral-50` is on the page rather than left to the body: `globals.css`
 * still declares a dark palette this page does not honour, and without it the
 * body would go dark behind white cards in a dark-mode browser.
 */
export default function Home() {
  return (
    <main className="flex-1 bg-neutral-50 px-4 pt-6 pb-10 lg:px-6 lg:py-12">
      <Suspense>
        <ProductsCatalogue initialProducts={PRODUCTS} />
      </Suspense>
    </main>
  );
}
