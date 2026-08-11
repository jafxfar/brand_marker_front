"use client"

import Link from "next/link"
import { Wallet } from "lucide-react"
import { milestoneStatusMeta } from "@/lib/contract-display"
import { formatCurrency } from "@/lib/format"

type PendingMilestone = {
  contract: { id: number; title: string }
  milestoneId: number
  title: string
  amount: number
  currency: string
  status: string
}

type PendingPaymentsPanelProps = {
  milestones: PendingMilestone[]
  hydrated: boolean
}

export const PendingPaymentsPanel = ({
  milestones,
  hydrated,
}: PendingPaymentsPanelProps) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
        <Wallet size={18} />
      </div>
      <h2 className="text-sm font-semibold text-foreground">Ожидают выплаты</h2>
    </div>

    {!hydrated || milestones.length === 0 ? (
      <p className="text-xs text-muted-foreground">Нет ожидающих выплат</p>
    ) : (
      <div className="space-y-3">
        {milestones.slice(0, 4).map((item) => {
          const meta = milestoneStatusMeta[item.status as keyof typeof milestoneStatusMeta]
          return (
            <Link
              key={item.milestoneId}
              href={`/supplier/contracts/${item.contract.id}`}
              className="block rounded-xl border border-border p-3 hover:border-primary/30 transition-colors"
            >
              <p className="text-xs font-semibold text-foreground truncate">
                {item.contract.title}
              </p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-sm font-bold text-primary">
                  {formatCurrency(item.amount, item.currency)}
                </span>
                {meta && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.className}`}>
                    {meta.label}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{item.title}</p>
            </Link>
          )
        })}
      </div>
    )}
  </div>
)
