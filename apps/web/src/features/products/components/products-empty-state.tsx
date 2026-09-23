"use client";

import { usePageLink } from "../hooks/use-page-link";

export function ProductsEmptyState({ page }: { page: number }) {
  const pageLink = usePageLink();

  return (
    <div className="flex flex-col items-center gap-1 px-4 py-12 text-center whitespace-normal">
      <p className="text-sm font-medium text-neutral-950">Brak produktów na tej stronie</p>
      {page > 1 && (
        <a
          {...pageLink(1)}
          className="text-sm text-blue-600 underline-offset-4 hover:underline"
        >
          Wróć do pierwszej strony
        </a>
      )}
    </div>
  );
}
