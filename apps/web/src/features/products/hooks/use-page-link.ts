"use client";

import type { MouseEvent } from "react";
import { useQueryStates } from "nuqs";
import { productPageHref, productSearchParams } from "../utils/search-params";

/**
 * The props that turn an `<a>` into a paging control: `href` and `onClick`,
 * for whichever page it points at.
 *
 * Paging cannot be a navigation any more. The catalogue is client state now
 * that the wizard can add to it, and a server round-trip would rebuild the
 * page from `PRODUCTS` and lose whatever was just added. So the click is
 * intercepted and answered with nuqs' setter, which rewrites the URL shallowly
 * — the address bar stays honest, the React tree stays mounted.
 *
 * It stays an anchor rather than becoming a button because the destination is
 * a real, linkable URL: middle-click, ⌘-click and "open in new tab" still work,
 * and those are exactly the clicks left alone below.
 *
 * Returns a function rather than taking the page directly — a list of pages
 * renders one control each, and a hook cannot be called from inside that loop.
 */
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
