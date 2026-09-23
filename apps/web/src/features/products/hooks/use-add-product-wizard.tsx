"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { StandardSchemaV1 } from "@tanstack/react-form";
import { useAppForm } from "@/components/form/hooks/use-app-form";
import { ProductAvailabilityStep } from "@/features/products/components/product-availability-step";
import { ProductInfoStep } from "@/features/products/components/product-info-step";
import { ProductPricingStep } from "@/features/products/components/product-pricing-step";
import {
  PRODUCT_FORM_DEFAULTS,
  productAvailabilitySchema,
  productInfoSchema,
  productPricingSchema,
  type ProductFormValues,
} from "@/features/products/schema/product-form-schema";
import type { Product } from "@/features/products/types/product";
import { parseProduct } from "@/features/products/utils/parse-product";

const STEPS = [
  {
    title: "Informacje",
    description: "Dane podstawowe",
    schema: productInfoSchema,
    Panel: ProductInfoStep,
  },
  {
    title: "Cena",
    description: "Dane cenowe",
    schema: productPricingSchema,
    Panel: ProductPricingStep,
  },
  {
    title: "Dostępność",
    description: "Stany magazynowe",
    schema: productAvailabilitySchema,
    Panel: ProductAvailabilityStep,
  },
];

type StepSchema =
  | typeof productInfoSchema
  | typeof productPricingSchema
  | typeof productAvailabilitySchema;

function useStepForm(schema: StepSchema) {
  return useAppForm({
    defaultValues: PRODUCT_FORM_DEFAULTS,
    validators: {
      // A type-only cast: a step schema lacks the other steps' fields, and Zod
      // ignores them at runtime, which is what per-step validation needs.
      onChange: schema as StandardSchemaV1<ProductFormValues>,
    },
  });
}

export type WizardForm = ReturnType<typeof useStepForm>;

export function useAddProductWizard({
  onSubmit,
}: {
  onSubmit: (product: Product) => void;
}) {
  const [step, setStep] = useState(1);
  const { schema, Panel } = STEPS[step - 1]!;
  const form = useStepForm(schema);
  const panelRef = useRef<HTMLDivElement>(null);
  const isLast = step === STEPS.length;

  const revealErrors = () => {
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

    panelRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  };

  const next = () => {
    // Parses the schema instead of reading TanStack's `isValid`, which is true
    // on a blank form because no validator has run yet.
    if (!schema.safeParse(form.state.values).success) {
      revealErrors();
      return;
    }
    if (isLast) onSubmit(parseProduct(form.state.values));
    else setStep(step + 1);
  };

  return {
    steps: STEPS,
    step,
    panel: <Panel form={form} />,
    panelRef,
    isLast,
    next,
    back: () => setStep(step - 1),
  };
}
