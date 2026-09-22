/** A numbered button, or the gap between two of them. */
export type PageSlot = number | "ellipsis";

/** First, last, the current page and its two neighbours, and two gaps. */
const SLOTS = 7;

/**
 * Which paging controls to draw for `page` out of `totalPages`.
 *
 * Up to seven pages every number fits, so every number is shown. Past that the
 * row is always exactly seven slots wide — first, last, the current page with
 * a neighbour either side, and an ellipsis standing in for whatever that skips
 * — so the caption beside it never shifts as the visitor pages through.
 *
 * Near either end the ellipsis would hide one page and take its width doing
 * it, so the run is straightened out instead: pages one to five, or the last
 * five. `page` is reported as asked elsewhere in the listing, so a number
 * outside the catalogue lands in whichever end it is nearest.
 */
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
