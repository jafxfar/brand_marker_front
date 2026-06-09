"use client"

import Link from "next/link"
import { Inbox, ShoppingCart, FileText, ArrowRight } from "lucide-react"
import type { Rfq } from "@/types"
import { rfqStatusMeta } from "@/lib/rfq-display"
import { formatRelativeIso, formatRfqBudget } from "@/lib/format"

type NewRfqPanelProps = {
  rfqs: Rfq[]
  hydrated: boolean
}

export const NewRfqPanel = ({ rfqs, hydrated }: NewRfqPanelProps) => (
  <div className="bg-white border border-border rounded-2xl">
    <div className="flex items-center justify-between p-5 border-b border-border">
      <h2 className="text-base font-bold text-foreground">Новые запросы RFQ</h2>
      <Link
        href="/supplier/rfqs"
        className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
      >
        Все RFQ <ArrowRight size={14} />
      </Link>
    </div>

    {!hydrated || rfqs.length === 0 ? (
      <div className="p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
          <Inbox size={22} className="text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">Новых RFQ нет</p>
        <p className="text-xs text-muted-foreground mt-1">
          Открытые запросы заказчиков появятся здесь
        </p>
      </div>
    ) : (
      <div className="divide-y divide-border">
        {rfqs.slice(0, 5).map((rfq) => {
          const meta = rfqStatusMeta[rfq.status]
          return (
            <Link
              key={rfq.id}
              href={`/supplier/rfqs/${rfq.id}`}
              className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                {rfq.type === "product" ? (
                  <ShoppingCart size={17} className="text-primary" />
                ) : (
                  <FileText size={17} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{rfq.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatRfqBudget(rfq.budget_type, rfq.budget_from, rfq.budget_to, rfq.currency)}
                  {" · "}
                  {formatRelativeIso(rfq.created_at)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-muted-foreground">
                  до {formatRelativeIso(rfq.deadline)}
                </div>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${meta.className}`}>
                  {meta.label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    )}
  </div>
)
