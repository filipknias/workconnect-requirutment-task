import { describe, expect, it } from "vitest";
import { visiblePages } from "@/features/products/utils/visible-pages";

describe("visiblePages", () => {
  it("shows every page while they all fit", () => {
    expect(visiblePages(1, 1)).toEqual([1]);
    expect(visiblePages(1, 2)).toEqual([1, 2]);
    expect(visiblePages(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("windows around the current page once they do not", () => {
    expect(visiblePages(11, 21)).toEqual([
      1,
      "ellipsis",
      10,
      11,
      12,
      "ellipsis",
      21,
    ]);
  });

  it("straightens the run out near either end, rather than hiding one page behind a gap", () => {
    expect(visiblePages(1, 21)).toEqual([1, 2, 3, 4, 5, "ellipsis", 21]);
    expect(visiblePages(4, 21)).toEqual([1, 2, 3, 4, 5, "ellipsis", 21]);
    expect(visiblePages(21, 21)).toEqual([1, "ellipsis", 17, 18, 19, 20, 21]);
    expect(visiblePages(18, 21)).toEqual([1, "ellipsis", 17, 18, 19, 20, 21]);
  });

  it("opens a gap as soon as one would hide more than a single page", () => {
    expect(visiblePages(5, 21)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 21]);
    expect(visiblePages(17, 21)).toEqual([
      1,
      "ellipsis",
      16,
      17,
      18,
      "ellipsis",
      21,
    ]);
  });

  it("keeps the row exactly as wide whatever page it is on", () => {
    const widths = new Set(
      Array.from({ length: 21 }, (_, index) => visiblePages(index + 1, 21).length),
    );
    expect([...widths]).toEqual([7]);
  });

  it("puts a page outside the catalogue at the end it is nearest", () => {
    expect(visiblePages(99, 2)).toEqual([1, 2]);
    expect(visiblePages(99, 21)).toEqual([1, "ellipsis", 17, 18, 19, 20, 21]);
    expect(visiblePages(0, 21)).toEqual([1, 2, 3, 4, 5, "ellipsis", 21]);
  });
});
