import { createSerializer, parseAsInteger } from "nuqs/server";

/**
 * The listing's URL state, declared once. Paging is client-only — the
 * catalogue lives in React state that a server navigation would throw away —
 * so this is read through `useQueryStates` and nothing loads it on the server.
 * A deep link still works: nuqs seeds the hook from the URL on mount.
 */
export const productSearchParams = {
  page: parseAsInteger.withDefault(1),
};

const serialize = createSerializer(productSearchParams);

/**
 * Href for a page of the listing. `clearOnDefault` is on by default in nuqs v2,
 * so page one serialises back to a bare `/` rather than `/?page=1`.
 *
 * The paging controls are real anchors that intercept their own click — see
 * `../hooks/use-page-link.ts` — so this is what a visitor copies, bookmarks or
 * opens in a second tab, even though clicking it never leaves the page.
 */
export function productPageHref(page: number): string {
  return serialize("/", { page });
}
