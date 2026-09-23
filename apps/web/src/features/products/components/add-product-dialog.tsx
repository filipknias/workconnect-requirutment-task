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

// `light-surface` is load-bearing: without it, dark-mode tokens make the input
// borders vanish against the white card.
const CONTENT_CLASS =
  "light-surface top-0 right-0 bottom-0 left-0 max-h-none w-full max-w-none translate-x-0 translate-y-0 grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-0 rounded-none p-0 ring-0 sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:max-h-[85vh] sm:w-[calc(100%-2rem)] sm:max-w-[720px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:ring-1";

// Controlled on purpose: a `DialogClose` around the save button would close
// the dialog even when the wizard is unfinished.
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
        {/* Rendered first so it is the first tab stop, not the last. */}
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
  // State lives inside DialogContent so closing unmounts it and resets the form;
  // passing `keepMounted` to the portal would silently break that.
  const [step, setStep] = useState(1);
  const form = useWizardForm(step);
  const panel = useRef<HTMLDivElement>(null);

  const editPricing = (edit: PriceEdit) => {
    const { priceNet, priceGross, vatRate } = form.state.values;
    const next = applyPriceEdit({ priceNet, priceGross, vatRate }, edit);

    form.setFieldValue("priceNet", next.priceNet);
    form.setFieldValue("priceGross", next.priceGross);
    form.setFieldValue("vatRate", next.vatRate);
  };

  const revealStepErrors = () => {
    const schema = stepSchema(step);
    if (schema === undefined) return;
    const names = Object.keys(schema.shape) as (keyof ProductFormValues)[];

    // `flushSync` lets the query below see the `aria-invalid` just set.
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

        {/* Not the form's `isValid`: a field has no errors until a validator
            runs, so TanStack calls a blank form valid. */}
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
