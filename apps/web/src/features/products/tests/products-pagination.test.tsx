import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { withNuqsTestingAdapter, type OnUrlUpdateFunction } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";
import { ProductsPagination } from "@/features/products/components/products-pagination";

/**
 * The controls are anchors that answer their own click with nuqs' shallow
 * setter, so both halves are worth testing: the `href` a visitor can copy, and
 * the URL update a plain click produces instead of a navigation.
 */
function renderPagination(
  props: { page: number; totalPages: number },
  onUrlUpdate?: OnUrlUpdateFunction,
) {
  return render(<ProductsPagination {...props} />, {
    wrapper: withNuqsTestingAdapter({ onUrlUpdate }),
  });
}

describe("ProductsPagination", () => {
  it("links page one back to the bare path, since nuqs drops the default", () => {
    renderPagination({ page: 2, totalPages: 2 });

    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /poprzedniej/ })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("marks the current page and inerts the arrow that has nowhere to go", () => {
    renderPagination({ page: 1, totalPages: 2 });

    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.queryByRole("link", { name: /poprzedniej/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /następnej/ })).toHaveAttribute(
      "href",
      "/?page=2",
    );
  });

  it("points the back arrow at the last real page from beyond the end", () => {
    renderPagination({ page: 99, totalPages: 2 });

    expect(screen.getByRole("link", { name: /poprzedniej/ })).toHaveAttribute(
      "href",
      "/?page=2",
    );
    expect(screen.queryByRole("link", { name: /następnej/ })).not.toBeInTheDocument();
  });

  it("shows both arrow labels — the mobile frame is narrower than sm", () => {
    renderPagination({ page: 1, totalPages: 2 });

    expect(screen.getByText("Wstecz")).toBeVisible();
    expect(screen.getByText("Dalej")).toBeVisible();
  });

  it("writes the page to the URL instead of following the link", async () => {
    const user = userEvent.setup();
    const onUrlUpdate = vi.fn();
    renderPagination({ page: 1, totalPages: 2 }, onUrlUpdate);

    await user.click(screen.getByRole("link", { name: "2" }));

    expect(onUrlUpdate).toHaveBeenCalledOnce();
    expect(onUrlUpdate.mock.calls[0]?.[0].queryString).toBe("?page=2");
    // Shallow — this is the whole reason paging stopped being a navigation:
    // the catalogue's React state has to survive a page change.
    expect(onUrlUpdate.mock.calls[0]?.[0].options.shallow).toBe(true);
  });

  it("clears the param again on the way back to page one", async () => {
    const user = userEvent.setup();
    const onUrlUpdate = vi.fn();
    renderPagination({ page: 2, totalPages: 2 }, onUrlUpdate);

    await user.click(screen.getByRole("link", { name: "1" }));

    expect(onUrlUpdate.mock.calls[0]?.[0].queryString).toBe("");
  });

  it("leaves a modified click to the browser, so the page still opens in a new tab", async () => {
    const user = userEvent.setup();
    const onUrlUpdate = vi.fn();
    renderPagination({ page: 1, totalPages: 2 }, onUrlUpdate);

    await user.keyboard("{Meta>}");
    await user.click(screen.getByRole("link", { name: "2" }));
    await user.keyboard("{/Meta}");

    expect(onUrlUpdate).not.toHaveBeenCalled();
  });
});
