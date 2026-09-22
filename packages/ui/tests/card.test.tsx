import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../src/components/card";

function renderCard(props?: { size?: "default" | "sm" }) {
  return render(
    <Card {...props} data-testid="card">
      <CardHeader data-testid="header">
        <CardTitle>MacBook Pro 14"</CardTitle>
        <CardDescription>MBP14M3PRO</CardDescription>
        <CardAction>
          <button type="button">Edytuj</button>
        </CardAction>
      </CardHeader>
      <CardContent>9999,00 PLN</CardContent>
      <CardFooter data-testid="footer">Stopka</CardFooter>
    </Card>,
  );
}

describe("Card", () => {
  it("marks every part with its slot, which is what the layout hangs off", () => {
    renderCard();

    for (const [slot, text] of [
      ["card-title", 'MacBook Pro 14"'],
      ["card-description", "MBP14M3PRO"],
      ["card-content", "9999,00 PLN"],
      ["card-footer", "Stopka"],
    ] as const) {
      expect(screen.getByText(text)).toHaveAttribute("data-slot", slot);
    }
    expect(screen.getByRole("button", { name: "Edytuj" }).parentElement).toHaveAttribute(
      "data-slot",
      "card-action",
    );
  });

  it("drives its own spacing through a custom property", () => {
    renderCard();

    // The products cards override `--card-spacing` rather than restating
    // every padding, so the variable has to be where the classes read it.
    expect(screen.getByTestId("card").className).toContain("[--card-spacing:--spacing(4)]");
    expect(screen.getByTestId("card").className).toContain("gap-(--card-spacing)");
  });

  it("carries the size down to the parts that change with it", () => {
    renderCard({ size: "sm" });

    expect(screen.getByTestId("card")).toHaveAttribute("data-size", "sm");
    expect(screen.getByText('MacBook Pro 14"').className).toContain(
      "group-data-[size=sm]/card:text-sm",
    );
  });
});
