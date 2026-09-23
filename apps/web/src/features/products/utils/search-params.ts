import { createSerializer, parseAsInteger } from "nuqs/server";

export const productSearchParams = {
  page: parseAsInteger.withDefault(1),
};

const serialize = createSerializer(productSearchParams);

export function productPageHref(page: number): string {
  return serialize("/", { page });
}
