"use client";

import { createFormHook } from "@tanstack/react-form";
import { ChipGroupField } from "../chip-group-field";
import { fieldContext, formContext } from "../context/field-context";
import { SelectField } from "../select-field";
import { TextField } from "../text-field";
import { TextareaField } from "../textarea-field";

/**
 * The app's TanStack Form binding. `useAppForm` hands back a form whose
 * `AppField` render prop already carries the field components below, so a call
 * site is one line of copy per field:
 *
 * ```tsx
 * <form.AppField name="name">
 *   {(field) => <field.TextField label="Nazwa produktu" required />}
 * </form.AppField>
 * ```
 *
 * The components live in their own files and read the field off
 * `../context/field-context`, which is also where the contexts are created —
 * importing them from here instead would put this module and every field
 * component in an import cycle.
 */
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    TextareaField,
    SelectField,
    ChipGroupField,
  },
  formComponents: {},
});
