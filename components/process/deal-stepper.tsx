import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ContractWithRelations } from "@/types"
import { getDealPhase, getDealStepIndex, getDealSteps } from "@/lib/process/deal-stages"

type DealContract = Pick<ContractWithRelations, "status" | "payment_type" | "payment_plan" | "dispute">

const segmentClass = (index: number, current: number, finished: boolean) => {
  if (finished || index < current) return "bg-primary"
  if (index === current) return "bg-brand-300"
  return "bg-border"
}

export const DealStepper = ({ contract, className }: { contract: DealContract; className?: string }) => {
  const steps = getDealSteps(contract)
  const current = getDealStepIndex(contract)
  const phase = getDealPhase(contract)
  const finished = phase === "done"
  const currentLabel = current >= 0 ? steps[current]?.label : "Отменена"

  return (
    <ol
      className={cn("grid grid-cols-5 gap-2", className)}
      aria-label={`Этапы сделки. Сейчас: ${currentLabel}`}
    >
      {steps.map((step, index) => {
        const passed = finished || index < current
        const isCurrent = !finished && index === current
        return (
          <li
            key={step.key}
            className="grid gap-2"
            aria-current={isCurrent ? "step" : undefined}
          >
            <span className={cn("h-2 rounded-full", segmentClass(index, current, finished))} />
            <span
              className={cn(
                "flex items-center gap-1 text-xs leading-tight sm:text-sm",
                isCurrent ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {passed ? (
                <Check size={14} className="hidden shrink-0 text-primary sm:block" aria-hidden="true" />
              ) : null}
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export const DealStageBar = ({ contract, className }: { contract: DealContract; className?: string }) => {
  const steps = getDealSteps(contract)
  const current = getDealStepIndex(contract)
  const finished = getDealPhase(contract) === "done"
  const currentLabel = finished ? "Завершено" : current >= 0 ? steps[current]?.label : "Отменена"

  return (
    <div
      className={cn("flex w-full gap-1", className)}
      role="img"
      aria-label={`Этап сделки: ${currentLabel}`}
    >
      {steps.map((step, index) => (
        <span
          key={step.key}
          className={cn("h-1.5 flex-1 rounded-full", segmentClass(index, current, finished))}
        />
      ))}
    </div>
  )
}
