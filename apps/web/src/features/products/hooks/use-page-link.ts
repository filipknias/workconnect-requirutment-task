"use client";

import type { MouseEvent } from "react";
import { useQueryStates } from "nuqs";
import { productPageHref, productSearchParams } from "../utils/search-params";

// Paging must stay a shallow URL update, not a navigation: a server round-trip
// rebuilds the list from `PRODUCTS` and loses products added in the wizard.
export function usePageLink() {
  const [, setSearchParams] = useQueryStates(productSearchParams);

  return (page: number) => ({
    href: productPageHref(page),
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      const opensElsewhere =
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      if (event.defaultPrevented || event.button !== 0 || opensElsewhere) return;

      event.preventDefault();
      void setSearchParams({ page });
    },
  });
}
