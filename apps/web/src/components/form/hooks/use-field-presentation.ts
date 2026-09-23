"use client";

import { useId } from "react";
import { useFieldContext } from "../context/field-context";

export type RevealErrorsOn = "blur" | "touch";

export const INVALID_BORDER = "aria-invalid:border-destructive";

export function useFieldPresentation(revealOn: RevealErrorsOn) {
  const field = useFieldContext<unknown>();
  const prefix = useId();

  const { isBlurred, isTouched, errors } = field.state.meta;
  const revealed = revealOn === "blur" ? isBlurred : isTouched;
  const error = revealed ? firstMessage(errors) : undefined;

  const id = `${prefix}${field.name}`;
  const errorId = `${id}-error`;

  return {
    id,
    errorId,
    error,
    invalid: error !== undefined,
    describedBy: error === undefined ? undefined : errorId,
    // Re-validate under `change`: TanStack keeps one error per cause, so a
    // `blur`-cause error would stay stale until the next blur.
    handleBlur: () => {
      field.handleBlur();
      void field.validate("change");
    },
  };
}

function firstMessage(errors: readonly unknown[]): string | undefined {
  for (const error of errors) {
    if (typeof error === "string") return error;
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return error.message;
    }
  }
  return undefined;
}
