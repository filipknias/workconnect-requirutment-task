import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "cn"

/**
 * A read-only progress indicator for a multistep flow.
 *
 * Deliberately not interactive and deliberately not tabs: the steps are an
 * ordered list of things that happen in sequence, so they are an `<ol>` with
 * `aria-current="step"` on the one in progress. Modelling a wizard as a
 * `tablist` — which most stepper packages do — tells a screen reader the steps
 * are panels you can jump between, which is the opposite of true here.
 *
 * Colours are explicit neutrals rather than theme tokens because the app is
 * light-only; see the note in `apps/web/src/app/page.tsx`.
 */
type StepperStep = {
  title: string
  description: string
}

function Stepper({
  steps,
  currentStep,
  className,
  ...props
}: Omit<React.ComponentProps<"ol">, "children"> & {
  steps: readonly StepperStep[]
  /** 1-based, so it reads the same as the numbers on screen. */
  currentStep: number
}) {
  return (
    <ol
      data-slot="stepper"
      className={cn("flex items-start gap-3 md:items-center", className)}
      {...props}
    >
      {steps.map((step, index) => {
        const number = index + 1
        const isCurrent = number === currentStep
        // Derived, not passed in: `currentStep` already says which steps are
        // behind it, and a second prop saying so could disagree with it.
        const isCompleted = number < currentStep
        const isLast = index === steps.length - 1

        return (
          <li
            key={step.title}
            data-slot="stepper-step"
            aria-current={isCurrent ? "step" : undefined}
            className="flex flex-1 items-center gap-3"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <span
                aria-hidden
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                  isCurrent || isCompleted
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-100 text-neutral-500"
                )}
              >
                {isCompleted ? <CheckIcon className="size-4" /> : number}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium text-neutral-950">
                  {step.title}
                  {/* The circle is the only thing that says "done" and it is
                      aria-hidden, so without this a completed step and an
                      untouched one read identically. */}
                  {isCompleted && <span className="sr-only"> Ukończony</span>}
                </span>
                <span className="text-xs text-neutral-500">
                  {step.description}
                </span>
              </span>
            </div>
            {/* Connector. Decoration only, and only wide enough to draw once
                the steps sit on one line. */}
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "hidden h-px flex-1 md:block",
                  isCompleted ? "bg-blue-600" : "bg-neutral-200"
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export { Stepper, type StepperStep }
