import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "cn"

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
                  {isCompleted && <span className="sr-only"> Ukończony</span>}
                </span>
                <span className="text-xs text-neutral-500">
                  {step.description}
                </span>
              </span>
            </div>
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
