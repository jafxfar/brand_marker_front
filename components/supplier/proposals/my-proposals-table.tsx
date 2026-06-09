"use client"

import Link from "next/link"
import type { Proposal } from "@/types"
import { proposalStatusMeta } from "@/lib/proposal-display"
import { formatCurrency } from "@/lib/format"

type MyProposalsTableProps = {
  proposals: Proposal[]
  getRfqTitle: (rfqId: string) => string
}

export const MyProposalsTable = ({
  proposals,
  getRfqTitle,
}: MyProposalsTableProps) => (
  <>
    <div className="hidden md:block bg-white border border-border rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/40">
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">RFQ</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Цена</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Срок</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Статус</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {proposals.map((proposal) => {
            const meta = proposalStatusMeta[proposal.status]
            const rfqTitle = getRfqTitle(proposal.rfq_id)
            return (
              <tr key={proposal.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/supplier/rfqs/${proposal.rfq_id}`}
                    className="font-semibold text-foreground hover:text-primary line-clamp-2"
                  >
                    {rfqTitle}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                  {formatCurrency(proposal.price, proposal.currency)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {proposal.delivery_time ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${meta.className}`}>
                    {meta.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>

    <div className="md:hidden space-y-3">
      {proposals.map((proposal) => {
        const meta = proposalStatusMeta[proposal.status]
        const rfqTitle = getRfqTitle(proposal.rfq_id)
        return (
          <Link
            key={proposal.id}
            href={`/supplier/rfqs/${proposal.rfq_id}`}
            className="block bg-white border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors"
          >
            <p className="text-sm font-bold text-foreground">{rfqTitle}</p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div>
                <p className="text-muted-foreground">Цена</p>
                <p className="font-semibold text-foreground mt-0.5">
                  {formatCurrency(proposal.price, proposal.currency)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Срок</p>
                <p className="font-semibold text-foreground mt-0.5">
                  {proposal.delivery_time ?? "—"}
                </p>
              </div>
            </div>
            <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full mt-3 ${meta.className}`}>
              {meta.label}
            </span>
          </Link>
        )
      })}
    </div>
  </>
)
