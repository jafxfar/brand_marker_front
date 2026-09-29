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
  useMarkMessagesReadMutation,
  useSupplierContractsQuery,
  useSupplierSendMessageMutation,
} from "@/hooks/api/use-contracts-query"
import { ContractMessagesPanel } from "@/components/supplier/contracts/contract-messages-panel"
import { ConversationsSidebar } from "@/components/contracts/conversations-sidebar"
import { ChatProjectSwitcher } from "@/components/contracts/chat-project-switcher"
import { groupChatsByCounterpart, pickDefaultProject } from "@/lib/chat-conversations"
import { PageEmptyState, PageFrame, PageHeader, PageSurface } from "@/components/layout"
import type { ContractWithRelations } from "@/types"

export default function SupplierMessagesPage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const userId = user?.userId ?? 0
  const useApi = isApiEnabled()

  const getContractsForSupplier = useContractsStore((s) => s.getContractsForSupplier)
  const markConversationRead = useContractsStore((s) => s.markConversationRead)
  const addMessageLocal = useContractsStore((s) => s.addMessage)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const [selectedCounterpartId, setSelectedCounterpartId] = useState<number | null>(null)
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null)

  const { data: apiContracts, isLoading } = useSupplierContractsQuery(hydrated && useApi)
  const sendMessageMutation = useSupplierSendMessageMutation()
  const markMessagesReadMutation = useMarkMessagesReadMutation("supplier")

  const getBuyerName = (buyerId: number) =>
    getCompany(buyerId)?.title ?? `Заказчик #${buyerId}`

  const contracts = useApi
    ? ((apiContracts ?? []) as ContractWithRelations[])
    : hydrated
      ? getContractsForSupplier(actorId)
      : []

  const groups = useMemo(
    () =>
      groupChatsByCounterpart(
        contracts,
        userId,
        (contract) => contract.buyer_actor_id,
        (contract) => getBuyerName(contract.buyer_actor_id),
      ),
    [contracts, userId, getCompany],
  )
  const selectedGroup = groups.find((g) => g.counterpartId === selectedCounterpartId)
  const selected = selectedGroup
    ? (selectedGroup.projects.find((p) => p.contract.id === selectedContractId)
      ?? pickDefaultProject(selectedGroup))
    : undefined

  const handleSelectProject = (contractId: number) => {
    setSelectedContractId(contractId)
    if (!useApi) markConversationRead(contractId)
  }

  const handleSelectCounterpart = (counterpartId: number) => {
    setSelectedCounterpartId(counterpartId)
    const group = groups.find((g) => g.counterpartId === counterpartId)
    const project = group ? pickDefaultProject(group) : undefined
    if (project) handleSelectProject(project.contract.id)
  }

  if (useApi && isLoading) {
    return (
      <PageFrame className="animate-pulse">
        <div className="mb-6 h-10 w-1/3 rounded bg-secondary" />
        <div className="h-64 rounded-xl bg-secondary" />
      </PageFrame>
    )
  }

  return (
    <PageFrame>
      <PageHeader
        title="Сообщения"
        description="Переписка по сделкам с заказчиками"
      />

      {groups.length === 0 ? (
        <PageSurface>
          <PageEmptyState
            icon={<MessageSquare size={32} />}
            title="Сообщений пока нет"
            description="Чат появится, когда начнётся сделка"
          />
        </PageSurface>
      ) : (
        <div className="grid md:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-220px)] min-h-[420px]">
          <ConversationsSidebar
            groups={groups}
            selectedId={selectedCounterpartId}
            onSelect={handleSelectCounterpart}
            searchPlaceholder="Поиск по заказчику или проекту..."
          />

          <div className="min-h-0 flex flex-col gap-2">
            {selectedGroup && selected ? (
              <>
                <ChatProjectSwitcher
                  projects={selectedGroup.projects}
                  selectedContractId={selected.contract.id}
                  onSelect={handleSelectProject}
                />
                <ContractMessagesPanel
                  key={selected.contract.id}
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
                  href={`/supplier/contracts/${selected.contract.id}`}
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 px-1"
                >
                  Открыть сделку <ChevronRight size={14} />
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
