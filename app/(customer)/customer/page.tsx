"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Briefcase, FileText, Lock, Plus } from "lucide-react"
import { useQueries } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId, getUserDisplayName } from "@/lib/auth-display"
import { formatPrice } from "@/lib/format"
import { isApiEnabled } from "@/lib/api/config"
import { useRfqsQuery } from "@/hooks/api/use-rfqs-query"
import { useContractsQuery } from "@/hooks/api/use-contracts-query"
import { proposalsApi } from "@/lib/api/proposals"
import { proposalKeys } from "@/hooks/api/use-proposals-query"
import { useSupplierActorName } from "@/hooks/api/use-supplier-name"
import { getBuyerUnreadMessageCount } from "@/lib/buyer-dashboard"
import { getEscrowSummary } from "@/lib/contract-display"
import { OPEN_RFQ_STATUSES } from "@/lib/rfq-display"
import { isDealOpen } from "@/lib/process/deal-stages"
import { buildBuyerTodo, type BuyerRfqProposalsSummary } from "@/lib/process/todo"
import { Button } from "@/components/ui/button"
import { PageFrame, PageHeader } from "@/components/layout"
import { ActiveRfqsPanel } from "@/components/cabinet/dashboard/active-rfqs-panel"
import { ActivateRoleBanner } from "@/components/company/activate-role-banner"
import { EscrowExplainer, MetricTile, TodoList } from "@/components/process"
import type { ContractWithRelations, Proposal, RfqWithRelations } from "@/types"

const VISIBLE_PROPOSAL_STATUSES: Proposal["status"][] = ["submitted", "viewed", "shortlisted"]

export default function CustomerDashboard() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const userId = user?.userId ?? 0
  const useApi = isApiEnabled()

  const getRfqsByBuyer = useRfqsStore((s) => s.getRfqsByBuyer)
  const getProposalsForRfq = useProposalsStore((s) => s.getProposalsForRfq)
  const getContractsForBuyer = useContractsStore((s) => s.getContractsForBuyer)
  const getUnreadMessageCountForBuyer = useContractsStore((s) => s.getUnreadMessageCountForBuyer)
  const getCompany = useCompaniesStore((s) => s.getCompany)

  const { data: apiRfqs = [], isLoading: rfqsLoading } = useRfqsQuery("all", hydrated && useApi)
  const { data: apiContracts = [], isLoading: contractsLoading } = useContractsQuery(hydrated && useApi)

  const rfqs: RfqWithRelations[] = useApi ? apiRfqs : hydrated ? getRfqsByBuyer(actorId) : []
  const contracts: ContractWithRelations[] = useApi
    ? (apiContracts as ContractWithRelations[])
    : hydrated
      ? getContractsForBuyer(actorId)
      : []

  const openRfqs = rfqs.filter((r) => OPEN_RFQ_STATUSES.includes(r.status))

  const proposalQueries = useQueries({
    queries: (useApi ? openRfqs : []).map((rfq) => ({
      queryKey: proposalKeys.forRfq(rfq.id),
      queryFn: () => proposalsApi.listForRfq(rfq.id),
      enabled: hydrated && useApi,
    })),
  })

  const proposalsByRfq = useMemo(() => {
    const map = new Map<string, Proposal[]>()
    openRfqs.forEach((rfq, index) => {
      const list = useApi ? proposalQueries[index]?.data : getProposalsForRfq(rfq.id)
      if (list) map.set(rfq.id, list)
    })
    return map
  }, [useApi, openRfqs, proposalQueries, getProposalsForRfq])

  const proposalsCount = useMemo(() => {
    const map = new Map<string, number>()
    proposalsByRfq.forEach((list, rfqId) => {
      map.set(rfqId, list.filter((p) => VISIBLE_PROPOSAL_STATUSES.includes(p.status)).length)
    })
    return map
  }, [proposalsByRfq])

  const supplierIds = useApi ? contracts.map((c) => c.supplier_actor_id) : []
  const resolveSupplierName = useSupplierActorName(supplierIds)
  const getSupplierName = (supplierId: number) =>
    useApi
      ? resolveSupplierName(supplierId)
      : (getCompany(supplierId)?.title ?? "Исполнитель")

  const unreadMessages = hydrated
    ? useApi
      ? getBuyerUnreadMessageCount(contracts, userId)
      : getUnreadMessageCountForBuyer(actorId)
    : 0

  const rfqsWithNewProposals: BuyerRfqProposalsSummary[] = openRfqs.map((rfq) => ({
    rfqId: rfq.id,
    rfqTitle: rfq.title,
    count: (proposalsByRfq.get(rfq.id) ?? []).filter((p) => p.status === "submitted").length,
  }))

  const todo = buildBuyerTodo({
    contracts,
    getSupplierName,
    rfqsWithNewProposals,
    drafts: rfqs.filter((r) => r.status === "draft").map((r) => ({ id: r.id, title: r.title })),
    unreadMessages,
  })

  const openDeals = contracts.filter(isDealOpen)
  const heldAmount = contracts.reduce((sum, c) => sum + getEscrowSummary(c).held, 0)
  const loading = !hydrated || (useApi && (rfqsLoading || contractsLoading))

  return (
    <PageFrame>
      <ActivateRoleBanner
        targetSide="supplier"
        redirectTo="/supplier"
        label="Хотите продавать на платформе? Активируйте роль исполнителя на этом же аккаунте."
      />
      <PageHeader
        title={`Здравствуйте${hydrated && user ? `, ${getUserDisplayName(user)}` : ""}!`}
        description="Здесь видно, что нужно сделать по вашим заявкам и сделкам"
        actions={
          <Button asChild size="lg" className="lg:hidden">
            <Link href="/customer/rfqs/new">
              <Plus size={17} /> Новая заявка
            </Link>
          </Button>
        }
      />

      <div className="grid gap-8">
        <TodoList
          items={todo}
          loading={loading}
          emptyText="Новых дел нет. Создайте заявку, когда понадобится товар или услуга."
        />

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Сводка">
          <MetricTile
            Icon={FileText}
            label="Открытые заявки"
            value={loading ? "—" : String(openRfqs.length)}
            hint="принимают предложения"
            href="/customer/rfqs?status=receiving_proposals"
          />
          <MetricTile
            Icon={Briefcase}
            label="Идут сделки"
            value={loading ? "—" : String(openDeals.length)}
            hint="от договора до приёмки и оплаты"
            href="/customer/contracts?tab=active"
          />
          <MetricTile
            Icon={Lock}
            label="На гарантии площадки"
            value={loading ? "—" : formatPrice(heldAmount)}
            hint="уйдут исполнителям после приёмки"
            href="/customer/payments?tab=escrow"
          />
        </section>

        <EscrowExplainer />

        <ActiveRfqsPanel rfqs={rfqs} hydrated={!loading} proposalsCount={proposalsCount} />
      </div>
    </PageFrame>
  )
}
