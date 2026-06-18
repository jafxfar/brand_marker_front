"use client"

import type { Currency } from "@/types"
import { formatCurrency } from "@/lib/format"

type BuyerPaymentsSummaryCardsProps = {
  totalOutgoing: number
  inEscrow: number
  pendingFunding: number
  currency: Currency
  hydrated: boolean
}

export const BuyerPaymentsSummaryCards = ({
  totalOutgoing,
  inEscrow,
  pendingFunding,
  currency,
  hydrated,
}: BuyerPaymentsSummaryCardsProps) => {
  const cards = [
    { label: "Исходящие", value: totalOutgoing },
    { label: "Заморожено", value: inEscrow },
    { label: "К оплате", value: pendingFunding },
  ]

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-border rounded-2xl p-4"
        >
          <p className="text-xs font-semibold text-muted-foreground">{card.label}</p>
          <p className="text-xl font-black text-primary mt-1">
            {hydrated ? formatCurrency(card.value, currency) : "—"}
          </p>
        </div>
      ))}
    </div>
  )
}
