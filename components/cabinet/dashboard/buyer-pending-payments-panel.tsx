"use client"

import Link from "next/link"
import { Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/format"

type MilestoneItem = {
  contract: { id: number; title: string }
  title: string
  amount: number
  currency: string
}

type BuyerPendingPaymentsPanelProps = {
  milestones: MilestoneItem[]
  hydrated: boolean
}

export const BuyerPendingPaymentsPanel = ({
  milestones,
  hydrated,
}: BuyerPendingPaymentsPanelProps) => (
  <div className="bg-white border border-border rounded-2xl">
    <div className="p-5 border-b border-border">
      <h2 className="text-base font-bold text-foreground">Ожидают оплаты</h2>
    </div>

    {!hydrated || milestones.length === 0 ? (
      <div className="p-8 text-center">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
          <Wallet size={18} className="text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">Нет ожидающих платежей</p>
      </div>
    ) : (
      <div className="divide-y divide-border">
        {milestones.slice(0, 4).map((item) => (
          <Link
            key={`${item.contract.id}-${item.title}`}
            href={`/customer/contracts/${item.contract.id}`}
            className="block p-4 hover:bg-secondary/50 transition-colors"
          >
            <p className="text-xs text-muted-foreground truncate">{item.contract.title}</p>
            <div className="flex items-center justify-between gap-2 mt-1">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-sm font-bold text-primary">
                {formatCurrency(item.amount, item.currency)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
)
