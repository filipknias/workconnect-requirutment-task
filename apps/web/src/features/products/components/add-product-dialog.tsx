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
import { ArrowRightIcon, PlusIcon, XIcon } from "lucide-react";
import { useAppForm } from "@/components/form/hooks/use-app-form";
import {
  PRODUCT_INFO_DEFAULTS,
  productInfoSchema,
} from "@/features/products/schema/product-form-schema";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_FEATURES,
  PRODUCT_MANUFACTURERS,
} from "@/features/products/data/product-options";

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
 * The trigger and the "Dodaj nowy produkt" wizard. Only step 1 is built; steps
 * 2 and 3 are drawn in the stepper but have no panel yet.
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
  const [step] = useState(1); // the setter arrives with step 2
  const form = useAppForm({
    defaultValues: PRODUCT_INFO_DEFAULTS,
    // Everything validates under the `change` cause, including on blur — see
    // `useFieldPresentation`, which also decides when a message is allowed to
    // be seen. There is no `onSubmit`: step 1 has nothing to submit.
    validators: { onChange: productInfoSchema },
  });

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
      </div>

      <DialogFooter className="mx-0 mb-0 rounded-none border-neutral-200 bg-neutral-50 px-4 py-4 sm:rounded-b-xl">
        {/* There is no step 2 to go to yet, so this does nothing. It stays in
            the tab order and keeps its name so it is still discoverable:
            `focusableWhenDisabled` makes Base UI mark it aria-disabled instead
            of using the native disabled attribute, which would remove it from
            the tab order and hide it from anyone reading the dialog through. */}
        <Button
          disabled
          focusableWhenDisabled
          className="h-10 gap-2 rounded-full bg-blue-600 px-5 text-white hover:bg-blue-600/90 aria-disabled:cursor-not-allowed aria-disabled:bg-blue-600/60"
        >
          Dalej
          <ArrowRightIcon />
        </Button>
      </DialogFooter>
    </>
  );
}
