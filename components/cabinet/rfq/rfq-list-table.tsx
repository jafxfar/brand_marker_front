"use client"

import Link from "next/link"
import { FileText, ShoppingCart } from "lucide-react"
import type { RfqWithRelations } from "@/types"
import { RfqStatusBadge } from "@/components/rfq/rfq-status-badge"
import { getRfqCategoryLabel } from "@/lib/mock/rfq-categories"
import { formatIsoDate, formatRfqBudget } from "@/lib/format"

type RfqListTableProps = {
  rfqs: RfqWithRelations[]
  getProposalCount: (rfqId: string) => number
  hydrated: boolean
}

export const RfqListTable = ({ rfqs, getProposalCount, hydrated }: RfqListTableProps) => {
  if (!hydrated || rfqs.length === 0) {
    return (
      <div className="p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
          <FileText size={22} className="text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">Заявки не найдены</p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Создайте заявку или смените фильтр
        </p>
        <Link
          href="/customer/rfqs/new"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Создать заявку
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {rfqs.map((rfq) => {
        const proposalsCount = getProposalCount(rfq.id)
        return (
          <Link
            key={rfq.id}
            href={`/customer/rfqs/${rfq.id}`}
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
                {getRfqCategoryLabel(rfq.category_id)} · до {formatIsoDate(rfq.deadline)}
                {proposalsCount > 0 && ` · ${proposalsCount} предл.`}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-bold text-primary">
                {formatRfqBudget(rfq.budget_type, rfq.budget_from, rfq.budget_to, rfq.currency)}
              </div>
              <div className="mt-1">
                <RfqStatusBadge status={rfq.status} />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
