"use client"

import Link from "next/link"
import type { BuyerRefund } from "@/types"
import { formatCurrency, formatIsoDate } from "@/lib/format"

type BuyerRefundsTableProps = {
  refunds: BuyerRefund[]
  getContractTitle: (contractId: number) => string
}

export const BuyerRefundsTable = ({
  refunds,
  getContractTitle,
}: BuyerRefundsTableProps) => {
  if (refunds.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Возвратов пока нет
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
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Причина</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Сумма</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {refunds.map((refund) => (
              <tr key={refund.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatIsoDate(refund.created_at)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/customer/contracts/${refund.contract_id}`}
                    className="font-semibold text-foreground hover:text-primary line-clamp-2"
                  >
                    {getContractTitle(refund.contract_id)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{refund.reason}</td>
                <td className="px-4 py-3 font-medium text-primary whitespace-nowrap">
                  {formatCurrency(refund.amount, refund.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {refunds.map((refund) => (
          <div key={refund.id} className="bg-card border border-border rounded-xl p-4">
            <Link
              href={`/customer/contracts/${refund.contract_id}`}
              className="text-sm font-bold text-foreground hover:text-primary"
            >
              {getContractTitle(refund.contract_id)}
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              {formatIsoDate(refund.created_at)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{refund.reason}</p>
            <p className="text-sm font-bold text-primary mt-2">
              {formatCurrency(refund.amount, refund.currency)}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}
