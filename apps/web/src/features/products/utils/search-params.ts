import { createLoader, createSerializer, parseAsInteger } from "nuqs/server";

export const productSearchParams = {
  page: parseAsInteger.withDefault(1),
};

export const loadProductSearchParams = createLoader(productSearchParams);

const serialize = createSerializer(productSearchParams);

/**
 * Href for a page of the listing. `clearOnDefault` is on by default in nuqs v2,
 * so page one serialises back to a bare `/` rather than `/?page=1`.
 */
export function productPageHref(page: number): string {
  return serialize("/", { page });
}
