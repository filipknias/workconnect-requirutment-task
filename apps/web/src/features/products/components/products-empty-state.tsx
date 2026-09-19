"use client";

import { usePageLink } from "../hooks/use-page-link";

/**
 * What a page outside the catalogue shows. Both layouts render it, so the copy
 * and the way back to page one live in one place.
 */
export function ProductsEmptyState() {
  const pageLink = usePageLink();

  return (
    <div className="flex flex-col items-center gap-1 px-4 py-12 text-center whitespace-normal">
      <p className="text-sm font-medium text-neutral-950">Brak produktów na tej stronie</p>
      <a
        {...pageLink(1)}
        className="text-sm text-blue-600 underline-offset-4 hover:underline"
      >
        Wróć do pierwszej strony
      </a>
    </div>
  );
}
