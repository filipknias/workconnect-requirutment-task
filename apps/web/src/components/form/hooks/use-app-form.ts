"use client";

import { createFormHook } from "@tanstack/react-form";
import { CheckboxField } from "../checkbox-field";
import { ChipGroupField } from "../chip-group-field";
import { fieldContext, formContext } from "../context/field-context";
import { NumberField } from "../number-field";
import { SelectField } from "../select-field";
import { SwitchField } from "../switch-field";
import { TextField } from "../text-field";
import { TextareaField } from "../textarea-field";

// Field components must import contexts from `../context/field-context`, not
// from here, or this module and every field component form an import cycle.
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    TextareaField,
    NumberField,
    SelectField,
    ChipGroupField,
    SwitchField,
    CheckboxField,
  },
  formComponents: {},
});
