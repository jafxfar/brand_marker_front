"use client"

import { useState } from "react"
import { CheckCircle2, MessageSquare, Send } from "lucide-react"
import type { Proposal } from "@/types"
import { formatCurrency } from "@/lib/format"
import { ProposalChatDialog } from "@/components/cabinet/rfq/proposal-chat-dialog"

type RfqSubmitProposalCardProps = {
  myProposal: Proposal | undefined
  buyerName: string
  onSubmit: () => void
}

export const RfqSubmitProposalCard = ({
  myProposal,
  buyerName,
  onSubmit,
}: RfqSubmitProposalCardProps) => {
  const [chatOpen, setChatOpen] = useState(false)

  const handleOpenChat = () => setChatOpen(true)

  return (
    <section className="bg-card border border-border rounded-xl p-6 lg:sticky lg:top-[calc(6rem+280px)]">
      {myProposal ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Вы откликнулись</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Ваше предложение отправлено заказчику и ожидает рассмотрения.
          </p>
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 space-y-2">
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
          <button
            type="button"
            onClick={handleOpenChat}
            aria-label="Обсудить проект"
            className="mt-4 w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-border text-sm font-bold hover:bg-secondary transition-colors"
          >
            <MessageSquare size={16} /> Обсудить проект
          </button>
          <ProposalChatDialog
            open={chatOpen}
            onOpenChange={setChatOpen}
            proposalId={myProposal.id}
            proposalStatus={myProposal.status}
            side="supplier"
            peerName={buyerName}
          />
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2">Отправить предложение</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Укажите цену, срок и сообщение заказчику. Предложение будет видно в списке откликов.
          </p>
          <button
            type="button"
            onClick={onSubmit}
            className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors"
          >
            <Send size={16} /> Отправить предложение
          </button>
        </div>
      )}
    </section>
  )
}
