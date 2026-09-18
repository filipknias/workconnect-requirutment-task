"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group"
import { cn } from "cn"
import { CheckIcon } from "lucide-react"

/**
 * A multiple-choice control drawn as a row of pills.
 *
 * It looks like a set of toggle buttons but behaves — and announces itself — as
 * a group of checkboxes, which is what it is: any number of them may be on, and
 * turning one on does not turn another off.
 *
 * Selection is signalled by a tick as well as by the fill, so the state does not
 * rest on colour alone. The tick is added rather than reserved, so the chips
 * reflow as they are picked.
 *
 * Presentation only. It knows nothing about forms, validation or what the
 * options mean; the label, the legend and any error message belong to whoever
 * renders it. Colours are explicit neutrals because the app is light-only; see
 * the note in `apps/web/src/app/page.tsx`.
 */
type CheckboxChipOption = {
  value: string
  label: string
}

const chipClassName =
  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 text-sm text-neutral-700 transition-colors select-none outline-none hover:bg-neutral-50 focus-visible:border-blue-600 focus-visible:ring-3 focus-visible:ring-blue-600/50 data-checked:border-blue-600 data-checked:bg-blue-600 data-checked:text-white data-checked:hover:bg-blue-600/90 data-disabled:pointer-events-none data-disabled:opacity-50"

function CheckboxChipGroup({
  options,
  className,
  ...props
}: Omit<CheckboxGroupPrimitive.Props, "className" | "render" | "children"> & {
  options: readonly CheckboxChipOption[]
  className?: string
}) {
  return (
    <CheckboxGroupPrimitive
      data-slot="checkbox-chip-group"
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    >
      {options.map((option) => (
        <CheckboxPrimitive.Root
          key={option.value}
          value={option.value}
          data-slot="checkbox-chip"
          className={chipClassName}
        >
          <CheckboxPrimitive.Indicator className="flex [&>svg]:size-3.5">
            <CheckIcon />
          </CheckboxPrimitive.Indicator>
          {option.label}
        </CheckboxPrimitive.Root>
      ))}
    </CheckboxGroupPrimitive>
  )
}

export { CheckboxChipGroup, type CheckboxChipOption }
