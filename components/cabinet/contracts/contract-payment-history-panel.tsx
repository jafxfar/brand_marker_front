"use client"

import type { PaymentHistoryEvent } from "@/lib/buyer-payments-display"
import { paymentHistoryTypeLabel } from "@/lib/buyer-payments-display"
import { formatCurrency, formatIsoDate } from "@/lib/format"

type ContractPaymentHistoryPanelProps = {
  events: PaymentHistoryEvent[]
}

const typeClassName: Record<PaymentHistoryEvent["type"], string> = {
  funding: "bg-blue-100 text-blue-700",
  release: "bg-emerald-100 text-emerald-700",
  refund: "bg-amber-100 text-amber-700",
}

export const ContractPaymentHistoryPanel = ({
  events,
}: ContractPaymentHistoryPanelProps) => (
  <section className="bg-white border border-border rounded-2xl p-6">
    <h2 className="text-base font-bold text-foreground mb-4">История платежей</h2>

    {events.length === 0 ? (
      <p className="text-sm text-muted-foreground">Платежей по контракту пока нет</p>
    ) : (
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-border p-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{event.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatIsoDate(event.at)}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-primary">
                {formatCurrency(event.amount, event.currency)}
              </p>
              <span
                className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${typeClassName[event.type]}`}
              >
                {paymentHistoryTypeLabel[event.type]}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
)
