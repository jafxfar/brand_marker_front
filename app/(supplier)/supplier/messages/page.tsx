"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageSquare, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import type { ContractWithRelations } from "@/types"

type ConversationItem = {
  contract: ContractWithRelations
  lastMessage: {
    id: number
    sender_id: number
    text: string
  }
  senderName: string
}

export default function SupplierMessagesPage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const getContractsForSupplier = useContractsStore((s) => s.getContractsForSupplier)
  const markConversationRead = useContractsStore((s) => s.markConversationRead)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const contracts = hydrated ? getContractsForSupplier(actorId) : []

  const conversations: ConversationItem[] = contracts
    .filter((c) => (c.conversation?.messages.length ?? 0) > 0)
    .map((contract) => {
      const messages = contract.conversation!.messages
      const lastMessage = messages[messages.length - 1]!
      const isBuyer = lastMessage.sender_id === contract.buyer_actor_id
      const senderName = isBuyer
        ? getCompany(contract.buyer_actor_id)?.title ?? "Заказчик"
        : getCompany(contract.supplier_actor_id)?.title ?? "Вы"
      return { contract, lastMessage, senderName }
    })
    .sort((a, b) => b.lastMessage.id - a.lastMessage.id)

  const selected = conversations.find((c) => c.contract.id === selectedId)

  const handleSelect = (contractId: number) => {
    setSelectedId(contractId)
    markConversationRead(contractId)
  }

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <MessageSquare size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Сообщения</h1>
          <p className="text-sm text-muted-foreground">Переписка по контрактам</p>
        </div>
      </div>

      {!hydrated || conversations.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <MessageSquare size={32} className="text-primary mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Сообщений нет</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[480px]">
          <div className="lg:col-span-2 bg-white border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {conversations.map((item) => (
              <button
                key={item.contract.id}
                type="button"
                onClick={() => handleSelect(item.contract.id)}
                className={cn(
                  "w-full text-left p-4 hover:bg-secondary/50 transition-colors flex items-center gap-3",
                  selectedId === item.contract.id && "bg-secondary",
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {item.contract.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {item.senderName}: {item.lastMessage.text}
                  </p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 bg-white border border-border rounded-2xl p-6">
            {!selected ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Выберите диалог слева
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                  <div>
                    <h2 className="text-base font-bold text-foreground">{selected.contract.title}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getCompany(selected.contract.buyer_actor_id)?.title ?? "Заказчик"}
                    </p>
                  </div>
                  <Link
                    href={`/supplier/contracts/${selected.contract.id}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Открыть контракт
                  </Link>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {selected.contract.conversation?.messages.map((message) => {
                    const isMine = message.sender_id === actorId
                    const senderName = isMine
                      ? "Вы"
                      : getCompany(message.sender_id)?.title ?? "Заказчик"
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "rounded-xl p-3",
                          isMine
                            ? "bg-primary/5 border border-primary/10 ml-8"
                            : "bg-secondary mr-8",
                        )}
                      >
                        <p className="text-xs font-semibold text-foreground mb-1">{senderName}</p>
                        <p className="text-sm text-muted-foreground">{message.text}</p>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
