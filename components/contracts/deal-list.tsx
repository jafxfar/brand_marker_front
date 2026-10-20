"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { ContractWithRelations } from "@/types"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import {
  DEAL_NEXT_STEP,
  dealNeedsAction,
  getDealPhase,
  type DealRole,
} from "@/lib/process/deal-stages"
import { DealStageBar } from "@/components/process"
import { DeadlineCountdown } from "@/components/contracts/deadline-countdown"

type DealListProps = {
  contracts: ContractWithRelations[]
  role: DealRole
  getCounterpartName: (contract: ContractWithRelations) => string
}

const DEAL_HREF_BASE: Record<DealRole, string> = {
  buyer: "/customer/contracts",
  supplier: "/supplier/contracts",
}

/** Deal cards with the stage bar and a plain-language "what happens next" line. */
export const DealList = ({ contracts, role, getCounterpartName }: DealListProps) => (
  <ul className="grid gap-3">
    {contracts.map((contract) => {
      const phase = getDealPhase(contract)
      const hot = dealNeedsAction(role, contract)
      const isDispute = phase === "disputed"
      const nextStep = DEAL_NEXT_STEP[role][phase]

      return (
        <li key={contract.id}>
          <Link
            href={`${DEAL_HREF_BASE[role]}/${contract.id}`}
            className={cn(
              "grid gap-3 rounded-2xl border bg-white p-4 transition-colors hover:border-[#C9CED6] sm:p-5",
              hot ? "border-brand-200" : isDispute ? "border-red-200" : "border-line",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 font-bold text-ink">{contract.title}</p>
                <p className="mt-1 text-[14px] text-mute">
                  {getCounterpartName(contract)} ·{" "}
                  <span className="font-semibold text-ink tnum">
                    {formatCurrency(contract.agreed_amount, contract.currency)}
                  </span>
                </p>
              </div>
              <ChevronRight size={18} className="mt-1 shrink-0 text-mute" aria-hidden="true" />
            </div>

            <DealStageBar contract={contract} />

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <p
                className={cn(
                  hot
                    ? "font-semibold text-brand-700"
                    : isDispute
                      ? "font-semibold text-destructive"
                      : "text-muted-foreground",
                )}
              >
                {hot ? "Нужно ваше действие: " : "Сейчас: "}
                {nextStep.charAt(0).toLowerCase() + nextStep.slice(1)}
              </p>
              {phase === "work" || phase === "acceptance" ? (
                <DeadlineCountdown
                  dueDate={contract.due_date}
                  status={contract.status}
                  variant="compact"
                  showAbsoluteDate
                />
              ) : null}
            </div>
          </Link>
        </li>
      )
    })}
  </ul>
)
