"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageSquare, ChevronRight } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import { useContractsQuery } from "@/hooks/api/use-contracts-query"
import { useSupplierActorName } from "@/hooks/api/use-supplier-name"
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

const buildConversations = (
  contracts: ContractWithRelations[],
  getSupplierName: (id: number) => string,
): ConversationItem[] =>
  contracts
    .filter((c) => (c.conversation?.messages.length ?? 0) > 0)
    .map((contract) => {
      const messages = contract.conversation!.messages
      const lastMessage = messages[messages.length - 1]!
      const isSupplier = lastMessage.sender_id === contract.supplier_actor_id
      const senderName = isSupplier
        ? getSupplierName(contract.supplier_actor_id)
        : "Вы"
      return { contract, lastMessage, senderName }
    })
    .sort((a, b) => b.lastMessage.id - a.lastMessage.id)

export default function BuyerMessagesPage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const useApi = isApiEnabled()

  const getContractsForBuyer = useContractsStore((s) => s.getContractsForBuyer)
  const markConversationRead = useContractsStore((s) => s.markConversationRead)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: apiContracts, isLoading } = useContractsQuery(hydrated && useApi)

  const contracts = useApi
    ? ((apiContracts ?? []) as ContractWithRelations[])
    : hydrated
      ? getContractsForBuyer(actorId)
      : []

  const supplierIds = contracts.map((c) => c.supplier_actor_id)
  const resolveSupplierName = useSupplierActorName(supplierIds)

  const getSupplierName = (supplierId: number) => {
    if (useApi) return resolveSupplierName(supplierId)
    return getCompany(supplierId)?.title ?? `Поставщик #${supplierId}`
  }

  const conversations = buildConversations(contracts, getSupplierName)
  const selected = conversations.find((c) => c.contract.id === selectedId)

  const handleSelect = (contractId: number) => {
    setSelectedId(contractId)
    if (!useApi) markConversationRead(contractId)
  }

  if (useApi && isLoading) {
    return (
      <div className="max-w-[900px] mx-auto animate-pulse">
        <div className="h-10 bg-secondary rounded w-1/3 mb-6" />
        <div className="h-64 bg-secondary rounded-2xl" />
      </div>
    )
  }

  if (useApi) {
    return (
      <div className="max-w-[900px] mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <MessageSquare size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Сообщения</h1>
            <p className="text-sm text-muted-foreground">
              Переписка по контрактам с поставщиками
            </p>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-12 text-center">
            <MessageSquare size={32} className="text-primary mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">Сообщений пока нет</p>
            <p className="text-xs text-muted-foreground mt-1">
              Сообщения появятся в активных контрактах
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(({ contract, lastMessage, senderName }) => (
              <Link
                key={contract.id}
                href={`/customer/contracts/${contract.id}`}
                className="flex items-center gap-4 bg-white border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {contract.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {senderName}: {lastMessage.text}
                  </p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <MessageSquare size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Сообщения</h1>
          <p className="text-sm text-muted-foreground">Переписка по контрактам</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <MessageSquare size={32} className="text-primary mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Сообщений пока нет</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 h-[calc(100vh-220px)] min-h-[400px]">
          <div className="bg-white border border-border rounded-2xl overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1 divide-y divide-border">
              {conversations.map(({ contract, lastMessage, senderName }) => (
                <button
                  key={contract.id}
                  type="button"
                  onClick={() => handleSelect(contract.id)}
                  className={`w-full text-left p-4 hover:bg-secondary/50 transition-colors ${
                    selectedId === contract.id ? "bg-secondary" : ""
                  }`}
                >
                  <p className="text-sm font-bold text-foreground truncate">{contract.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {senderName}: {lastMessage.text}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-4 flex flex-col">
            {selected ? (
              <>
                <p className="text-sm font-bold text-foreground mb-4">{selected.contract.title}</p>
                <div className="flex-1 overflow-y-auto space-y-3">
                  {selected.contract.conversation?.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-xl px-3 py-2 text-sm max-w-[85%] ${
                        msg.sender_id === actorId
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
                <Link
                  href={`/customer/contracts/${selected.contract.id}`}
                  className="mt-4 text-xs font-semibold text-primary hover:underline"
                >
                  Открыть контракт
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground m-auto">Выберите диалог</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
