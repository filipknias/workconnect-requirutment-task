"use client";

import type { StandardSchemaV1 } from "@tanstack/react-form";
import { useAppForm } from "@/components/form/hooks/use-app-form";
import {
  PRODUCT_FORM_DEFAULTS,
  type ProductFormValues,
  stepSchema,
} from "@/features/products/schema/product-form-schema";

/**
 * One form for the whole wizard, not one per step. Stepping back and forth
 * then preserves what was typed without anything being copied anywhere, and
 * the values arrive at the eventual submit already in one object.
 *
 * Split out so `WizardForm` below has something to name: the type `useAppForm`
 * returns carries a dozen inferred validator parameters and is not worth
 * writing by hand. It lives here rather than beside the dialog because the
 * three step panels take that type as a prop — keeping it there would have
 * every panel importing from the component that renders it.
 */
export function useWizardForm(step: number) {
  return useAppForm({
    defaultValues: PRODUCT_FORM_DEFAULTS,
    // Everything validates under the `change` cause, including on blur — see
    // `useFieldPresentation`, which also decides when a message is allowed to
    // be seen. Only the step on screen is validated: a step-1 message has
    // nowhere to appear while step 2 is showing. There is no `onSubmit` here
    // either — there is no <form> element, and the save button is gated on the
    // same parse every step's "Dalej" is, so it hands the values over itself.
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

export type WizardForm = ReturnType<typeof useWizardForm>;
