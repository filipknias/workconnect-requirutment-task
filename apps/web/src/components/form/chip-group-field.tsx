"use client";

import {
  CheckboxChipGroup,
  type CheckboxChipOption,
} from "@repo/ui/components/checkbox-chip-group";
import { FieldError, FieldLegend, FieldSet } from "@repo/ui/components/field";
import { useFieldContext } from "./context/field-context";
import { useFieldPresentation } from "./hooks/use-field-presentation";

/**
 * A multiple-choice field bound to the enclosing `form.AppField`.
 *
 * The group is a `<fieldset>` so its `<legend>` names every chip inside it, and
 * the error hangs off the fieldset rather than off any one chip — the rule is
 * about the set, not about a particular option. There is deliberately no
 * `aria-required`: it is not a supported attribute on a group, and putting it
 * on each checkbox would claim every chip must be ticked. The message carries
 * the requirement instead.
 */
export function ChipGroupField({
  legend,
  options,
}: {
  legend: string;
  options: readonly CheckboxChipOption[];
}) {
  const field = useFieldContext<string[]>();
  const { errorId, error, invalid, describedBy } =
    useFieldPresentation("touch");

  return (
    <FieldSet
      className="gap-2"
      data-invalid={invalid || undefined}
      aria-describedby={describedBy}
    >
      <FieldLegend variant="label" className="mb-0">
        {legend}
      </FieldLegend>
      <CheckboxChipGroup
        options={options}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
        className="mt-2.5"
      />
      <FieldError id={errorId}>{error}</FieldError>
    </FieldSet>
  );
}
