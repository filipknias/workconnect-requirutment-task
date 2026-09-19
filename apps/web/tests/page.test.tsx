import { render, screen } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

/**
 * The one test that exercises the whole route: the seed data, the paging seam
 * and both layouts at once. `Home` is a plain server shell now — the page
 * number is read on the client, so it comes in through the nuqs adapter
 * rather than through `searchParams`.
 */
const renderHome = (searchParams: Record<string, string> = {}) =>
  render(<Home />, { wrapper: withNuqsTestingAdapter({ searchParams }) });

describe("Home", () => {
  it("renders the catalogue header and the first page of products", () => {
    renderHome();

    expect(
      screen.getByRole("heading", { level: 1, name: "Produkty" }),
    ).toBeInTheDocument();
    expect(screen.getByText("7 produktów w katalogu")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Dodaj produkt/ })).toBeInTheDocument();

    // Both layouts render; CSS picks one at `lg`.
    expect(screen.getAllByText('MacBook Pro 14"')).toHaveLength(2);
    expect(screen.queryByText("Dell UltraSharp U2723QE")).not.toBeInTheDocument();
  });

  it("reads the page out of the search params", () => {
    renderHome({ page: "2" });

    expect(screen.getAllByText("Dell UltraSharp U2723QE")).toHaveLength(2);
    expect(screen.queryByText('MacBook Pro 14"')).not.toBeInTheDocument();
  });

  it("shows the empty state in both layouts for a page that does not exist", () => {
    renderHome({ page: "99" });

    expect(screen.getAllByText("Brak produktów na tej stronie")).toHaveLength(2);
    expect(screen.queryByText("Dell UltraSharp U2723QE")).not.toBeInTheDocument();
    // The header still counts the whole catalogue, not the empty page.
    expect(screen.getByText("7 produktów w katalogu")).toBeInTheDocument();
  });
});
