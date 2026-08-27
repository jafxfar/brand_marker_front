"use client"

import Link from "next/link"
import type { OutgoingPaymentRow } from "@/lib/buyer-payments-display"
import { paymentHistoryTypeLabel } from "@/lib/buyer-payments-display"
import { formatCurrency, formatIsoDate } from "@/lib/format"

type OutgoingPaymentsTableProps = {
  payments: OutgoingPaymentRow[]
  getSupplierName: (supplierActorId: number) => string
}

const typeClassName: Record<OutgoingPaymentRow["type"], string> = {
  funding: "bg-info/10 text-info",
  release: "bg-primary/10 text-primary",
  refund: "bg-warning/10 text-warning",
}

export const OutgoingPaymentsTable = ({
  payments,
  getSupplierName,
}: OutgoingPaymentsTableProps) => {
  if (payments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Исходящих платежей пока нет
      </p>
    )
  }

  return (
    <>
      <div className="hidden md:block overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Дата</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Контракт</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Исполнитель</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Этап</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Тип</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Сумма</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatIsoDate(payment.at)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/customer/contracts/${payment.contractId}`}
                    className="font-semibold text-foreground hover:text-primary line-clamp-2"
                  >
                    {payment.contractTitle}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {getSupplierName(payment.supplierActorId)}
                </td>
                <td className="px-4 py-3 text-foreground">{payment.title}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block text-[10px] text-center font-semibold px-2.5 py-1 rounded-full ${typeClassName[payment.type]}`}>
                    {paymentHistoryTypeLabel[payment.type]}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-primary whitespace-nowrap">
                  {formatCurrency(payment.amount, payment.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {payments.map((payment) => (
          <Link
            key={payment.id}
            href={`/customer/contracts/${payment.contractId}`}
            className="block bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-foreground">{payment.contractTitle}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getSupplierName(payment.supplierActorId)} · {formatIsoDate(payment.at)}
                </p>
              </div>
              <p className="text-sm font-bold text-primary flex-shrink-0">
                {formatCurrency(payment.amount, payment.currency)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{payment.title}</p>
            <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full mt-2 ${typeClassName[payment.type]}`}>
              {paymentHistoryTypeLabel[payment.type]}
            </span>
          </Link>
        ))}
      </div>
    </>
  )
}
