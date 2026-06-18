"use client"

import { cn } from "@/lib/utils"

export type BuyerPaymentsTab =
  | "outgoing"
  | "escrow"
  | "invoices"
  | "refunds"

export const BUYER_PAYMENTS_TABS: { value: BuyerPaymentsTab; label: string }[] = [
  { value: "outgoing", label: "Исходящие платежи" },
  { value: "escrow", label: "Безопасная оплата" },
  { value: "invoices", label: "Счета" },
  { value: "refunds", label: "Возвраты" },
]

type BuyerPaymentsTabsProps = {
  tab: BuyerPaymentsTab
  onTabChange: (tab: BuyerPaymentsTab) => void
}

export const BuyerPaymentsTabs = ({ tab, onTabChange }: BuyerPaymentsTabsProps) => (
  <div className="flex flex-wrap items-center gap-1 mb-5 bg-white border border-border rounded-xl p-1 w-fit">
    {BUYER_PAYMENTS_TABS.map((t) => (
      <button
        key={t.value}
        type="button"
        onClick={() => onTabChange(t.value)}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
          tab === t.value
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {t.label}
      </button>
    ))}
  </div>
)
