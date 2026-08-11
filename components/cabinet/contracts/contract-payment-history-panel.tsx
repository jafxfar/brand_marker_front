"use client"

import type { PaymentHistoryEvent } from "@/lib/buyer-payments-display"
import { paymentHistoryTypeLabel } from "@/lib/buyer-payments-display"
import { formatCurrency, formatIsoDate } from "@/lib/format"

type ContractPaymentHistoryPanelProps = {
  events: PaymentHistoryEvent[]
}

const typeClassName: Record<PaymentHistoryEvent["type"], string> = {
  funding: "bg-info/10 text-info",
  release: "bg-primary/10 text-primary",
  refund: "bg-warning/10 text-warning",
}

export const ContractPaymentHistoryPanel = ({
  events,
}: ContractPaymentHistoryPanelProps) => (
  <section className="bg-card border border-border rounded-xl p-6">
    <h2 className="text-sm font-semibold text-foreground mb-4">История платежей</h2>

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
