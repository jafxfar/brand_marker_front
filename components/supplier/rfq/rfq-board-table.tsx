"use client"

import Link from "next/link"
import { Send } from "lucide-react"
import type { RfqWithRelations } from "@/types"
import { getRfqCategoryLabel } from "@/lib/mock/rfq-categories"
import { formatIsoDate, formatRfqBudget } from "@/lib/format"
import { BuyerRating } from "@/components/supplier/rfq/buyer-rating"

type RfqBoardTableProps = {
  rfqs: RfqWithRelations[]
  actorId: number
  hasProposal: (rfqId: string, actorId: number) => boolean
  getBuyerRating: (buyerId: number) => number
  onSubmitProposal: (rfqId: string) => void
}

export const RfqBoardTable = ({
  rfqs,
  actorId,
  hasProposal,
  getBuyerRating,
  onSubmitProposal,
}: RfqBoardTableProps) => (
  <>
    <div className="hidden md:block bg-white border border-border rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/40">
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">RFQ</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Категория</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Бюджет</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Дедлайн</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Рейтинг заказчика</th>
            <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rfqs.map((rfq) => {
            const responded = hasProposal(rfq.id, actorId)
            const buyerRating = getBuyerRating(Number(rfq.actor_id))
            return (
              <tr key={rfq.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/supplier/rfqs/${rfq.id}`}
                    className="font-semibold text-foreground hover:text-primary line-clamp-2"
                  >
                    {rfq.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {getRfqCategoryLabel(rfq.category_id)}
                </td>
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                  {formatRfqBudget(rfq.budget_type, rfq.budget_from, rfq.budget_to, rfq.currency)}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatIsoDate(rfq.deadline)}
                </td>
                <td className="px-4 py-3">
                  <BuyerRating rating={buyerRating} />
                </td>
                <td className="px-4 py-3 text-right">
                  {responded ? (
                    <span className="inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      Отклик отправлен
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSubmitProposal(rfq.id)
                      }}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground text-xs font-bold transition-colors"
                    >
                      <Send size={13} /> Отправить предложение
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>

    <div className="md:hidden space-y-3">
      {rfqs.map((rfq) => {
        const responded = hasProposal(rfq.id, actorId)
        const buyerRating = getBuyerRating(Number(rfq.actor_id))
        return (
          <div key={rfq.id} className="bg-white border border-border rounded-2xl p-4 space-y-3">
            <Link href={`/supplier/rfqs/${rfq.id}`} className="block">
              <p className="text-sm font-bold text-foreground">{rfq.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {getRfqCategoryLabel(rfq.category_id)}
              </p>
            </Link>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Бюджет</p>
                <p className="font-semibold text-foreground mt-0.5">
                  {formatRfqBudget(rfq.budget_type, rfq.budget_from, rfq.budget_to, rfq.currency)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Дедлайн</p>
                <p className="font-semibold text-foreground mt-0.5">{formatIsoDate(rfq.deadline)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Рейтинг заказчика</p>
                <div className="mt-0.5">
                  <BuyerRating rating={buyerRating} compact />
                </div>
              </div>
            </div>
            {responded ? (
              <span className="inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                Отклик отправлен
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onSubmitProposal(rfq.id)}
                className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
              >
                <Send size={14} /> Отправить предложение
              </button>
            )}
          </div>
        )
      })}
    </div>
  </>
)
