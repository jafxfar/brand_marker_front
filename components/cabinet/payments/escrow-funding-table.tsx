"use client"

import { statusPillClass } from "@/components/ui/status-badge"
import Link from "next/link"
import type { EscrowFundingRow } from "@/lib/buyer-payments-display"
import { milestoneStatusMeta } from "@/lib/contract-display"
import { formatCurrency } from "@/lib/format"
import type { PaymentMilestoneStatus } from "@/types"
import {
  ALIF_PAY_LABEL,
  AlifBadge,
  isAlifCurrencySupported,
} from "@/components/cabinet/payments/alif-payment-note"

type EscrowFundingTableProps = {
  rows: EscrowFundingRow[]
  getSupplierName: (supplierActorId: number) => string
  viaAlif?: boolean
  alifCurrency?: string | null
  onFund: (row: EscrowFundingRow) => void
}

export const EscrowFundingTable = ({
  rows,
  getSupplierName,
  viaAlif = false,
  alifCurrency = null,
  onFund,
}: EscrowFundingTableProps) => {
  const payLabel = viaAlif ? ALIF_PAY_LABEL : "Оплатить"
  const mobilePayLabel = viaAlif ? ALIF_PAY_LABEL : "Оплатить безопасно"
  const canPay = (row: EscrowFundingRow) =>
    isAlifCurrencySupported(viaAlif, alifCurrency, row.currency)

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
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Сделка</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Исполнитель</th>
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
                    <span className="inline-flex items-center gap-2">
                      {formatCurrency(row.amount, row.currency)}
                      {viaAlif && <AlifBadge />}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`${statusPillClass} ${meta.className}`}>
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onFund(row)}
                      disabled={!canPay(row)}
                      title={canPay(row) ? undefined : `Оплата через Alif доступна только в ${alifCurrency}`}
                      className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-colors disabled:pointer-events-none disabled:opacity-50"
                    >
                      {payLabel}
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
                <p className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                  {formatCurrency(row.amount, row.currency)}
                  {viaAlif && <AlifBadge />}
                </p>
                <span className={`${statusPillClass} ${meta.className}`}>
                  {meta.label}
                </span>
              </div>
              {!canPay(row) && (
                <p className="mt-3 text-xs text-amber-700">
                  Оплата через Alif доступна только в {alifCurrency}
                </p>
              )}
              <button
                type="button"
                onClick={() => onFund(row)}
                disabled={!canPay(row)}
                className="w-full h-9 mt-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-colors disabled:pointer-events-none disabled:opacity-50"
              >
                {mobilePayLabel}
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}
