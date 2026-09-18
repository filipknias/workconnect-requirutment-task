import Link from "next/link";
import { productPageHref } from "../utils/search-params";

/**
 * What a page outside the catalogue shows. Both layouts render it, so the copy
 * and the way back to page one live in one place.
 */
export function ProductsEmptyState() {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-12 text-center whitespace-normal">
      <p className="text-sm font-medium text-neutral-950">Brak produktów na tej stronie</p>
      <Link
        href={productPageHref(1)}
        className="text-sm text-blue-600 underline-offset-4 hover:underline"
      >
        Wróć do pierwszej strony
      </Link>
    </div>
  );
}
