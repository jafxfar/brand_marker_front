"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Lock, MessageSquare, Send, XCircle } from "lucide-react"
import type { Proposal, ProposalStatus } from "@/types"
import { formatDeliveryTime, formatMoneyDisplay } from "@/lib/format"
import { ProposalChatDialog } from "@/components/cabinet/rfq/proposal-chat-dialog"
import { Button } from "@/components/ui/button"

type RfqSubmitProposalCardProps = {
  myProposal: Proposal | undefined
  myProposalStatus?: ProposalStatus | null
  contractId?: number | null
  isRfqOpen: boolean
  buyerName: string
  onSubmit: () => void
}

const cardClassName =
  "bg-card border border-border rounded-xl p-6 lg:sticky lg:top-[calc(6rem+280px)]"

type ClosedStateProps = {
  icon: React.ReactNode
  title: string
  text: string
}

const ClosedState = ({ icon, title, text }: ClosedStateProps) => (
  <section className={cardClassName}>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
    <p className="text-sm text-muted-foreground">{text}</p>
  </section>
)

export const RfqSubmitProposalCard = ({
  myProposal,
  myProposalStatus,
  contractId,
  isRfqOpen,
  buyerName,
  onSubmit,
}: RfqSubmitProposalCardProps) => {
  const [chatOpen, setChatOpen] = useState(false)

  const handleOpenChat = () => setChatOpen(true)

  if (contractId) {
    return (
      <section className={cardClassName}>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={18} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Предложение принято</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {buyerName} выбрал вас исполнителем. Работа по заявке продолжается в сделке.
        </p>
        <Button asChild size="lg" className="w-full">
          <Link href={`/supplier/contracts/${contractId}`}>
            Перейти к сделке <ArrowRight />
          </Link>
        </Button>
      </section>
    )
  }

  if (myProposalStatus === "archived") {
    return (
      <ClosedState
        icon={<Lock size={18} className="text-muted-foreground" />}
        title="Заказчик выбрал другого исполнителя"
        text="Приём предложений по этой заявке завершён. Спасибо за участие."
      />
    )
  }

  if (myProposalStatus === "rejected") {
    return (
      <ClosedState
        icon={<XCircle size={18} className="text-muted-foreground" />}
        title="Предложение отклонено"
        text="Заказчик отклонил ваше предложение по этой заявке."
      />
    )
  }

  if (myProposal) {
    return (
      <section className={cardClassName}>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={18} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Вы отправили предложение</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Ваше предложение отправлено заказчику и ожидает рассмотрения.
        </p>
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 space-y-2">
          <div className="flex justify-between gap-3 text-sm min-w-0">
            <span className="text-muted-foreground shrink-0">Цена</span>
            <span className="font-bold text-foreground truncate text-right" title={formatMoneyDisplay(myProposal.price, myProposal.currency)}>
              {formatMoneyDisplay(myProposal.price, myProposal.currency)}
            </span>
          </div>
          {myProposal.delivery_time && (
            <div className="flex justify-between gap-3 text-sm min-w-0">
              <span className="text-muted-foreground shrink-0">Срок</span>
              <span className="font-semibold text-foreground truncate text-right" title={formatDeliveryTime(myProposal.delivery_time)}>
                {formatDeliveryTime(myProposal.delivery_time)}
              </span>
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
      </section>
    )
  }

  if (!isRfqOpen) {
    return (
      <ClosedState
        icon={<Lock size={18} className="text-muted-foreground" />}
        title="Приём предложений закрыт"
        text="Заказчик больше не принимает предложения по этой заявке."
      />
    )
  }

  return (
    <section className={cardClassName}>
      <h2 className="text-sm font-semibold text-foreground mb-2">Отправить предложение</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Укажите цену, срок и сообщение заказчику. Предложение будет видно в списке предложений.
      </p>
      <button
        type="button"
        onClick={onSubmit}
        className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors"
      >
        <Send size={16} /> Отправить предложение
      </button>
    </section>
  )
}
