import { render, screen } from "@testing-library/react";
import type { MouseEvent } from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../src/components/pagination";

describe("Pagination", () => {
  it("is a navigation landmark holding a list", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="/?page=1">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByRole("navigation", { name: "pagination" })).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toBeInTheDocument();
  });

  it("renders a real anchor, not a button wearing one", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    render(<PaginationLink href="/?page=2" onClick={onClick}>2</PaginationLink>);

    const link = screen.getByRole("link", { name: "2" });
    expect(link).toHaveAttribute("href", "/?page=2");
    // `nativeButton={false}` would otherwise stamp role="button" and a
    // tabIndex onto an element that is already both.
    expect(link).not.toHaveAttribute("role");
    expect(link).not.toHaveAttribute("tabindex");

    await user.click(link);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("names the current page for a screen reader, and only that one", () => {
    render(
      <>
        <PaginationLink href="/" isActive>
          1
        </PaginationLink>
        <PaginationLink href="/?page=2">2</PaginationLink>
      </>,
    );

    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(screen.getByRole("link", { name: "2" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("lets the call site translate the arrows and keep the icon", () => {
    render(
      <>
        <PaginationPrevious href="/" text="Wstecz" aria-label="Poprzednia" />
        <PaginationNext href="/?page=2" text="Dalej" aria-label="Następna" />
      </>,
    );

    expect(screen.getByRole("link", { name: "Poprzednia" })).toHaveTextContent(
      "Wstecz",
    );
    expect(screen.getByRole("link", { name: "Następna" })).toHaveTextContent(
      "Dalej",
    );
  });

  it("renders as whatever it is handed, for a control with nowhere to go", () => {
    render(
      <PaginationPrevious
        text="Wstecz"
        aria-label="Poprzednia"
        aria-disabled
        role="link"
        render={<span />}
      />,
    );

    const spent = screen.getByRole("link", { name: "Poprzednia" });
    expect(spent.tagName).toBe("SPAN");
    expect(spent).toHaveAttribute("aria-disabled", "true");
    expect(spent).not.toHaveAttribute("href");
  });

  it("hides the ellipsis from assistive technology and names it instead", () => {
    render(<PaginationEllipsis />);

    expect(screen.getByText("More pages")).toBeInTheDocument();
    expect(screen.getByText("More pages").parentElement).toHaveAttribute(
      "aria-hidden",
    );
  });
});
