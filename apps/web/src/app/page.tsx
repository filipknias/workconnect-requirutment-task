import { Suspense } from "react";
import { ProductsCatalogue } from "@/features/products/components/products-catalogue";
import { PRODUCTS } from "@/features/products/data/products";

// `Suspense` is required: nuqs reads `useSearchParams`, and without a boundary
// Next fails the build. `bg-neutral-50` stays here, or the body goes dark in dark mode.
export default function Home() {
  return (
    <main className="flex-1 bg-neutral-50 px-4 pt-6 pb-10 lg:px-6 lg:py-12">
      <Suspense>
        <ProductsCatalogue initialProducts={PRODUCTS} />
      </Suspense>
    </main>
  );
}
