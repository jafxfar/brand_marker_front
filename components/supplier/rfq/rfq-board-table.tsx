"use client"

import Link from "next/link"
import { Check, Clock, Send } from "lucide-react"
import type { RfqWithRelations } from "@/types"
import { cn } from "@/lib/utils"
import { useCategoryOptions } from "@/hooks/use-category-options"
import { formatCurrency, formatDaysLeft, formatRfqBudget, getDaysLeft } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { BuyerRating } from "@/components/supplier/rfq/buyer-rating"

type MyProposalSummary = { price: number; currency: string }

type RfqBoardTableProps = {
  rfqs: RfqWithRelations[]
  actorId: number
  hasProposal: (rfqId: string, actorId: number) => boolean
  getMyProposal?: (rfqId: string) => MyProposalSummary | undefined
  getBuyerName: (rfq: RfqWithRelations) => string
  getBuyerRating: (rfq: RfqWithRelations) => number
  onSubmitProposal: (rfqId: string) => void
}

const URGENT_DAYS = 3

export const RfqBoardTable = ({
  rfqs,
  actorId,
  hasProposal,
  getMyProposal,
  getBuyerName,
  getBuyerRating,
  onSubmitProposal,
}: RfqBoardTableProps) => {
  const { getRfqCategoryLabel } = useCategoryOptions()

  return (
    <ul className="grid gap-3">
      {rfqs.map((rfq) => {
        const responded = hasProposal(rfq.id, actorId)
        const myProposal = responded ? getMyProposal?.(rfq.id) : undefined
        const buyerRating = getBuyerRating(rfq)
        const daysLeft = getDaysLeft(rfq.deadline)
        const urgent = daysLeft <= URGENT_DAYS

        return (
          <li
            key={rfq.id}
            className={cn(
              "grid gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5",
              responded ? "border-border" : "border-border hover:border-primary transition-colors",
            )}
          >
            <div className="min-w-0 grid gap-1.5">
              <Link
                href={`/supplier/rfqs/${rfq.id}`}
                className="font-bold text-foreground hover:text-primary line-clamp-2"
              >
                {rfq.title}
              </Link>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span>
                  {getBuyerName(rfq)}
                  {rfq.buyer?.kind === "individual" ? " · частное лицо" : ""}
                </span>
                {buyerRating > 0 ? <BuyerRating rating={buyerRating} compact /> : null}
                <span aria-hidden="true">·</span>
                <span>{getRfqCategoryLabel(rfq.category_id)}</span>
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="font-semibold tnum">
                  {formatRfqBudget(rfq.budget_type, rfq.budget_from, rfq.budget_to, rfq.currency)}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1",
                    urgent ? "font-semibold text-amber-600" : "text-muted-foreground",
                  )}
                >
                  <Clock size={14} aria-hidden="true" />
                  {formatDaysLeft(daysLeft)}
                </span>
              </div>
            </div>

            {responded ? (
              <div className="grid gap-1 sm:justify-items-end">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  <Check size={16} aria-hidden="true" /> Предложение отправлено
                </span>
                {myProposal ? (
                  <span className="text-sm text-muted-foreground">
                    Ваша цена:{" "}
                    <b className="text-foreground tnum">
                      {formatCurrency(myProposal.price, myProposal.currency)}
                    </b>
                  </span>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button asChild variant="outline">
                  <Link href={`/supplier/rfqs/${rfq.id}`}>Подробнее</Link>
                </Button>
                <Button onClick={() => onSubmitProposal(rfq.id)}>
                  <Send /> Предложить цену
                </Button>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
