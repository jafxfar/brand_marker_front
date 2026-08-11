"use client"

import Link from "next/link"
import { Inbox, ArrowRight } from "lucide-react"
import type { IncomingProposalItem } from "@/lib/store/proposals-store"
import { formatCurrency } from "@/lib/format"

type IncomingProposalsPanelProps = {
  items: IncomingProposalItem[]
  hydrated: boolean
}

export const IncomingProposalsPanel = ({ items, hydrated }: IncomingProposalsPanelProps) => (
  <div className="bg-card border border-border rounded-xl">
    <div className="flex items-center justify-between p-5 border-b border-border">
      <h2 className="text-sm font-semibold text-foreground">Входящие предложения</h2>
      <Link
        href="/customer/rfqs"
        className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
      >
        К заявкам <ArrowRight size={14} />
      </Link>
    </div>

    {!hydrated || items.length === 0 ? (
      <div className="p-8 text-center">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Inbox size={18} className="text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">Новых предложений нет</p>
      </div>
    ) : (
      <div className="divide-y divide-border">
        {items.slice(0, 5).map((item) => (
          <Link
            key={item.proposal.id}
            href={`/customer/rfqs/${item.rfqId}`}
            className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Inbox size={17} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{item.rfqTitle}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {item.proposal.message ?? "Без комментария"}
              </p>
            </div>
            <div className="text-sm font-bold text-primary flex-shrink-0">
              {formatCurrency(item.proposal.price, item.proposal.currency)}
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
)
