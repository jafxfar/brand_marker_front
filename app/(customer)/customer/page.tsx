"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useQueries } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { formatCurrency, formatPrice } from "@/lib/format"
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
import { MOCK_BUYER_APPROVALS } from "@/lib/mock/buyer-approvals"
import { MOCK_BUYER_SPEND } from "@/lib/mock/buyer-spend"
import { Button } from "@/components/ui/button"
import { PageFrame, PageHeader } from "@/components/layout"
import { SpendChart } from "@/components/cabinet/dashboard/spend-chart"
import { HomeDealsPanel } from "@/components/cabinet/dashboard/home-deals-panel"
import { ActivateRoleBanner } from "@/components/company/activate-role-banner"
import { MetricTile, TodoList } from "@/components/process"
import type { ContractWithRelations, Proposal, RfqWithRelations } from "@/types"

export default function CustomerDashboard() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const userId = user?.userId ?? 0
  const useApi = isApiEnabled()

  const getRfqsByBuyer = useRfqsStore((s) => s.getRfqsByBuyer)
  const getProposalsForRfq = useProposalsStore((s) => s.getProposalsForRfq)
  const getContractsForBuyer = useContractsStore((s) => s.getContractsForBuyer)
  const getUnreadMessageCountForBuyer = useContractsStore(
    (s) => s.getUnreadMessageCountForBuyer,
  )
  const getCompany = useCompaniesStore((s) => s.getCompany)

  const { data: apiRfqsPage, isLoading: rfqsLoading } = useRfqsQuery(
    "all",
    hydrated && useApi,
  )
  const apiRfqs = apiRfqsPage?.items ?? []
  const { data: apiContractsPage, isLoading: contractsLoading } =
    useContractsQuery(hydrated && useApi)
  const apiContracts = apiContractsPage?.items ?? []

  const rfqs: RfqWithRelations[] = useApi
    ? apiRfqs
    : hydrated
      ? getRfqsByBuyer(actorId)
      : []
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
      const list = useApi
        ? (proposalQueries[index]?.data?.items ?? [])
        : getProposalsForRfq(rfq.id)
      if (list) map.set(rfq.id, list)
    })
    return map
  }, [useApi, openRfqs, proposalQueries, getProposalsForRfq])

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

  const rfqsWithNewProposals: BuyerRfqProposalsSummary[] = openRfqs.map(
    (rfq) => ({
      rfqId: rfq.id,
      rfqTitle: rfq.title,
      count: (proposalsByRfq.get(rfq.id) ?? []).filter(
        (p) => p.status === "submitted",
      ).length,
    }),
  )

  const pendingApprovals = MOCK_BUYER_APPROVALS.filter(
    (a) => a.status === "wait",
  ).map((a) => ({
    id: a.id,
    what: a.what,
    whoName: a.whoName,
    amountLabel: formatCurrency(a.amount, a.currency),
    reason: a.reason,
  }))

  const todo = buildBuyerTodo({
    contracts,
    getSupplierName,
    rfqsWithNewProposals,
    drafts: rfqs
      .filter((r) => r.status === "draft")
      .map((r) => ({ id: r.id, title: r.title })),
    unreadMessages,
    pendingApprovals,
  })

  const openDeals = contracts.filter(isDealOpen)
  const heldAmount = contracts.reduce(
    (sum, c) => sum + getEscrowSummary(c).held,
    0,
  )
  const loading = !hydrated || (useApi && (rfqsLoading || contractsLoading))

  const spendSeries = MOCK_BUYER_SPEND
  const lastSpend = spendSeries[spendSeries.length - 1]?.[1] ?? 0
  const prevSpend = spendSeries[spendSeries.length - 2]?.[1] ?? 0
  const spendDeltaPct =
    prevSpend > 0 ? Math.round(((lastSpend - prevSpend) / prevSpend) * 100) : 0
  const companyLabel =
    hydrated && user?.company
      ? `${user.company} · закупки компании`
      : "Закупки компании"

  return (
    <PageFrame>
      <ActivateRoleBanner
        targetSide="supplier"
        redirectTo="/supplier"
        label="Хотите продавать на платформе? Активируйте роль исполнителя на этом же аккаунте."
      />
      <PageHeader
        title="Обзор"
        description={companyLabel}
        actions={
          <Button asChild size="lg" className="lg:hidden">
            <Link href="/customer/rfqs/new">
              <Plus size={17} /> Новая заявка
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6">
        <TodoList
          items={todo}
          loading={loading}
          emptyText="Всё сделано."
        />

        <section
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
          aria-label="Сводка"
        >
          <MetricTile
            label="Открытые заявки"
            value={loading ? "—" : String(openRfqs.length)}
            hint="принимают КП"
            href="/customer/rfqs?status=receiving_proposals"
          />
          <MetricTile
            label="Сделки в работе"
            value={loading ? "—" : String(openDeals.length)}
            hint="от договора до приёмки"
            href="/customer/contracts?tab=active"
          />
          <MetricTile
            label="На гарантии"
            value={loading ? "—" : formatPrice(heldAmount)}
            hint="в банке‑партнёре до приёмки"
            href="/customer/payments?tab=escrow"
          />
          <MetricTile
            label="Расходы в сентябре"
            value={loading ? "—" : formatPrice(lastSpend)}
            hint={
              spendDeltaPct > 0
                ? `+${spendDeltaPct}% к августу`
                : spendDeltaPct < 0
                  ? `${spendDeltaPct}% к августу`
                  : "за текущий месяц"
            }
            href="/customer/payments"
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <SpendChart series={spendSeries} />
          <HomeDealsPanel
            contracts={contracts}
            getSupplierName={getSupplierName}
            loading={loading}
          />
        </section>
      </div>
    </PageFrame>
  )
}
