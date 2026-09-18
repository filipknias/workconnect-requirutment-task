"use client";

import { useId } from "react";
import { useFieldContext } from "../context/field-context";

/**
 * When a field is allowed to start complaining.
 *
 * `blur` suits anything you type into. `touch` is for controls with no useful
 * blur of their own — a select moves focus into its popup, and a chip group is
 * a handful of separate checkboxes you tab between.
 */
export type RevealErrorsOn = "blur" | "touch";

/**
 * Everything a bound field needs to present itself: the ids that tie its label,
 * control and error message together, and the one error message it should be
 * showing right now.
 *
 * Validation runs from the first keystroke, but the message stays hidden until
 * the user has finished with the field once — being told the name is too short
 * while typing the third letter of it is noise. After that first reveal the
 * message tracks the value live, so correcting a field clears it immediately.
 * That rule lives here and nowhere else.
 */
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
    /** Undefined unless there is a message, so it never points at nothing. */
    describedBy: error === undefined ? undefined : errorId,
    /**
     * Call when the user is done with the field.
     *
     * It marks the field blurred, which is what allows a message to show at
     * all, and then re-runs validation under the `change` cause. The second
     * half matters: TanStack keeps one error per cause, so a message produced
     * by a `blur` validator would sit there unchanged until the *next* blur —
     * the field would go on complaining while the user fixes it. Validating
     * everything under `change` keeps the single message live.
     */
    handleBlur: () => {
      field.handleBlur();
      void field.validate("change");
    },
  };
}

/**
 * Zod reports every failing check; the schema declares them from the broadest
 * ("required") to the narrowest, so the first one is the one worth showing.
 */
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
