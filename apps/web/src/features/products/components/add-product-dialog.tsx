"use client";

import { useState } from "react";
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
import { FieldGroup } from "@repo/ui/components/field";
import { Stepper, type StepperStep } from "@repo/ui/components/stepper";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, XIcon } from "lucide-react";
import type { StandardSchemaV1 } from "@tanstack/react-form";
import { useAppForm } from "@/components/form/hooks/use-app-form";
import {
  isStepComplete,
  PRODUCT_FORM_DEFAULTS,
  type ProductFormValues,
  stepSchema,
} from "@/features/products/schema/product-form-schema";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CURRENCIES,
  PRODUCT_FEATURES,
  PRODUCT_MANUFACTURERS,
  PRODUCT_VAT_RATES,
} from "@/features/products/data/product-options";
import {
  applyPriceEdit,
  type PriceEdit,
} from "@/features/products/utils/recalculate-prices";

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
 * The trigger and the "Dodaj nowy produkt" wizard. Steps 1 and 2 are built;
 * step 3 is drawn in the stepper but has no panel yet.
 *
 * `disablePointerDismissal` — a stray click on the backdrop should not throw
 * away a half-filled form. The X and Escape still close it.
 */
export function AddProductDialog() {
  return (
    <Dialog disablePointerDismissal>
      <DialogTrigger
        render={
          <Button className="h-9 shrink-0 gap-1.5 rounded-full bg-[#2563eb] px-4 text-neutral-50 hover:bg-[#2563eb]/80">
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
              className="absolute top-4 right-4 text-neutral-500 sm:top-5 sm:right-5"
            >
              <XIcon />
              <span className="sr-only">Zamknij</span>
            </Button>
          }
        />
        <AddProductWizard />
      </DialogContent>
    </Dialog>
  );
}

function AddProductWizard() {
  // Everything stateful in this component lives *inside* DialogContent on
  // purpose. Base UI's DialogPortal defaults to keepMounted={false}, so closing
  // the dialog unmounts this component and the form values and the current step
  // go with it — reopening always starts from a blank step one, with no
  // form.reset() to remember to call. If anyone ever passes keepMounted, that
  // guarantee disappears silently; "starts over" in
  // ../tests/add-product-dialog.test.tsx is what catches it.
  const [step, setStep] = useState(1);
  const form = useWizardForm(step);

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

  // Where "Dalej" leads, or undefined when there is nowhere to go: step 3 is
  // drawn in the stepper but has no schema and no panel, so the button on step
  // 2 stays inert however complete the prices are. Building step 3 turns it on
  // by adding its schema, with nothing to change here.
  const nextStep = stepSchema(step + 1) === undefined ? undefined : step + 1;

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

      <div className="overflow-y-auto px-4 pt-5 pb-8">
        {step === 1 && <ProductInfoStep form={form} />}
        {step === 2 && <ProductPricingStep form={form} onEdit={editPricing} />}
      </div>

      <DialogFooter className="mx-0 mb-0 flex-row justify-between rounded-none border-neutral-200 bg-neutral-50 px-4 py-4 sm:justify-between sm:rounded-b-xl">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="h-10 gap-2 rounded-full border-neutral-200 bg-white px-5 text-neutral-900 hover:bg-neutral-100"
          >
            <ArrowLeftIcon />
            Wstecz
          </Button>
        )}

        {/* Gated on parsing the values, not on the form's own `isValid`:
            TanStack derives that from errors, and a field has no errors until
            a validator has run, so a blank form calls itself valid and this
            button would be live before a word is typed. Parsing the same
            schema the fields are validated against also means the button and
            the messages can never disagree.

            `focusableWhenDisabled` makes Base UI mark it aria-disabled rather
            than use the native attribute, which would drop it out of the tab
            order and hide it from anyone reading the dialog through. */}
        <form.Subscribe selector={(state) => isStepComplete(step, state.values)}>
          {(complete) => (
            <Button
              disabled={!complete || nextStep === undefined}
              focusableWhenDisabled
              onClick={() => {
                if (nextStep !== undefined) setStep(nextStep);
              }}
              className="ml-auto h-10 gap-2 rounded-full bg-blue-600 px-5 text-white hover:bg-blue-600/90 aria-disabled:cursor-not-allowed aria-disabled:bg-blue-600/60"
            >
              Dalej
              <ArrowRightIcon />
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </>
  );
}

/**
 * One form for the whole wizard, not one per step. Stepping back and forth
 * then preserves what was typed without anything being copied anywhere, and
 * the values arrive at the eventual submit already in one object.
 *
 * Split out so `WizardForm` below has something to name: the type `useAppForm`
 * returns carries a dozen inferred validator parameters and is not worth
 * writing by hand.
 */
function useWizardForm(step: number) {
  return useAppForm({
    defaultValues: PRODUCT_FORM_DEFAULTS,
    // Everything validates under the `change` cause, including on blur — see
    // `useFieldPresentation`, which also decides when a message is allowed to
    // be seen. Only the step on screen is validated: a step-1 message has
    // nowhere to appear while step 2 is showing. There is no `onSubmit`:
    // nothing is submitted until step 3 exists.
    validators: {
      // The cast is about the declaration, not the behaviour. A step's schema
      // describes only its own fields, so its inferred input type is missing
      // the other step's — which is the whole of what TanStack type-checks
      // here. At runtime Zod ignores the keys it was not given, which is
      // exactly what a per-step validator is meant to do.
      onChange: stepSchema(step) as StandardSchemaV1<ProductFormValues>,
    },
  });
}

type WizardForm = ReturnType<typeof useWizardForm>;

/** Step 1 — "Informacje / Dane podstawowe". */
function ProductInfoStep({ form }: { form: WizardForm }) {
  return (
    <FieldGroup>
      <div className="grid gap-5 md:grid-cols-2">
        <form.AppField name="name">
          {(field) => (
            <field.TextField
              label="Nazwa produktu"
              placeholder="np. MacBook Pro 14"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="sku">
          {(field) => (
            <field.TextField
              label="SKU produktu"
              placeholder="np. MBP14M3PRO"
              autoComplete="off"
              required
            />
          )}
        </form.AppField>
      </div>

      {/* The frames label this one "Nazwa produktu" — a copy/paste of the
          first field, in both the desktop and the mobile export. Corrected
          deliberately: two controls with the same name are indistinguishable
          to anyone navigating by label, and the placeholder the design gives
          it ("Krótki opis produktu") says what it is actually for. */}
      <form.AppField name="description">
        {(field) => (
          <field.TextareaField
            label="Opis produktu"
            placeholder="Krótki opis produktu"
          />
        )}
      </form.AppField>

      <div className="grid gap-5 md:grid-cols-2">
        <form.AppField name="manufacturer">
          {(field) => (
            <field.SelectField
              label="Producent"
              placeholder="Wybierz producenta"
              options={PRODUCT_MANUFACTURERS}
              required
            />
          )}
        </form.AppField>
        <form.AppField name="category">
          {(field) => (
            <field.SelectField
              label="Kategoria"
              placeholder="Wybierz kategorię"
              options={PRODUCT_CATEGORIES}
              required
            />
          )}
        </form.AppField>
      </div>

      <form.AppField name="features">
        {(field) => (
          <field.ChipGroupField
            legend="Cechy produktu"
            options={PRODUCT_FEATURES}
          />
        )}
      </form.AppField>
    </FieldGroup>
  );
}

/**
 * Step 2 — "Cena / Dane cenowe". Four fields in the frame's 2x2 grid, stacked
 * on a phone.
 *
 * Both prices are real inputs: the frame gives no hint which is derived, and
 * a shop that knows its shelf price should not have to divide by 1.23 to enter
 * it. Whichever one is typed into, `onEdit` rewrites the other.
 */
function ProductPricingStep({
  form,
  onEdit,
}: {
  form: WizardForm;
  onEdit: (edit: PriceEdit) => void;
}) {
  return (
    <FieldGroup>
      <div className="grid gap-5 md:grid-cols-2">
        <form.AppField name="priceNet">
          {(field) => (
            <field.NumberField
              label="Cena netto"
              placeholder="0.00"
              required
              onValueChange={(value) => onEdit({ field: "priceNet", value })}
            />
          )}
        </form.AppField>
        <form.AppField name="priceGross">
          {(field) => (
            <field.NumberField
              label="Cena brutto"
              placeholder="0.00"
              required
              onValueChange={(value) => onEdit({ field: "priceGross", value })}
            />
          )}
        </form.AppField>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* The frame draws this one without a chevron, unlike "Waluta" beside
            it — two controls that behave identically, drawn as if only one of
            them opens. Corrected the same way the duplicated label on step 1
            was: it is a normal select, and it looks like one. */}
        <form.AppField name="vatRate">
          {(field) => (
            <field.SelectField
              label="Stawka VAT"
              options={PRODUCT_VAT_RATES}
              required
              onValueChange={(value) => onEdit({ field: "vatRate", value })}
            />
          )}
        </form.AppField>
        <form.AppField name="currency">
          {(field) => (
            <field.SelectField
              label="Waluta"
              options={PRODUCT_CURRENCIES}
              required
            />
          )}
        </form.AppField>
      </div>
    </FieldGroup>
  );
}
