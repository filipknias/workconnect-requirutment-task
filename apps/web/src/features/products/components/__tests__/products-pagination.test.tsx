import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { withNuqsTestingAdapter, type OnUrlUpdateFunction } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";
import { ProductsPagination } from "@/features/products/components/products-pagination";

function renderPagination(
  props: { page: number; totalPages: number },
  onUrlUpdate?: OnUrlUpdateFunction,
) {
  return render(<ProductsPagination {...props} />, {
    wrapper: withNuqsTestingAdapter({ onUrlUpdate }),
  });
}

function numberedPages() {
  return screen
    .getAllByRole("link")
    .map((link) => link.textContent ?? "")
    .filter((text) => /^\d+$/.test(text));
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
    const spent = screen.getByRole("link", { name: /poprzedniej/ });
    expect(spent).toHaveAttribute("aria-disabled", "true");
    expect(spent).not.toHaveAttribute("href");
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
    expect(
      screen.getByRole("link", { name: /następnej/ }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("shows both arrow labels — the mobile frame is narrower than sm", () => {
    renderPagination({ page: 1, totalPages: 2 });

    expect(screen.getByText("Wstecz")).toBeVisible();
    expect(screen.getByText("Dalej")).toBeVisible();
  });

  it("numbers every page while they all fit, which is what the catalogue does today", () => {
    renderPagination({ page: 1, totalPages: 2 });

    expect(numberedPages()).toEqual(["1", "2"]);
    expect(screen.queryByText("More pages")).not.toBeInTheDocument();
  });

  it("windows a long catalogue down to a fixed seven slots", () => {
    const { rerender } = renderPagination({ page: 11, totalPages: 21 });

    expect(numberedPages()).toEqual(["1", "10", "11", "12", "21"]);
    expect(screen.getAllByText("More pages")).toHaveLength(2);

    rerender(<ProductsPagination page={1} totalPages={21} />);
    expect(numberedPages()).toEqual(["1", "2", "3", "4", "5", "21"]);
    expect(screen.getAllByText("More pages")).toHaveLength(1);

    rerender(<ProductsPagination page={21} totalPages={21} />);
    expect(numberedPages()).toEqual(["1", "17", "18", "19", "20", "21"]);
    expect(screen.getAllByText("More pages")).toHaveLength(1);
  });

  it("writes the page to the URL instead of following the link", async () => {
    const user = userEvent.setup();
    const onUrlUpdate = vi.fn();
    renderPagination({ page: 1, totalPages: 2 }, onUrlUpdate);

    await user.click(screen.getByRole("link", { name: "2" }));

    expect(onUrlUpdate).toHaveBeenCalledOnce();
    expect(onUrlUpdate.mock.calls[0]?.[0].queryString).toBe("?page=2");
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
