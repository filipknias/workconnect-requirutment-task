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
import {
  INVALID_BORDER,
  useFieldPresentation,
} from "./hooks/use-field-presentation";

export type SelectFieldOption<TValue = string> = {
  value: TValue;
  label: string;
};

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
  onValueChange?: (value: TValue) => void;
}) {
  const field = useFieldContext<TValue | "">();
  const { id, errorId, error, invalid, describedBy, handleBlur } =
    useFieldPresentation("touch");

  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={options}
        // Base UI shows the placeholder only for null, not the form's "".
        value={field.state.value === "" ? null : field.state.value}
        onValueChange={(value: TValue | null) => {
          if (value === null) {
            field.handleChange("");
            return;
          }
          if (onValueChange) onValueChange(value);
          else field.handleChange(value);
        }}
        // Not `onBlur`: opening the popup blurs the trigger and would flash an error mid-choice.
        onOpenChange={(open) => {
          if (!open) handleBlur();
        }}
      >
        <SelectTrigger
          id={id}
          className={`h-10 w-full ${INVALID_BORDER}`}
          aria-required={required || undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {/* Portalled outside the dialog's `light-surface`; without its own it renders dark. */}
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
