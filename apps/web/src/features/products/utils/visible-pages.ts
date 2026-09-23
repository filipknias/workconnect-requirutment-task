export type PageSlot = number | "ellipsis";

const SLOTS = 7;

export function visiblePages(page: number, totalPages: number): PageSlot[] {
  if (totalPages <= SLOTS) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const last = totalPages;
  if (page <= 4) return [1, 2, 3, 4, 5, "ellipsis", last];
  if (page >= last - 3) {
    return [1, "ellipsis", last - 4, last - 3, last - 2, last - 1, last];
  }
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", last];
}
