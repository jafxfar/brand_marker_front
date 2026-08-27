"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  FileText, Inbox, FileCheck, Wallet, AlertTriangle, MessageSquare, Plus, ArrowRight,
} from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId, getUserDisplayName } from "@/lib/auth-display"
import { formatPrice } from "@/lib/format"
import { isApiEnabled } from "@/lib/api/config"
import { useActiveRfqsQuery } from "@/hooks/api/use-rfqs-query"
import { useContractsQuery } from "@/hooks/api/use-contracts-query"
import { usePendingPaymentsQuery } from "@/hooks/api/use-payments-query"
import { useQueries } from "@tanstack/react-query"
import { proposalsApi } from "@/lib/api/proposals"
import { proposalKeys } from "@/hooks/api/use-proposals-query"
import { useSupplierActorName } from "@/hooks/api/use-supplier-name"
import {
  getActiveBuyerContracts,
  getBuyerIncomingMessages,
  getBuyerIncomingProposals,
  getBuyerNewProposalsCount,
  getBuyerUnreadMessageCount,
} from "@/lib/buyer-dashboard"
import { Button } from "@/components/ui/button"
import { PageFrame, PageHeader } from "@/components/layout"
import { StatCard } from "@/components/supplier/dashboard/stat-card"
import { ActiveRfqsPanel } from "@/components/cabinet/dashboard/active-rfqs-panel"
import { IncomingProposalsPanel } from "@/components/cabinet/dashboard/incoming-proposals-panel"
import { BuyerActiveContractsPanel } from "@/components/cabinet/dashboard/buyer-active-contracts-panel"
import { BuyerPendingPaymentsPanel } from "@/components/cabinet/dashboard/buyer-pending-payments-panel"
import { BuyerDisputesPanel } from "@/components/cabinet/dashboard/buyer-disputes-panel"
import { BuyerMessagesPanel } from "@/components/cabinet/dashboard/buyer-messages-panel"
import { ActivateRoleBanner } from "@/components/company/activate-role-banner"
import { HowItWorks } from "@/components/onboarding/how-it-works"
import type { ContractWithRelations, RfqWithRelations } from "@/types"

export default function CustomerDashboard() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const useApi = isApiEnabled()

  const getActiveRfqsByBuyer = useRfqsStore((s) => s.getActiveRfqsByBuyer)
  const getRfqWithRelations = useRfqsStore((s) => s.getRfqWithRelations)
  const getIncomingProposalsForBuyer = useProposalsStore((s) => s.getIncomingProposalsForBuyer)
  const getNewProposalsCountForBuyer = useProposalsStore((s) => s.getNewProposalsCountForBuyer)
  const getActiveContractsForBuyer = useContractsStore((s) => s.getActiveContractsForBuyer)
  const getPendingPaymentsForBuyer = useContractsStore((s) => s.getPendingPaymentsForBuyer)
  const getPendingMilestonesForBuyer = useContractsStore((s) => s.getPendingMilestonesForBuyer)
  const getDisputesForBuyer = useContractsStore((s) => s.getDisputesForBuyer)
  const getIncomingMessagesForBuyer = useContractsStore((s) => s.getIncomingMessagesForBuyer)
  const getUnreadMessageCountForBuyer = useContractsStore((s) => s.getUnreadMessageCountForBuyer)
  const getCompany = useCompaniesStore((s) => s.getCompany)

  const { data: apiActiveRfqs = [] } = useActiveRfqsQuery(hydrated && useApi)
  const { data: apiContracts = [] } = useContractsQuery(hydrated && useApi)
  const { data: pendingPayments } = usePendingPaymentsQuery(hydrated && useApi)

  const proposalQueries = useQueries({
    queries: (useApi ? apiActiveRfqs : []).map((rfq) => ({
      queryKey: proposalKeys.forRfq(rfq.id),
      queryFn: () => proposalsApi.listForRfq(rfq.id),
      enabled: hydrated && useApi,
    })),
  })

  const proposalsByRfq = useMemo(() => {
    const map = new Map<string, import("@/types").Proposal[]>()
    if (!useApi) return map
    apiActiveRfqs.forEach((rfq, index) => {
      const data = proposalQueries[index]?.data
      if (data) map.set(rfq.id, data)
    })
    return map
  }, [useApi, apiActiveRfqs, proposalQueries])

  const getRfqTitle = (rfqId: string) => {
    if (useApi) {
      return apiActiveRfqs.find((r) => r.id === rfqId)?.title ?? "Заявка"
    }
    return getRfqWithRelations(rfqId)?.title ?? "Заявка"
  }

  const getRfqActorId = (rfqId: string) => {
    if (useApi) {
      return apiActiveRfqs.find((r) => r.id === rfqId)?.actor_id
    }
    return getRfqWithRelations(rfqId)?.actor_id
  }

  const getSupplierNameLocal = (supplierId: number) =>
    getCompany(supplierId)?.title ?? `Исполнитель #${supplierId}`

  const supplierIds = useApi
    ? (apiContracts as ContractWithRelations[]).map((c) => c.supplier_actor_id)
    : []
  const resolveSupplierName = useSupplierActorName(supplierIds)

  const getSupplierName = (supplierId: number) =>
    useApi ? resolveSupplierName(supplierId) : getSupplierNameLocal(supplierId)

  const localActiveRfqs = hydrated ? getActiveRfqsByBuyer(actorId) : []
  const activeRfqs: RfqWithRelations[] = useApi ? apiActiveRfqs : localActiveRfqs

  const incomingProposals = hydrated
    ? useApi
      ? getBuyerIncomingProposals(apiActiveRfqs, proposalsByRfq, actorId)
      : getIncomingProposalsForBuyer(actorId, getRfqTitle, getRfqActorId)
    : []

  const newProposalsCount = hydrated
    ? useApi
      ? getBuyerNewProposalsCount(apiActiveRfqs, proposalsByRfq, actorId)
      : getNewProposalsCountForBuyer(actorId, getRfqActorId)
    : 0

  const localActiveContracts = hydrated ? getActiveContractsForBuyer(actorId) : []
  const apiActiveContracts = getActiveBuyerContracts(
    apiContracts as ContractWithRelations[],
  )
  const activeContracts = useApi ? apiActiveContracts : localActiveContracts

  const pendingAmount = useApi
    ? (pendingPayments?.items.reduce((sum, p) => sum + p.amount, 0) ?? 0)
    : hydrated
      ? getPendingPaymentsForBuyer(actorId)
      : 0

  const pendingMilestones = useApi
    ? (pendingPayments?.items.map((p) => {
        const contract = (apiContracts as ContractWithRelations[]).find(
          (c) => c.id === p.contract_id,
        )
        return {
          contract: {
            id: p.contract_id,
            title: contract?.title ?? `Контракт #${p.contract_id}`,
          },
          title: p.title,
          amount: p.amount,
          currency: p.currency,
        }
      }) ?? [])
    : hydrated
      ? getPendingMilestonesForBuyer(actorId).map((m) => ({
          contract: { id: m.contract.id, title: m.contract.title },
          title: m.title,
          amount: m.amount,
          currency: m.currency,
        }))
      : []

  const disputes = useApi
    ? (apiContracts as ContractWithRelations[]).filter((c) => c.status === "disputed")
    : hydrated
      ? getDisputesForBuyer(actorId)
      : []

  const messages = hydrated
    ? useApi
      ? getBuyerIncomingMessages(
          apiContracts as ContractWithRelations[],
          actorId,
          getSupplierName,
        )
      : getIncomingMessagesForBuyer(actorId, getSupplierNameLocal)
    : []

  const unreadCount = hydrated
    ? useApi
      ? getBuyerUnreadMessageCount(apiContracts as ContractWithRelations[], actorId)
      : getUnreadMessageCountForBuyer(actorId)
    : 0

  return (
    <PageFrame>
      <ActivateRoleBanner
        targetSide="supplier"
        redirectTo="/supplier"
        label="Хотите продавать на платформе? Активируйте роль исполнителя на этом же аккаунте."
      />
      <PageHeader
        title={`Здравствуйте${hydrated && user ? `, ${getUserDisplayName(user)}` : ""}!`}
        description="Ваши заявки, предложения и договоры"
        actions={
          <Button asChild size="lg">
            <Link href="/customer/rfqs/new">
              <Plus size={17} /> Создать заявку
            </Link>
          </Button>
        }
      />

      <HowItWorks variant="buyer" />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          Icon={FileText}
          label="Активные заявки"
          value={hydrated ? String(activeRfqs.length) : "—"}
          accent="bg-info/10 text-info"
        />
        <StatCard
          Icon={Inbox}
          label="Входящие предложения"
          value={hydrated ? String(newProposalsCount) : "—"}
          accent="bg-primary/10 text-primary"
        />
        <StatCard
          Icon={FileCheck}
          label="Активные контракты"
          value={hydrated ? String(activeContracts.length) : "—"}
          accent="bg-muted text-muted-foreground"
        />
        <StatCard
          Icon={Wallet}
          label="Ожидают оплаты"
          value={hydrated ? formatPrice(pendingAmount) : "—"}
          accent="bg-secondary text-secondary-foreground"
        />
        <StatCard
          Icon={AlertTriangle}
          label="Споры"
          value={hydrated ? String(disputes.length) : "—"}
          accent="bg-destructive/10 text-destructive"
        />
        <StatCard
          Icon={MessageSquare}
          label="Сообщения"
          value={hydrated ? String(unreadCount) : "—"}
          subValue={hydrated && unreadCount > 0 ? "непрочитанных" : undefined}
          accent="bg-warning/10 text-warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ActiveRfqsPanel rfqs={activeRfqs} hydrated={hydrated} />
          <IncomingProposalsPanel items={incomingProposals} hydrated={hydrated} />
          <BuyerActiveContractsPanel
            contracts={activeContracts}
            hydrated={hydrated}
            getSupplierName={getSupplierName}
          />
        </div>

        <div className="space-y-4">
          <BuyerPendingPaymentsPanel milestones={pendingMilestones} hydrated={hydrated} />
          <BuyerDisputesPanel contracts={disputes} hydrated={hydrated} />
          <BuyerMessagesPanel messages={messages} hydrated={hydrated} />
          <Link
            href="/customer/suppliers"
            className="block bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all text-sm font-bold text-foreground hover:text-primary"
          >
            Каталог исполнителей <ArrowRight size={14} className="inline ml-1" />
          </Link>
        </div>
      </div>
    </PageFrame>
  )
}
