"use client"

import type { ContractWithRelations } from "@/types"
import { getMilestoneProgress, milestoneStatusMeta } from "@/lib/contract-display"
import { formatCurrency } from "@/lib/format"

type BuyerContractMilestonesPanelProps = {
  contract: ContractWithRelations
  onFund: (milestoneId: number) => void
  onApprove: (milestoneId: number) => void
}

export const BuyerContractMilestonesPanel = ({
  contract,
  onFund,
  onApprove,
}: BuyerContractMilestonesPanelProps) => {
  const milestones = contract.payment_plan?.milestones ?? []
  const progress = getMilestoneProgress(contract)

  if (milestones.length === 0) {
    return (
      <section className="bg-white border border-border rounded-2xl p-6">
        <h2 className="text-base font-bold text-foreground mb-3">Этапы оплаты</h2>
        <p className="text-sm text-muted-foreground">План платежей не настроен</p>
      </section>
    )
  }

  return (
    <section className="bg-white border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-foreground">Этапы оплаты</h2>
        <span className="text-xs font-semibold text-muted-foreground">
          Выплачено {progress}%
        </span>
      </div>

      <div className="h-2 rounded-full bg-secondary mb-5 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Прогресс выплат"
        />
      </div>

      <div className="space-y-3">
        {milestones.map((milestone, index) => {
          const meta = milestoneStatusMeta[milestone.status]
          const isLast = index === milestones.length - 1
          const canFund = ["awaiting_payment", "pending"].includes(milestone.status)
          const canApprove = ["submitted", "approved", "in_progress"].includes(
            milestone.status,
          )

          return (
            <div key={milestone.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${meta.className.split(" ")[0]}`} />
                {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="flex-1 rounded-xl border border-border p-3 mb-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{milestone.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{milestone.percentage}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">
                      {formatCurrency(milestone.amount, contract.currency)}
                    </p>
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${meta.className}`}>
                      {meta.label}
                    </span>
                  </div>
                </div>

                {(canFund || canApprove) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {canFund && (
                      <button
                        type="button"
                        onClick={() => onFund(milestone.id)}
                        className="h-8 px-3 rounded-lg bg-primary hover:bg-primary-dark text-primary-foreground text-xs font-bold transition-colors"
                      >
                        Оплатить в эскроу
                      </button>
                    )}
                    {canApprove && (
                      <button
                        type="button"
                        onClick={() => onApprove(milestone.id)}
                        className="h-8 px-3 rounded-lg border border-primary text-primary text-xs font-bold hover:bg-primary/5 transition-colors"
                      >
                        Подтвердить этап
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
