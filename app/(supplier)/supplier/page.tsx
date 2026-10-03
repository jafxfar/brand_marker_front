"use client"

import Link from "next/link"
import { ArrowRight, Clock, Star, Wallet } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useItemsStore } from "@/lib/store/items-store"
import { useFinanceStore } from "@/lib/store/finance-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId, getUserDisplayName } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import { useSupplierContractsQuery } from "@/hooks/api/use-contracts-query"
import {
  useSupplierRfqBoardQuery,
  useSupplierProposalsQuery,
} from "@/hooks/api/use-supplier-rfqs-query"
import { useSupplierBalanceQuery } from "@/hooks/api/use-supplier-payments-query"
import { useSupplierFinanceDestinationsQuery } from "@/hooks/api/use-supplier-finance-query"
import { useSupplierCatalogQuery } from "@/hooks/api/use-supplier-catalog-query"
import { useSupplierCompaniesQuery } from "@/hooks/api/use-supplier-companies-query"
import { formatCount, formatPrice, formatRating } from "@/lib/format"
import { getNewRfqsWithoutProposal, getSupplierUnreadMessageCount } from "@/lib/supplier-dashboard"
import { dealNeedsAction, getDealPhase, isDealOpen } from "@/lib/process/deal-stages"
import { buildSupplierTodo } from "@/lib/process/todo"
import { Button } from "@/components/ui/button"
import { PageFrame, PageHeader } from "@/components/layout"
import { MetricTile, ProfileChecklist, TodoList, type ChecklistItem } from "@/components/process"
import { ActiveContractsPanel } from "@/components/supplier/dashboard/active-contracts-panel"
import { ActivateRoleBanner } from "@/components/company/activate-role-banner"
import type { ContractWithRelations } from "@/types"

/** Net amount the supplier still expects from a deal (unreleased milestones minus commission). */
const getExpectedPayout = (contract: ContractWithRelations): number => {
  const milestones = contract.payment_plan?.milestones ?? []
  if (milestones.length === 0) return contract.agreed_amount
  return milestones
    .filter((m) => m.status !== "released")
    .reduce((sum, m) => sum + m.amount - (m.commission_amount ?? 0), 0)
}

export default function SupplierDashboard() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const userId = user?.userId ?? 0
  const useApi = isApiEnabled()

  const getContractsByTab = useContractsStore((s) => s.getContractsByTab)
  const getUnreadMessageCount = useContractsStore((s) => s.getUnreadMessageCount)
  const getNewRfqsForSupplier = useRfqsStore((s) => s.getNewRfqsForSupplier)
  const hasProposal = useProposalsStore((s) => s.hasProposal)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const getMyCompany = useCompaniesStore((s) => s.getMyCompany)
  const getItemsBySupplier = useItemsStore((s) => s.getItemsBySupplier)
  const getDestinations = useFinanceStore((s) => s.getDestinations)
  const getBalanceSummary = useFinanceStore((s) => s.getBalanceSummary)

  const apiEnabled = hydrated && useApi
  const { data: apiContracts, isLoading: contractsLoading } = useSupplierContractsQuery(apiEnabled)
  const { data: apiRfqs, isLoading: rfqsLoading } = useSupplierRfqBoardQuery(apiEnabled)
  const { data: apiProposals } = useSupplierProposalsQuery(apiEnabled)
  const { data: apiBalance } = useSupplierBalanceQuery(apiEnabled)
  const { data: apiDestinations } = useSupplierFinanceDestinationsQuery(apiEnabled)
  const { data: apiItems } = useSupplierCatalogQuery(undefined, apiEnabled)
  const { data: apiCompanies } = useSupplierCompaniesQuery(apiEnabled)

  const getBuyerName = (buyerId: number) =>
    getCompany(buyerId)?.title ?? `Заказчик #${buyerId}`

  const contracts: ContractWithRelations[] = useApi
    ? ((apiContracts ?? []) as ContractWithRelations[])
    : hydrated
      ? getContractsByTab(actorId, "all")
      : []

  const newRfqs = useApi
    ? getNewRfqsWithoutProposal(apiRfqs ?? [], apiProposals)
    : hydrated
      ? getNewRfqsForSupplier(actorId, (rfqId) => hasProposal(rfqId, actorId))
      : []

  const unreadCount = useApi
    ? getSupplierUnreadMessageCount(contracts, userId)
    : hydrated
      ? getUnreadMessageCount(actorId, actorId)
      : 0

  const myCompany = useApi
    ? apiCompanies?.find((c) => c.id === user?.activeCompanyId) ?? apiCompanies?.[0]
    : hydrated
      ? getMyCompany(actorId)
      : undefined

  const items = useApi ? apiItems : hydrated ? getItemsBySupplier(actorId) : undefined
  const destinations = useApi ? apiDestinations : hydrated ? getDestinations(actorId) : undefined
  const balance = useApi
    ? apiBalance
      ? { available: apiBalance.available, currency: apiBalance.currency }
      : undefined
    : hydrated
      ? getBalanceSummary(actorId)
      : undefined

  const rating = myCompany?.rating ?? myCompany?.stats?.average_rating ?? 0
  const reviewCount = myCompany?.reviews?.length ?? 0

  const openDeals = contracts
    .filter(isDealOpen)
    .sort((a, b) => Number(dealNeedsAction("supplier", b)) - Number(dealNeedsAction("supplier", a)))
  const expectedDeals = openDeals.filter((c) => getDealPhase(c) !== "disputed")
  const expectedAmount = expectedDeals.reduce((sum, c) => sum + getExpectedPayout(c), 0)

  const todo = buildSupplierTodo({
    contracts,
    newRfqs: newRfqs.map((r) => ({ id: r.id, title: r.title })),
    unreadMessages: unreadCount,
  })

  const checklist: ChecklistItem[] = []
  if (hydrated && (!useApi || apiCompanies)) {
    checklist.push({
      id: "company",
      label: "Расскажите о компании: описание и город",
      done: Boolean(myCompany?.description && myCompany?.city),
      href: "/supplier/company",
      cta: "Заполнить",
    })
    if (myCompany) {
      const verified = myCompany.verification_status === "verified"
      const rejected = myCompany.verification_status === "rejected"
      checklist.push({
        id: "verification",
        label: verified
          ? "Компания проверена"
          : rejected
            ? "Проверка не пройдена — исправьте данные компании"
            : "Компания на проверке у администратора",
        done: verified,
        href: rejected ? "/supplier/company" : undefined,
        cta: rejected ? "Исправить" : undefined,
      })
    }
  }
  if (items) {
    checklist.push({
      id: "catalog",
      label: "Опубликуйте товар или услугу в каталоге",
      done: items.some((item) => item.status === "active"),
      href: "/supplier/catalog/new",
      cta: "Добавить",
    })
  }
  if (destinations) {
    checklist.push({
      id: "payout",
      label: "Добавьте счёт для выплат",
      done: destinations.length > 0,
      href: "/supplier/finance#payout",
      cta: "Добавить",
    })
  }

  const loading = !hydrated || (useApi && (contractsLoading || rfqsLoading))
  const noPayoutAccount = destinations?.length === 0

  return (
    <PageFrame>
      <ActivateRoleBanner
        targetSide="buyer"
        redirectTo="/customer"
        label="Хотите размещать заказы? Активируйте роль заказчика на этом же аккаунте."
      />
      <PageHeader
        title={`Здравствуйте${hydrated && user ? `, ${getUserDisplayName(user)}` : ""}!`}
        description="Здесь видно, что нужно сделать по сделкам и новым заявкам"
        actions={
          <Button asChild size="lg" className="lg:hidden">
            <Link href="/supplier/rfqs">
              Найти заявки <ArrowRight size={17} />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-8">
        <ProfileChecklist items={checklist} />

        <TodoList
          items={todo}
          loading={loading}
          emptyText="Новых дел нет. Загляните в заявки — там могут быть новые заказы."
        />

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Сводка">
          <MetricTile
            Icon={Wallet}
            label="Можно вывести"
            value={loading || !balance ? "—" : formatPrice(balance.available)}
            hint={noPayoutAccount ? "сначала добавьте счёт для выплат" : "за принятые работы"}
            href="/supplier/finance"
            valueClassName="text-primary"
          />
          <MetricTile
            Icon={Clock}
            label="Поступит после приёмки"
            value={loading ? "—" : formatPrice(expectedAmount)}
            hint={
              expectedDeals.length > 0
                ? `по ${formatCount(expectedDeals.length, "сделке", "сделкам", "сделкам")}`
                : "нет сделок в работе"
            }
            href="/supplier/contracts"
          />
          <MetricTile
            Icon={Star}
            label="Отзывы"
            value={loading ? "—" : reviewCount > 0 ? formatRating(rating) : "—"}
            hint={
              reviewCount > 0
                ? formatCount(reviewCount, "отзыв", "отзыва", "отзывов")
                : "первый отзыв появится после сделки"
            }
            href="/supplier/finance#reviews"
          />
        </section>

        <ActiveContractsPanel
          contracts={openDeals}
          hydrated={!loading}
          getBuyerName={getBuyerName}
        />
      </div>
    </PageFrame>
  )
}
