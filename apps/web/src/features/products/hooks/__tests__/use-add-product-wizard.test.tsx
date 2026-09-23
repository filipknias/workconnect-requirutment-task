import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useAddProductWizard } from "@/features/products/hooks/use-add-product-wizard";

function renderWizard() {
  const onSubmit = vi.fn();
  const wizard = {} as { current: ReturnType<typeof useAddProductWizard> };

  function Probe() {
    wizard.current = useAddProductWizard({ onSubmit });
    return <div ref={wizard.current.panelRef}>{wizard.current.panel}</div>;
  }

  render(<Probe />);
  return { wizard, onSubmit, next: () => act(() => wizard.current.next()) };
}

async function fillStepOne(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Nazwa produktu"), "MacBook Pro 14");
  await user.type(screen.getByLabelText("SKU produktu"), "MBP14M3PRO");
  await user.click(screen.getByLabelText("Producent"));
  await user.click(await screen.findByRole("option", { name: "Apple" }));
  await user.click(screen.getByLabelText("Kategoria"));
  await user.click(await screen.findByRole("option", { name: "Komputery" }));
}

async function goToStepThree(user: ReturnType<typeof userEvent.setup>) {
  const rendered = renderWizard();
  await fillStepOne(user);
  rendered.next();
  await user.type(screen.getByLabelText("Cena netto"), "100");
  rendered.next();
  return rendered;
}

describe("useAddProductWizard", () => {
  it("stays on step one while it is blank", () => {
    const { wizard, next } = renderWizard();

    next();

    expect(wizard.current.step).toBe(1);
  });

  it("judges only the step it is standing on", async () => {
    const user = userEvent.setup();
    const { wizard, next } = renderWizard();

    await fillStepOne(user);
    next();
    expect(wizard.current.step).toBe(2);

    next();
    expect(wizard.current.step).toBe(2);
  });

  it("calls step three complete straight away, and submits from it", async () => {
    const user = userEvent.setup();
    const { wizard, onSubmit, next } = await goToStepThree(user);

    expect(wizard.current.isLast).toBe(true);
    next();

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({
      sku: "MBP14M3PRO",
      priceNet: 100,
      priceGross: 123,
      minQuantity: 1,
      maxQuantity: 10,
    });
  });

  it("holds step three back on a limit that does not make sense", async () => {
    const user = userEvent.setup();
    const { wizard, onSubmit, next } = await goToStepThree(user);

    await user.clear(screen.getByLabelText("Minimalna ilość"));
    await user.type(screen.getByLabelText("Minimalna ilość"), "20");
    next();

    expect(wizard.current.step).toBe(3);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
