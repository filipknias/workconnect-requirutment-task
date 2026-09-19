"use client";

import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { useFieldContext } from "./context/field-context";
import { useFieldPresentation } from "./hooks/use-field-presentation";

export type SelectFieldOption<TValue = string> = {
  value: TValue;
  label: string;
};

/**
 * A single-choice field bound to the enclosing `form.AppField`. The form stores
 * the option's `value`; the trigger shows its `label`.
 *
 * Generic over that value so a list of numbers — the VAT rates — goes in and
 * comes back out a number. The alternative would be a second copy of this
 * component, and the copy would have to repeat the `""`/`null` dance below,
 * which is the one piece of logic here worth not duplicating.
 */
export function SelectField<TValue extends string | number = string>({
  label,
  placeholder,
  options,
  required = false,
  onValueChange,
}: {
  label: string;
  placeholder?: string;
  options: readonly SelectFieldOption<TValue>[];
  required?: boolean;
  /**
   * Replaces the default "write the choice to this field". Step 2's VAT select
   * needs it: picking a rate also rewrites the gross price, so the whole edit
   * has to go through one place.
   */
  onValueChange?: (value: TValue) => void;
}) {
  // `""` is how a string-valued field spells empty; a number-valued one always
  // holds an option, so the empty case never arises for it.
  const field = useFieldContext<TValue | "">();
  const { id, errorId, error, invalid, describedBy, handleBlur } =
    useFieldPresentation("touch");

  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={options}
        // The form's empty value is "", but Base UI spells "nothing selected"
        // as null — that is what makes the placeholder show.
        value={field.state.value === "" ? null : field.state.value}
        onValueChange={(value: TValue | null) => {
          if (value === null) {
            field.handleChange("");
            return;
          }
          if (onValueChange) onValueChange(value);
          else field.handleChange(value);
        }}
        // Opening the popup moves focus off the trigger, so the trigger's own
        // blur fires while the user is still choosing and would flash an error
        // mid-interaction. Closing the popup is the moment they are done with
        // the field, whether or not they picked anything.
        onOpenChange={(open) => {
          if (!open) handleBlur();
        }}
      >
        <SelectTrigger
          id={id}
          className="h-10 w-full"
          aria-required={required || undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {/* The popup is portalled to the body, so it sits outside the
            dialog's `light-surface` and has to carry its own. Without it the
            list renders as a dark panel over a white form. */}
        <SelectContent className="light-surface">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  );
}
