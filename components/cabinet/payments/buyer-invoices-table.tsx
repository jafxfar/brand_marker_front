"use client"

import Link from "next/link"
import type { BuyerInvoice } from "@/types"
import { invoiceStatusMeta } from "@/lib/finance-display"
import { formatCurrency, formatIsoDate } from "@/lib/format"

type BuyerInvoicesTableProps = {
  invoices: BuyerInvoice[]
  getContractTitle: (contractId: number | null) => string
}

export const BuyerInvoicesTable = ({
  invoices,
  getContractTitle,
}: BuyerInvoicesTableProps) => {
  if (invoices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Счетов пока нет
      </p>
    )
  }

  return (
    <>
      <div className="hidden md:block overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Номер</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Контракт</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Сумма</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Статус</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Срок оплаты</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.map((invoice) => {
              const meta = invoiceStatusMeta[invoice.status]
              return (
                <tr key={invoice.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{invoice.number}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{invoice.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    {invoice.contract_id ? (
                      <Link
                        href={`/customer/contracts/${invoice.contract_id}`}
                        className="text-foreground hover:text-primary font-medium line-clamp-2"
                      >
                        {getContractTitle(invoice.contract_id)}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-primary whitespace-nowrap">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${meta.className}`}>
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {invoice.due_at ? formatIsoDate(invoice.due_at) : "—"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {invoices.map((invoice) => {
          const meta = invoiceStatusMeta[invoice.status]
          return (
            <div key={invoice.id} className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-bold text-foreground">{invoice.number}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{invoice.title}</p>
              {invoice.contract_id && (
                <Link
                  href={`/customer/contracts/${invoice.contract_id}`}
                  className="text-xs text-primary hover:underline mt-2 inline-block"
                >
                  {getContractTitle(invoice.contract_id)}
                </Link>
              )}
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm font-bold text-primary">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </p>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${meta.className}`}>
                  {meta.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
