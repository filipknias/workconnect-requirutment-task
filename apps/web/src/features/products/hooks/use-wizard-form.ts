"use client";

import type { StandardSchemaV1 } from "@tanstack/react-form";
import { useAppForm } from "@/components/form/hooks/use-app-form";
import {
  PRODUCT_FORM_DEFAULTS,
  type ProductFormValues,
  stepSchema,
} from "@/features/products/schema/product-form-schema";

export function useWizardForm(step: number) {
  return useAppForm({
    defaultValues: PRODUCT_FORM_DEFAULTS,
    validators: {
      // A type-only cast: a step schema lacks the other steps' fields, and Zod
      // ignores them at runtime, which is what per-step validation needs.
      onChange: stepSchema(step) as StandardSchemaV1<ProductFormValues>,
    },
  });
}

export type WizardForm = ReturnType<typeof useWizardForm>;
