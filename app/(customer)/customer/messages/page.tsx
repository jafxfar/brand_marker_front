"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { MessageSquare, ChevronRight } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import {
  useContractsQuery,
  useMarkMessagesReadMutation,
  useSendMessageMutation,
} from "@/hooks/api/use-contracts-query"
import { useSupplierActorName } from "@/hooks/api/use-supplier-name"
import { ContractMessagesPanel } from "@/components/supplier/contracts/contract-messages-panel"
import { ConversationsSidebar } from "@/components/contracts/conversations-sidebar"
import { buildChatConversations } from "@/lib/chat-conversations"
import { PageEmptyState, PageFrame, PageHeader, PageSurface } from "@/components/layout"
import type { ContractWithRelations } from "@/types"

export default function BuyerMessagesPage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const userId = user?.userId ?? 0
  const useApi = isApiEnabled()

  const getContractsForBuyer = useContractsStore((s) => s.getContractsForBuyer)
  const markConversationRead = useContractsStore((s) => s.markConversationRead)
  const addMessageLocal = useContractsStore((s) => s.addMessage)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: apiContracts, isLoading } = useContractsQuery(hydrated && useApi)
  const sendMessageMutation = useSendMessageMutation()
  const markMessagesReadMutation = useMarkMessagesReadMutation("buyer")

  const contracts = useApi
    ? ((apiContracts ?? []) as ContractWithRelations[])
    : hydrated
      ? getContractsForBuyer(actorId)
      : []

  const supplierIds = contracts.map((c) => c.supplier_actor_id)
  const resolveSupplierName = useSupplierActorName(supplierIds)

  const getSupplierName = (supplierId: number) => {
    if (useApi) return resolveSupplierName(supplierId)
    return getCompany(supplierId)?.title ?? `Исполнитель #${supplierId}`
  }

  const conversations = useMemo(
    () =>
      buildChatConversations(contracts, userId, (contract) =>
        getSupplierName(contract.supplier_actor_id),
      ),
    [contracts, userId, useApi, resolveSupplierName],
  )
  const selected = conversations.find((c) => c.contract.id === selectedId)

  const handleSelect = (contractId: number) => {
    setSelectedId(contractId)
    if (!useApi) markConversationRead(contractId)
  }

  if (useApi && isLoading) {
    return (
      <PageFrame className="animate-pulse">
        <div className="h-10 w-1/3 rounded-xl bg-secondary" />
        <div className="h-64 rounded-xl bg-secondary" />
      </PageFrame>
    )
  }

  return (
    <PageFrame>
      <PageHeader
        title="Сообщения"
        description="Переписка по контрактам с исполнителями"
      />

      {conversations.length === 0 ? (
        <PageSurface>
          <PageEmptyState
            icon={<MessageSquare size={32} />}
            title="Сообщений пока нет"
            description="Сообщения появятся в активных контрактах"
          />
        </PageSurface>
      ) : (
        <div className="grid md:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-220px)] min-h-[420px]">
          <ConversationsSidebar
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelect}
            searchPlaceholder="Поиск по названию, исполнителю..."
          />

          <div className="min-h-0 flex flex-col gap-2">
            {selected ? (
              <>
                <ContractMessagesPanel
                  contract={selected.contract}
                  currentUserId={userId}
                  counterpartName={selected.counterpartName}
                  onSendMessage={(text) => {
                    if (useApi) {
                      sendMessageMutation.mutate({
                        contractId: selected.contract.id,
                        text,
                      })
                      return
                    }
                    addMessageLocal(selected.contract.id, userId, text, user?.name)
                  }}
                  onMarkRead={(id) => {
                    if (useApi) markMessagesReadMutation.mutate(id)
                  }}
                />
                <Link
                  href={`/customer/contracts/${selected.contract.id}`}
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 px-1"
                >
                  Открыть контракт <ChevronRight size={14} />
                </Link>
              </>
            ) : (
              <PageSurface className="flex flex-1 items-center justify-center">
                <p className="text-sm text-muted-foreground">Выберите диалог</p>
              </PageSurface>
            )}
          </div>
        </div>
      )}
    </PageFrame>
  )
}
