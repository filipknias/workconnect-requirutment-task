"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Stepper, type StepperStep } from "@repo/ui/components/stepper";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, XIcon } from "lucide-react";
import { useWizardForm } from "@/features/products/hooks/use-wizard-form";
import {
  isStepComplete,
  type ProductFormValues,
  stepSchema,
} from "@/features/products/schema/product-form-schema";
import {
  applyPriceEdit,
  type PriceEdit,
} from "@/features/products/utils/recalculate-prices";
import { ProductAvailabilityStep } from "./product-availability-step";
import { ProductInfoStep } from "./product-info-step";
import { ProductPricingStep } from "./product-pricing-step";

const STEPS: StepperStep[] = [
  { title: "Informacje", description: "Dane podstawowe" },
  { title: "Cena", description: "Dane cenowe" },
  { title: "Dostępność", description: "Stany magazynowe" },
];

/**
 * Full-bleed below `sm` and a centred 720px card above it, from one set of
 * classes: the popup is a four-row grid (title, stepper, fields, footer) in
 * both, and only the fields row scrolls, so the title and the "Dalej" button
 * stay put on a phone.
 *
 * `light-surface` is what keeps the form legible for a dark-mode visitor: the
 * dialog is drawn from light-only frames, and without it every token-painted
 * detail inside — the input borders above all — resolves to the dark palette
 * and disappears against the white card. It is defined in `@repo/ui`'s
 * `globals.css`; the popup's own white and near-black then come from
 * `bg-popover`/`text-popover-foreground`, so there is nothing to hard-code.
 */
const CONTENT_CLASS =
  "light-surface top-0 right-0 bottom-0 left-0 max-h-none w-full max-w-none translate-x-0 translate-y-0 grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-0 rounded-none p-0 ring-0 sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:max-h-[85vh] sm:w-[calc(100%-2rem)] sm:max-w-[720px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:ring-1";

/**
 * The trigger and the "Dodaj nowy produkt" wizard, all three steps of it.
 *
 * `onSubmit` is handed values that have already passed every step's schema —
 * the dialog collects and validates, the caller decides what a product is for.
 * It fires before the dialog closes, so a handler can read the form state it
 * was given without racing the unmount.
 *
 * Controlled for exactly that reason: an uncontrolled `Dialog` would have to
 * be closed from a `DialogClose` wrapped around the save button, which would
 * close it whether or not the wizard was finished.
 *
 * `disablePointerDismissal` — a stray click on the backdrop should not throw
 * away a half-filled form. The X and Escape still close it.
 */
export function AddProductDialog({
  onSubmit,
}: {
  onSubmit: (values: ProductFormValues) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} disablePointerDismissal>
      <DialogTrigger
        render={
          <Button className="h-9 shrink-0 cursor-pointer gap-1.5 rounded-full bg-[#2563eb] px-4 text-neutral-50 hover:bg-[#2563eb]/80">
            <PlusIcon />
            Dodaj produkt
          </Button>
        }
      />
      <DialogContent showCloseButton={false} className={CONTENT_CLASS}>
        {/* Rendered before everything else so it is the *first* tab stop rather
            than the last, which is where the shared DialogContent's own close
            button ends up. Its name is Polish, unlike that one's. */}
        <DialogClose
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-4 right-4 cursor-pointer text-neutral-500 sm:top-5 sm:right-5"
            >
              <XIcon />
              <span className="sr-only">Zamknij</span>
            </Button>
          }
        />
        <AddProductWizard
          onSubmit={(values) => {
            onSubmit(values);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function AddProductWizard({
  onSubmit,
}: {
  onSubmit: (values: ProductFormValues) => void;
}) {
  // Everything stateful in this component lives *inside* DialogContent on
  // purpose. Base UI's DialogPortal defaults to keepMounted={false}, so closing
  // the dialog unmounts this component and the form values and the current step
  // go with it — reopening always starts from a blank step one, with no
  // form.reset() to remember to call. If anyone ever passes keepMounted, that
  // guarantee disappears silently; "starts over" in
  // ../tests/add-product-dialog.test.tsx is what catches it.
  const [step, setStep] = useState(1);
  const form = useWizardForm(step);
  const panel = useRef<HTMLDivElement>(null);

  /**
   * The one way a price, or the VAT rate, is written.
   *
   * Two of the three fields are always rewritten together — see
   * `applyPriceEdit`, which owns every rule about which — so no field handler
   * gets to set its own value directly.
   */
  const editPricing = (edit: PriceEdit) => {
    const { priceNet, priceGross, vatRate } = form.state.values;
    const next = applyPriceEdit({ priceNet, priceGross, vatRate }, edit);

    form.setFieldValue("priceNet", next.priceNet);
    form.setFieldValue("priceGross", next.priceGross);
    form.setFieldValue("vatRate", next.vatRate);
  };

  /**
   * What "Dalej" does when the step is not finished.
   *
   * Until it is pressed the step is silent: a field keeps its message hidden
   * until it has been finished with once (see `use-field-presentation.ts`),
   * and an untouched one has never been finished with. Pressing the button
   * counts as finishing with the whole step — every field of it is marked,
   * revalidated, and the first one that turns out to be wrong takes focus. So
   * the press answers the only question the visitor is asking, which is what
   * is stopping them.
   *
   * The field list comes off the step's own schema so there is no second copy
   * to drift, and the first invalid control is found by querying the panel
   * rather than by name — document order is visual order, and the fields carry
   * generated ids rather than names. `flushSync` is what makes that query see
   * the marks this function has just made.
   */
  const revealStepErrors = () => {
    const schema = stepSchema(step);
    if (schema === undefined) return;
    const names = Object.keys(schema.shape) as (keyof ProductFormValues)[];

    flushSync(() => {
      for (const name of names) {
        form.setFieldMeta(name, (meta) => ({
          ...meta,
          isTouched: true,
          isBlurred: true,
        }));
        form.validateField(name, "change");
      }
    });

    panel.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  };

  // The last step is the one with nothing after it to validate. Derived from
  // the schemas rather than from STEPS so the footer can never offer to move
  // on to a step that has no panel: a step with no schema reports itself
  // incomplete, which leaves the button inert instead.
  const isLastStep = stepSchema(step + 1) === undefined;

  return (
    <>
      <DialogHeader className="border-b border-neutral-200 px-4 py-5">
        <DialogTitle className="text-lg font-semibold">
          Dodaj nowy produkt
        </DialogTitle>
      </DialogHeader>

      <Stepper
        steps={STEPS}
        currentStep={step}
        aria-label="Postęp dodawania produktu"
        className="border-b border-neutral-200 px-4 py-5"
      />

      <div ref={panel} className="overflow-y-auto px-4 pt-5 pb-8">
        {step === 1 && <ProductInfoStep form={form} />}
        {step === 2 && <ProductPricingStep form={form} onEdit={editPricing} />}
        {step === 3 && <ProductAvailabilityStep form={form} />}
      </div>

      <DialogFooter className="mx-0 mb-0 flex-row justify-between rounded-none border-neutral-200 bg-neutral-50 px-4 py-4 sm:justify-between sm:rounded-b-xl">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="h-10 cursor-pointer gap-2 rounded-full border-neutral-200 bg-white px-5 text-neutral-900 hover:bg-neutral-100"
          >
            <ArrowLeftIcon />
            Wstecz
          </Button>
        )}

        {/* An ordinary button, never disabled and never dimmed. It always has
            something to do: move on, or say what is stopping it. A control
            drawn as unavailable that answers a click is the worse of both —
            `aria-disabled` promises assistive technology the press does
            nothing, and `cursor-not-allowed` promises everyone else the same.
            Whether the step is finished is a fact about the fields, and the
            fields are where it is now shown.

            Completeness is therefore read on press rather than subscribed to:
            nothing here renders differently for it, so the footer has no
            reason to re-render on every keystroke.

            `isStepComplete` rather than the form's own `isValid`: TanStack
            derives that from errors, and a field has no errors until a
            validator has run, so a blank form calls itself valid. Parsing the
            same schema the fields are validated against also means this
            button and the messages can never disagree. */}
        <Button
          onClick={() => {
            if (!isStepComplete(step, form.state.values)) {
              revealStepErrors();
              return;
            }
            if (isLastStep) onSubmit(form.state.values);
            else setStep(step + 1);
          }}
          className="ml-auto h-10 cursor-pointer gap-2 rounded-full bg-blue-600 px-5 text-white hover:bg-blue-600/90"
        >
          {/* The frame gives the save button no arrow — it does not lead
              anywhere. */}
          {isLastStep ? (
            "Zapisz produkt"
          ) : (
            <>
              Dalej
              <ArrowRightIcon />
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
