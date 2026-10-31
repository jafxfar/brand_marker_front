"use client"

import Link from "next/link"
import {
  ArrowRight,
  Inbox,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useItemsStore } from "@/lib/store/items-store"
import { useFinanceStore } from "@/lib/store/finance-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import { useSupplierContractsQuery } from "@/hooks/api/use-contracts-query"
import {
  useSupplierRfqBoardQuery,
  useSupplierProposalsQuery,
} from "@/hooks/api/use-supplier-rfqs-query"
import {
  useSupplierBalanceQuery,
  useSupplierPaymentHistoryQuery,
} from "@/hooks/api/use-supplier-payments-query"
import { useSupplierFinanceDestinationsQuery } from "@/hooks/api/use-supplier-finance-query"
import { useSupplierCatalogQuery } from "@/hooks/api/use-supplier-catalog-query"
import { useSupplierCompaniesQuery } from "@/hooks/api/use-supplier-companies-query"
import { useSupplierSubscriptionQuery } from "@/hooks/api/use-supplier-subscription-query"
import { formatCount, formatIsoDateTime, formatPrice } from "@/lib/format"
import {
  getNewRfqsWithoutProposal,
  getSupplierUnreadMessageCount,
} from "@/lib/supplier-dashboard"
import { dealNeedsAction, getDealPhase, isDealOpen } from "@/lib/process/deal-stages"
import { buildSupplierTodo } from "@/lib/process/todo"
import { planName } from "@/lib/subscription"
import { Button } from "@/components/ui/button"
import { PageFrame } from "@/components/layout"
import {
  HeroCard,
  ReputationBadge,
  TrustShieldIcon,
  VerifiedChip,
} from "@/components/bm"
import { ActivateRoleBanner } from "@/components/company/activate-role-banner"
import { ActiveContractsPanel } from "@/components/supplier/dashboard/active-contracts-panel"
import { DashboardPanel } from "@/components/cabinet/dashboard/dashboard-panel"
import { QuickActions } from "@/components/cabinet/dashboard/quick-actions"
import {
  OpsList,
  type OpsItem,
} from "@/components/cabinet/dashboard/ops-list"
import { TodoList, ProfileChecklist, type ChecklistItem } from "@/components/process"
import { firstName, greet } from "@/lib/greet"
import type { ContractWithRelations } from "@/types"
import type { SubscriptionPlan } from "@/lib/store/subscription-store"
import { useMemo } from "react"

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
  const { data: apiContracts, isLoading: contractsLoading } =
    useSupplierContractsQuery(apiEnabled)
  const { data: apiRfqs, isLoading: rfqsLoading } =
    useSupplierRfqBoardQuery(apiEnabled)
  const { data: apiProposals } = useSupplierProposalsQuery(apiEnabled)
  const { data: apiBalance } = useSupplierBalanceQuery(apiEnabled)
  const { data: apiDestinations } = useSupplierFinanceDestinationsQuery(apiEnabled)
  const { data: apiItems } = useSupplierCatalogQuery(undefined, apiEnabled)
  const { data: apiCompanies } = useSupplierCompaniesQuery(apiEnabled)
  const { data: apiSub } = useSupplierSubscriptionQuery(apiEnabled)
  const { data: paymentHistoryPage } = useSupplierPaymentHistoryQuery(
    apiEnabled,
    { page: 1, pageSize: 8 },
  )

  const getBuyerName = (buyerId: number) =>
    getCompany(buyerId)?.title ?? `Заказчик #${buyerId}`

  const contracts: ContractWithRelations[] = useApi
    ? ((apiContracts?.items ?? []) as ContractWithRelations[])
    : hydrated
      ? getContractsByTab(actorId, "all")
      : []

  const proposalItems = apiProposals?.items ?? []
  const companyItems = apiCompanies?.items ?? []
  const catalogItems = apiItems?.items ?? []
  const destinationItems = apiDestinations?.items ?? []

  const newRfqs = useApi
    ? getNewRfqsWithoutProposal(apiRfqs?.items ?? [], proposalItems)
    : hydrated
      ? getNewRfqsForSupplier(actorId, (rfqId) => hasProposal(rfqId, actorId))
      : []

  const unreadCount = useApi
    ? getSupplierUnreadMessageCount(contracts, userId)
    : hydrated
      ? getUnreadMessageCount(actorId, actorId)
      : 0

  const myCompany = useApi
    ? companyItems.find((c) => c.id === user?.activeCompanyId) ?? companyItems[0]
    : hydrated
      ? getMyCompany(actorId)
      : undefined

  const items = useApi ? catalogItems : hydrated ? getItemsBySupplier(actorId) : undefined
  const destinations = useApi
    ? destinationItems
    : hydrated
      ? getDestinations(actorId)
      : undefined
  const balance = useApi
    ? apiBalance
      ? {
          available: apiBalance.available,
          pending: apiBalance.pending,
          currency: apiBalance.currency,
        }
      : undefined
    : hydrated
      ? getBalanceSummary(actorId)
      : undefined

  const openDeals = contracts
    .filter(isDealOpen)
    .sort(
      (a, b) =>
        Number(dealNeedsAction("supplier", b)) -
        Number(dealNeedsAction("supplier", a)),
    )
  const expectedDeals = openDeals.filter((c) => getDealPhase(c) !== "disputed")
  const expectedAmount = expectedDeals.reduce(
    (sum, c) => sum + getExpectedPayout(c),
    0,
  )

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
  const payoutAccount = destinations?.[0]
  const payoutLabel = payoutAccount
    ? [payoutAccount.label, payoutAccount.details].filter(Boolean).join(" · ")
    : "не указан"

  const ops: OpsItem[] = useMemo(() => {
    const history = paymentHistoryPage?.items ?? []
    return history.slice(0, 8).map((item) => {
      const isRelease = item.event === "release" || item.status === "released"
      const isFunding =
        item.event === "funding" || item.status === "funded"
      return {
        id: `${item.contract_id}-${item.milestone_id}-${item.event}-${item.created_at}`,
        title: item.title,
        meta: `БМ‑${item.contract_id} · ${formatIsoDateTime(item.created_at)}`,
        amount: `${isRelease ? "+" : isFunding ? "" : "−"}${formatPrice(item.amount)}`,
        status: isRelease
          ? "зачислено"
          : isFunding
            ? "поступит после приёмки"
            : item.status,
        tone: isRelease ? "in" : isFunding ? "hold" : "out",
      }
    })
  }, [paymentHistoryPage?.items])

  const companyTitle =
    myCompany?.title ?? (hydrated && user?.company ? user.company : "Поставщик")
  const name = firstName(user?.name)
  const verified = myCompany?.verification_status === "verified"
  const tier = (myCompany as { reputation_tier?: string } | undefined)
    ?.reputation_tier
  const subPlan = (apiSub?.plan ?? "none") as SubscriptionPlan
  const incompleteChecklist = checklist.filter((c) => !c.done)

  return (
    <PageFrame className="max-w-none space-y-5">
      <ActivateRoleBanner
        targetSide="buyer"
        redirectTo="/customer"
        label="Хотите размещать заказы? Активируйте роль заказчика на этом же аккаунте."
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[14.5px] text-mute">
            {greet()}
            {name ? `, ${name}` : ""}
          </p>
          <h1 className="flex flex-wrap items-center gap-2 text-[26px] font-extrabold tracking-[-0.02em] text-ink">
            {companyTitle}
            <VerifiedChip verified={verified} compact />
            {tier && tier !== "none" ? (
              <ReputationBadge tier={tier} size={28} />
            ) : null}
          </h1>
        </div>
        <Button asChild>
          <Link href="/supplier/catalog/new">
            <Plus className="size-4" />
            Добавить товар
          </Link>
        </Button>
      </div>

      <HeroCard>
        <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <span className="inline-flex items-center gap-2 text-[14px] text-white/70">
              <ShieldCheck className="size-4" aria-hidden />
              Поступит после приёмки покупателем
            </span>
            <div className="mt-1 tnum text-[40px] font-extrabold leading-tight tracking-[-0.02em]">
              {loading ? "—" : formatPrice(expectedAmount)}
            </div>
            <p className="mt-1 text-[14px] text-white/70">
              {expectedDeals.length > 0
                ? `По ${formatCount(expectedDeals.length, "сделке", "сделкам", "сделкам")} в работе`
                : "Нет сделок с деньгами на гарантии"}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-3 md:min-w-[320px]">
            <div className="rounded-xl bg-white/10 p-3">
              <dt className="text-[12.5px] text-white/70">Зачислено на счёт</dt>
              <dd className="tnum text-[15px] font-bold">
                {loading || !balance ? "—" : formatPrice(balance.available)}
              </dd>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <dt className="text-[12.5px] text-white/70">Счёт для выплат</dt>
              <dd className="truncate text-[15px] font-bold">{payoutLabel}</dd>
            </div>
          </dl>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            className="border-white bg-white text-ink hover:bg-canvas"
          >
            <Link href="/supplier/contracts?tab=active">Сделки и деньги</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/25 bg-white/10 text-white hover:bg-white/20"
          >
            <Link href="/supplier/rfqs?response=open">
              Новые заявки
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </HeroCard>

      <QuickActions
        actions={[
          {
            href: "/supplier/catalog/new",
            label: "Добавить товар",
            Icon: Plus,
          },
          {
            href: "/supplier/rfqs?response=open",
            label: "Новые заявки",
            Icon: Search,
          },
          {
            href: "/supplier/proposals",
            label: "Мои КП",
            Icon: Send,
          },
          {
            href: "/supplier/contracts?tab=active",
            label: "Отгрузки",
            Icon: Truck,
          },
          {
            href: "/supplier/trust",
            label: "Тариф и доверие",
            Icon: Sparkles,
          },
        ]}
      />

      {incompleteChecklist.length > 0 ? (
        <ProfileChecklist items={checklist} />
      ) : null}

      <div className="grid items-start gap-5 xl:grid-cols-[1.15fr_1fr]">
        <DashboardPanel
          title="Нужно сделать"
          badge={
            todo.length > 0 ? (
              <span className="grid h-6 place-items-center rounded-full bg-amber-50 px-2 text-[12.5px] font-bold text-amber-800">
                {todo.length}
              </span>
            ) : null
          }
        >
          <TodoList
            items={todo}
            loading={loading}
            emptyText="Новых дел нет. Загляните в заявки — там могут быть новые заказы."
            title=""
          />
        </DashboardPanel>
        <DashboardPanel title="Операции" href="/supplier/finance">
          <OpsList items={ops} />
        </DashboardPanel>
      </div>

      <div className="grid items-start gap-5 md:grid-cols-2">
        <section className="grid gap-4 rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center gap-4">
            {tier && tier !== "none" ? (
              <TrustShieldIcon tier={tier} size={56} />
            ) : (
              <span className="grid size-14 place-items-center rounded-2xl bg-canvas text-brand-600">
                <ShieldCheck className="size-7" />
              </span>
            )}
            <div>
              <h2 className="text-[17px] font-bold text-ink">
                {tier && tier !== "none"
                  ? "Щит доверия"
                  : "Щит доверия ещё не выдан"}
              </h2>
              <p className="text-[14px] text-mute">
                Условия и прогресс — в разделе «Тариф и доверие»
              </p>
            </div>
          </div>
          <Link
            href="/supplier/trust"
            className="text-[14px] font-semibold text-brand-700 hover:underline"
          >
            Условия и прогресс →
          </Link>
        </section>

        <section className="grid gap-4 rounded-2xl border border-line bg-white p-5">
          <div>
            <h2 className="text-[17px] font-bold text-ink">
              Тариф: {planName(subPlan)}
            </h2>
            <p className="mt-1 text-[14px] text-mute">
              {apiSub?.is_active && apiSub.active_until
                ? `Активен до ${new Date(apiSub.active_until).toLocaleDateString("ru-RU")}`
                : "Подписка повышает видимость в каталоге"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/supplier/subscription">Управление подпиской</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/supplier/rfqs?response=open">
                <Inbox className="size-4" />
                Заявки
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <ActiveContractsPanel
        contracts={openDeals}
        hydrated={!loading}
        getBuyerName={getBuyerName}
      />
    </PageFrame>
  )
}
