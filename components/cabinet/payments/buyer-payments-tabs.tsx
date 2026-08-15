"use client"

import { SegmentedControl } from "@/components/layout"

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
  <SegmentedControl
    value={tab}
    options={BUYER_PAYMENTS_TABS}
    onChange={onTabChange}
    ariaLabel="Разделы платежей"
  />
)
