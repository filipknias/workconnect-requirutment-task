"use client";

import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { useFieldContext } from "./context/field-context";
import { useFieldPresentation } from "./hooks/use-field-presentation";

/**
 * A numeric field bound to the enclosing `form.AppField`. The form stores a
 * `number`, or `null` while the box is empty — `TextField` cannot back this:
 * it is hardwired to a `string` field, and a price that lives in the form as a
 * string has to be parsed by everything that reads it.
 *
 * `null` rather than `0` for empty is the whole point. `0` is a price the
 * schema rejects, so an empty field would have to be told apart from a typed
 * zero anyway, and a wizard that treats "nothing typed" as a valid number is
 * how "Dalej" ends up live on a blank form.
 */
export function NumberField({
  label,
  placeholder,
  required = false,
  onValueChange,
}: {
  label: string;
  placeholder?: string;
  required?: boolean;
  /**
   * Replaces the default "write the number to this field". Step 2's prices
   * need it: typing in one box also rewrites the other, so the whole edit has
   * to go through one place.
   */
  onValueChange?: (value: number | null) => void;
}) {
  const field = useFieldContext<number | null>();
  const { id, errorId, error, invalid, describedBy, handleBlur } =
    useFieldPresentation("blur");

  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="number"
        className="h-10"
        // `step="any"`, not `step="0.01"`. The gross price is rounded to the
        // cent but a typed one is accepted at any precision, and `0.01` would
        // have the browser mark 19.999 `:invalid` while the schema calls it
        // fine — two authorities on validity disagreeing about the same box.
        step="any"
        min="0"
        inputMode="decimal"
        value={field.state.value === null ? "" : String(field.state.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => {
          const value =
            event.target.value === "" ? null : event.target.valueAsNumber;
          if (onValueChange) onValueChange(value);
          else field.handleChange(value);
        }}
        // A wheel over a focused number input scrolls its value, so scrolling
        // past a filled form quietly rewrites the price under the cursor.
        // Dropping focus is what stops that without also blocking the scroll.
        onWheel={(event) => event.currentTarget.blur()}
        onBlur={handleBlur}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  );
}
