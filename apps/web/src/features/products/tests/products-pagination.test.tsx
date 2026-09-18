import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductsPagination } from "@/features/products/components/products-pagination";

describe("ProductsPagination", () => {
  it("links page one back to the bare path, since nuqs drops the default", () => {
    render(<ProductsPagination page={2} totalPages={2} />);

    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /poprzedniej/ })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("marks the current page and inerts the arrow that has nowhere to go", () => {
    render(<ProductsPagination page={1} totalPages={2} />);

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
    render(<ProductsPagination page={99} totalPages={2} />);

    expect(screen.getByRole("link", { name: /poprzedniej/ })).toHaveAttribute(
      "href",
      "/?page=2",
    );
    expect(screen.queryByRole("link", { name: /następnej/ })).not.toBeInTheDocument();
  });

  it("shows both arrow labels — the mobile frame is narrower than sm", () => {
    render(<ProductsPagination page={1} totalPages={2} />);

    expect(screen.getByText("Wstecz")).toBeVisible();
    expect(screen.getByText("Dalej")).toBeVisible();
  });
});
