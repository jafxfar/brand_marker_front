"use client"

import Link from "next/link"
import type { EscrowFundingRow } from "@/lib/buyer-payments-display"
import { milestoneStatusMeta } from "@/lib/contract-display"
import { formatCurrency } from "@/lib/format"
import type { PaymentMilestoneStatus } from "@/types"

type EscrowFundingTableProps = {
  rows: EscrowFundingRow[]
  getSupplierName: (supplierActorId: number) => string
  onFund: (contractId: number, milestoneId: number) => void
}

export const EscrowFundingTable = ({
  rows,
  getSupplierName,
  onFund,
}: EscrowFundingTableProps) => {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Нет этапов, ожидающих оплаты
      </p>
    )
  }

  return (
    <>
      <div className="hidden md:block overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Контракт</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Поставщик</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Этап</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Сумма</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Статус</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const meta = milestoneStatusMeta[row.status as PaymentMilestoneStatus]
              return (
                <tr key={`${row.contractId}-${row.milestoneId}`} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/customer/contracts/${row.contractId}`}
                      className="font-semibold text-foreground hover:text-primary line-clamp-2"
                    >
                      {row.contractTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {getSupplierName(row.supplierActorId)}
                  </td>
                  <td className="px-4 py-3 text-foreground">{row.title}</td>
                  <td className="px-4 py-3 font-medium text-primary whitespace-nowrap">
                    {formatCurrency(row.amount, row.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${meta.className}`}>
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onFund(row.contractId, row.milestoneId)}
                      className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-colors"
                    >
                      Оплатить
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {rows.map((row) => {
          const meta = milestoneStatusMeta[row.status as PaymentMilestoneStatus]
          return (
            <div
              key={`${row.contractId}-${row.milestoneId}`}
              className="bg-card border border-border rounded-xl p-4"
            >
              <Link
                href={`/customer/contracts/${row.contractId}`}
                className="text-sm font-bold text-foreground hover:text-primary"
              >
                {row.contractTitle}
              </Link>
              <p className="text-xs text-muted-foreground mt-1">
                {getSupplierName(row.supplierActorId)} · {row.title}
              </p>
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm font-bold text-primary">
                  {formatCurrency(row.amount, row.currency)}
                </p>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${meta.className}`}>
                  {meta.label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onFund(row.contractId, row.milestoneId)}
                className="w-full h-9 mt-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-colors"
              >
                Оплатить безопасно
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}
