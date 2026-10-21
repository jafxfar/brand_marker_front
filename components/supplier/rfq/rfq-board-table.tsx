"use client"

import Link from "next/link"
import { Check, Clock, Send, XCircle } from "lucide-react"
import type { ProposalStatus, RfqWithRelations } from "@/types"
import { cn } from "@/lib/utils"
import { useCategoryOptions } from "@/hooks/use-category-options"
import { formatCurrency, formatDaysLeft, formatRfqBudget, getDaysLeft } from "@/lib/format"
import { proposalStatusMeta } from "@/lib/proposal-display"
import { isRfqInvitedFor } from "@/lib/rfq-display"
import { isCatalogOfferRfq, isPendingCatalogOffer } from "@/lib/rfq-board"
import { Button } from "@/components/ui/button"
import { BuyerRating } from "@/components/supplier/rfq/buyer-rating"
import { InvitedRfqBadge } from "@/components/supplier/rfq/invited-rfq-badge"
import { CatalogOfferBadge } from "@/components/supplier/rfq/catalog-offer-badge"

type MyProposalSummary = {
  price: number
  currency: string
  status: ProposalStatus
}

type RfqBoardTableProps = {
  rfqs: RfqWithRelations[]
  actorId: number
  getMyProposal?: (rfqId: string) => MyProposalSummary | undefined
  getBuyerName: (rfq: RfqWithRelations) => string
  getBuyerRating: (rfq: RfqWithRelations) => number
  onSubmitProposal: (rfqId: string) => void
}

const URGENT_DAYS = 3

const statusIcon = (status: ProposalStatus) => {
  if (status === "rejected" || status === "withdrawn" || status === "archived") {
    return <XCircle size={16} aria-hidden="true" />
  }
  return <Check size={16} aria-hidden="true" />
}

const statusToneClass = (status: ProposalStatus) => {
  if (status === "rejected") return "text-destructive"
  if (status === "pending_supplier") return "text-amber-600"
  if (status === "accepted" || status === "submitted" || status === "viewed") {
    return "text-primary"
  }
  if (status === "shortlisted") return "text-amber-600"
  return "text-muted-foreground"
}

export const RfqBoardTable = ({
  rfqs,
  actorId,
  getMyProposal,
  getBuyerName,
  getBuyerRating,
  onSubmitProposal,
}: RfqBoardTableProps) => {
  const { getRfqCategoryLabel } = useCategoryOptions()

  return (
    <ul className="grid gap-3">
      {rfqs.map((rfq) => {
        const myProposal =
          getMyProposal?.(rfq.id) ??
          (rfq.my_proposal_status
            ? {
                price: 0,
                currency: rfq.currency,
                status: rfq.my_proposal_status,
              }
            : undefined)
        const catalogOffer = isCatalogOfferRfq(rfq)
        const pendingOffer = isPendingCatalogOffer(myProposal?.status)
        const responded = Boolean(myProposal) && !pendingOffer
        const buyerRating = getBuyerRating(rfq)
        const daysLeft = getDaysLeft(rfq.deadline)
        const urgent = daysLeft <= URGENT_DAYS
        const statusMeta = myProposal
          ? proposalStatusMeta[myProposal.status]
          : null

        return (
          <li
            key={rfq.id}
            className={cn(
              "grid gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5",
              pendingOffer
                ? "border-amber-300/80 hover:border-amber-400 transition-colors"
                : responded
                  ? "border-border"
                  : "border-border hover:border-primary transition-colors",
            )}
          >
            <div className="min-w-0 grid gap-1.5">
              <div className="flex flex-wrap gap-2">
                {catalogOffer ? (
                  <CatalogOfferBadge className="justify-self-start" />
                ) : isRfqInvitedFor(rfq, actorId) ? (
                  <InvitedRfqBadge className="justify-self-start" />
                ) : null}
              </div>
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
                {!catalogOffer && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1",
                      urgent ? "font-semibold text-amber-600" : "text-muted-foreground",
                    )}
                  >
                    <Clock size={14} aria-hidden="true" />
                    {formatDaysLeft(daysLeft)}
                  </span>
                )}
              </div>
            </div>

            {pendingOffer && myProposal ? (
              <div className="grid gap-1 sm:justify-items-end">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-semibold",
                    statusToneClass(myProposal.status),
                  )}
                >
                  Ждёт вашего решения
                </span>
                {myProposal.price > 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Цена заказчика:{" "}
                    <b className="text-foreground tnum">
                      {formatCurrency(myProposal.price, myProposal.currency)}
                    </b>
                  </span>
                ) : null}
                <Button asChild size="sm" className="mt-1">
                  <Link href={`/supplier/rfqs/${rfq.id}`}>Принять или отклонить</Link>
                </Button>
              </div>
            ) : responded && myProposal && statusMeta ? (
              <div className="grid gap-1 sm:justify-items-end">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-semibold",
                    statusToneClass(myProposal.status),
                  )}
                >
                  {statusIcon(myProposal.status)}
                  {myProposal.status === "submitted" || myProposal.status === "viewed"
                    ? "Предложение отправлено"
                    : myProposal.status === "rejected"
                      ? "Предложение отклонено"
                      : myProposal.status === "accepted"
                        ? "Предложение принято"
                        : myProposal.status === "archived"
                          ? "Выбран другой исполнитель"
                          : statusMeta.label}
                </span>
                {myProposal.price > 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Ваша цена:{" "}
                    <b className="text-foreground tnum">
                      {formatCurrency(myProposal.price, myProposal.currency)}
                    </b>
                  </span>
                ) : null}
                <Button asChild variant="outline" size="sm" className="mt-1">
                  <Link href={`/supplier/rfqs/${rfq.id}`}>Подробнее</Link>
                </Button>
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
