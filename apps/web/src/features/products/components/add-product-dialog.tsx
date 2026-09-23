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
import { Stepper } from "@repo/ui/components/stepper";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, XIcon } from "lucide-react";
import { useAddProductWizard } from "@/features/products/hooks/use-add-product-wizard";
import type { ProductFormValues } from "@/features/products/schema/product-form-schema";

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
  const { steps, step, panel, panelRef, isLast, next, back } =
    useAddProductWizard({ onSubmit });

  return (
    <>
      <DialogHeader className="border-b border-neutral-200 px-4 py-5">
        <DialogTitle className="text-lg font-semibold">
          Dodaj nowy produkt
        </DialogTitle>
      </DialogHeader>

      <Stepper
        steps={steps}
        currentStep={step}
        aria-label="Postęp dodawania produktu"
        className="border-b border-neutral-200 px-4 py-5"
      />

      <div ref={panelRef} className="overflow-y-auto px-4 pt-5 pb-8">
        {panel}
      </div>

      <DialogFooter className="mx-0 mb-0 flex-row justify-between rounded-none border-neutral-200 bg-neutral-50 px-4 py-4 sm:justify-between sm:rounded-b-xl">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={back}
            className="h-10 cursor-pointer gap-2 rounded-full border-neutral-200 bg-white px-5 text-neutral-900 hover:bg-neutral-100"
          >
            <ArrowLeftIcon />
            Wstecz
          </Button>
        )}

        <Button
          onClick={next}
          className="ml-auto h-10 cursor-pointer gap-2 rounded-full bg-blue-600 px-5 text-white hover:bg-blue-600/90"
        >
          {isLast ? (
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
