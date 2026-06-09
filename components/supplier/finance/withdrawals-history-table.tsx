"use client"

import type { Withdrawal, WithdrawalDestination } from "@/types"
import { withdrawalStatusMeta } from "@/lib/finance-display"
import { formatCurrency, formatIsoDate } from "@/lib/format"

type WithdrawalsHistoryTableProps = {
  withdrawals: Withdrawal[]
  getDestination: (id: number) => WithdrawalDestination | undefined
}

export const WithdrawalsHistoryTable = ({
  withdrawals,
  getDestination,
}: WithdrawalsHistoryTableProps) => {
  if (withdrawals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        История выводов пуста
      </p>
    )
  }

  return (
    <>
      <div className="hidden md:block overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Счёт / кошелёк</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Сумма</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Статус</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Дата</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {withdrawals.map((withdrawal) => {
              const destination = getDestination(withdrawal.destination_id)
              const meta = withdrawalStatusMeta[withdrawal.status]
              return (
                <tr key={withdrawal.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">
                      {destination?.label ?? "—"}
                    </p>
                    {destination && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                        {destination.details}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-primary whitespace-nowrap">
                    {formatCurrency(withdrawal.amount, withdrawal.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${meta.className}`}>
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatIsoDate(withdrawal.created_at.split("T")[0] ?? withdrawal.created_at)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {withdrawals.map((withdrawal) => {
          const destination = getDestination(withdrawal.destination_id)
          const meta = withdrawalStatusMeta[withdrawal.status]
          return (
            <div
              key={withdrawal.id}
              className="rounded-xl border border-border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    {destination?.label ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatIsoDate(withdrawal.created_at.split("T")[0] ?? withdrawal.created_at)}
                  </p>
                </div>
                <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${meta.className}`}>
                  {meta.label}
                </span>
              </div>
              <p className="text-sm font-bold text-primary mt-2">
                {formatCurrency(withdrawal.amount, withdrawal.currency)}
              </p>
            </div>
          )
        })}
      </div>
    </>
  )
}
