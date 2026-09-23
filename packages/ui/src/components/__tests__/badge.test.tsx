import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "../badge";

describe("Badge", () => {
  it("renders a span by default", () => {
    render(<Badge>Dostępny</Badge>);

    const badge = screen.getByText("Dostępny");
    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveAttribute("data-slot", "badge");
  });

  it("records which variant it was drawn as", () => {
    render(<Badge variant="destructive">Niedostępny</Badge>);

    expect(screen.getByText("Niedostępny")).toHaveAttribute(
      "data-variant",
      "destructive",
    );
  });

  it("keeps the caller's classes alongside its own", () => {
    render(<Badge className="bg-[#16a34a]/10">Dostępny</Badge>);

    const badge = screen.getByText("Dostępny");
    expect(badge.className).toContain("bg-[#16a34a]/10");
    expect(badge.className).toContain("inline-flex");
  });

  it("becomes whatever it is told to render as", () => {
    render(
      <Badge render={<a href="/produkty" />}>
        Zobacz
      </Badge>,
    );

    const link = screen.getByRole("link", { name: "Zobacz" });
    expect(link).toHaveAttribute("href", "/produkty");
    expect(link).toHaveAttribute("data-slot", "badge");
  });
});
