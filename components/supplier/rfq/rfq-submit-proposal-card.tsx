"use client"

import { Send, CheckCircle2 } from "lucide-react"
import type { Proposal } from "@/types"
import { formatCurrency } from "@/lib/format"

type RfqSubmitProposalCardProps = {
  myProposal: Proposal | undefined
  onSubmit: () => void
}

export const RfqSubmitProposalCard = ({
  myProposal,
  onSubmit,
}: RfqSubmitProposalCardProps) => (
  <section className="bg-white border border-border rounded-2xl p-6 lg:sticky lg:top-[calc(6rem+280px)]">
    {myProposal ? (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <h2 className="text-base font-bold text-foreground">Вы откликнулись</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Ваше предложение отправлено заказчику и ожидает рассмотрения.
        </p>
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Цена</span>
            <span className="font-bold text-foreground">
              {formatCurrency(myProposal.price, myProposal.currency)}
            </span>
          </div>
          {myProposal.delivery_time && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Срок</span>
              <span className="font-semibold text-foreground">{myProposal.delivery_time}</span>
            </div>
          )}
        </div>
      </div>
    ) : (
      <div>
        <h2 className="text-base font-bold text-foreground mb-2">Отправить предложение</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Укажите цену, срок и сообщение заказчику. Предложение будет видно в списке откликов.
        </p>
        <button
          type="button"
          onClick={onSubmit}
          className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-bold transition-colors"
        >
          <Send size={16} /> Отправить предложение
        </button>
      </div>
    )}
  </section>
)
