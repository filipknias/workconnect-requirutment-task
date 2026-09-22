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
 * What a bordered control looks like while it is complaining: the border goes
 * red, and nothing else moves.
 *
 * It lives beside the rule that decides *when* a field may complain, because
 * the two answer the same question and a second opinion about it is how a
 * wizard ends up signalling one state three different ways. The controls that
 * are not a bordered box — the switch, the tickbox, the chips — are already
 * drawn for this in `@repo/ui` and do not take it.
 *
 * A border rather than the border-plus-ring the shared `Input` used to ship:
 * the ring is three pixels of colour outside the box, and in the wizard's 2x2
 * grids that reads as the field having grown.
 */
export const INVALID_BORDER = "aria-invalid:border-destructive";

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
