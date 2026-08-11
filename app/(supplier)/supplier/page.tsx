"use client"

import Link from "next/link"
import {
  FileCheck, Inbox, MessageSquare, TrendingUp, Wallet, Star, ArrowRight,
} from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId, getUserDisplayName } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import { useSupplierContractsQuery } from "@/hooks/api/use-contracts-query"
import {
  useSupplierRfqBoardQuery,
  useSupplierProposalsQuery,
} from "@/hooks/api/use-supplier-rfqs-query"
import { useSupplierPendingPayoutsQuery } from "@/hooks/api/use-supplier-payments-query"
import { useSupplierCompaniesQuery } from "@/hooks/api/use-supplier-companies-query"
import { formatPrice, formatRating } from "@/lib/format"
import {
  getActiveSupplierContracts,
  getNewRfqsWithoutProposal,
  getSupplierIncomingMessages,
  getSupplierPendingAmount,
  getSupplierPendingMilestonesFromApi,
  getSupplierPendingMilestonesFromContracts,
  getSupplierRevenue,
  getSupplierUnreadMessageCount,
} from "@/lib/supplier-dashboard"
import { StatCard } from "@/components/supplier/dashboard/stat-card"
import { ActiveContractsPanel } from "@/components/supplier/dashboard/active-contracts-panel"
import { NewRfqPanel } from "@/components/supplier/dashboard/new-rfq-panel"
import { IncomingMessagesPanel } from "@/components/supplier/dashboard/incoming-messages-panel"
import { RatingSummaryCard } from "@/components/supplier/dashboard/rating-summary-card"
import { PendingPaymentsPanel } from "@/components/supplier/dashboard/pending-payments-panel"
import { HowItWorks } from "@/components/onboarding/how-it-works"
import type { ContractWithRelations } from "@/types"

export default function SupplierDashboard() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const useApi = isApiEnabled()

  const getActiveContracts = useContractsStore((s) => s.getActiveContracts)
  const getRevenue = useContractsStore((s) => s.getRevenue)
  const getPendingPaymentsAmount = useContractsStore((s) => s.getPendingPaymentsAmount)
  const getPendingMilestones = useContractsStore((s) => s.getPendingMilestones)
  const getIncomingMessages = useContractsStore((s) => s.getIncomingMessages)
  const getUnreadMessageCount = useContractsStore((s) => s.getUnreadMessageCount)
  const getNewRfqsForSupplier = useRfqsStore((s) => s.getNewRfqsForSupplier)
  const hasProposal = useProposalsStore((s) => s.hasProposal)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const getMyCompany = useCompaniesStore((s) => s.getMyCompany)

  const { data: apiContracts, isLoading: contractsLoading } = useSupplierContractsQuery(
    hydrated && useApi,
  )
  const { data: apiRfqs, isLoading: rfqsLoading } = useSupplierRfqBoardQuery(hydrated && useApi)
  const { data: apiProposals } = useSupplierProposalsQuery(hydrated && useApi)
  const { data: pendingPayouts } = useSupplierPendingPayoutsQuery(hydrated && useApi)
  const { data: apiCompanies } = useSupplierCompaniesQuery(hydrated && useApi)

  const getBuyerName = (buyerId: number) =>
    getCompany(buyerId)?.title ?? `Заказчик #${buyerId}`

  const apiContractsList = (apiContracts ?? []) as ContractWithRelations[]
  const activeContracts = useApi
    ? getActiveSupplierContracts(apiContractsList)
    : hydrated
      ? getActiveContracts(actorId)
      : []

  const newRfqs = useApi
    ? getNewRfqsWithoutProposal(apiRfqs ?? [], apiProposals)
    : hydrated
      ? getNewRfqsForSupplier(actorId, (rfqId) => hasProposal(rfqId, actorId))
      : []

  const revenue = useApi
    ? getSupplierRevenue(apiContractsList)
    : hydrated
      ? getRevenue(actorId)
      : 0

  const pendingMilestones = useApi
    ? getSupplierPendingMilestonesFromApi(
        pendingPayouts?.items ?? [],
        apiContractsList,
      )
    : hydrated
      ? getPendingMilestones(actorId)
      : []

  const pendingAmount = useApi
    ? getSupplierPendingAmount(pendingMilestones)
    : hydrated
      ? getPendingPaymentsAmount(actorId)
      : 0

  const incomingMessages = useApi
    ? getSupplierIncomingMessages(apiContractsList, actorId, getBuyerName)
    : hydrated
      ? getIncomingMessages(actorId, actorId, getBuyerName)
      : []

  const unreadCount = useApi
    ? getSupplierUnreadMessageCount(apiContractsList, actorId)
    : hydrated
      ? getUnreadMessageCount(actorId, actorId)
      : 0

  const myCompany = useApi
    ? apiCompanies?.find((c) => c.id === user?.activeCompanyId) ?? apiCompanies?.[0]
    : hydrated
      ? getMyCompany(actorId)
      : undefined

  const rating = myCompany?.rating ?? myCompany?.stats?.average_rating ?? 0
  const reviewCount = myCompany?.reviews?.length ?? 0
  const completedContracts = myCompany?.stats?.completed_contracts ?? 0

  const isLoading = useApi && (contractsLoading || rfqsLoading)

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Здравствуйте{hydrated && user ? `, ${getUserDisplayName(user)}` : ""}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ваши договоры, заявки заказчиков и финансы
          </p>
        </div>
        <Link
          href="/supplier/rfqs"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors"
        >
          Откликнуться на заявку <ArrowRight size={17} />
        </Link>
      </div>

      <HowItWorks variant="supplier" />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          Icon={FileCheck}
          label="Активные контракты"
          value={!hydrated || isLoading ? "—" : String(activeContracts.length)}
          accent="bg-primary/10 text-primary"
        />
        <StatCard
          Icon={Inbox}
          label="Новые заявки"
          value={!hydrated || isLoading ? "—" : String(newRfqs.length)}
          accent="bg-info/10 text-info"
        />
        <StatCard
          Icon={MessageSquare}
          label="Входящие сообщения"
          value={!hydrated || isLoading ? "—" : String(unreadCount)}
          subValue={unreadCount > 0 ? "непрочитанных" : undefined}
          accent="bg-warning/10 text-warning"
        />
        <StatCard
          Icon={TrendingUp}
          label="Выручка"
          value={!hydrated || isLoading ? "—" : formatPrice(revenue)}
          accent="bg-muted text-muted-foreground"
        />
        <StatCard
          Icon={Wallet}
          label="Ожидают выплаты"
          value={!hydrated || isLoading ? "—" : formatPrice(pendingAmount)}
          accent="bg-secondary text-secondary-foreground"
        />
        <StatCard
          Icon={Star}
          label="Рейтинг"
          value={!hydrated || isLoading ? "—" : formatRating(rating)}
          subValue={hydrated ? `${reviewCount} отзывов` : undefined}
          accent="bg-warning/10 text-warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ActiveContractsPanel
            contracts={activeContracts}
            hydrated={hydrated && !isLoading}
            getBuyerName={getBuyerName}
          />
          <NewRfqPanel rfqs={newRfqs} hydrated={hydrated && !isLoading} />
        </div>

        <div className="space-y-4">
          <IncomingMessagesPanel messages={incomingMessages} hydrated={hydrated && !isLoading} />
          <RatingSummaryCard
            rating={rating}
            reviewCount={reviewCount}
            completedContracts={completedContracts}
            hydrated={hydrated && !isLoading}
          />
          <PendingPaymentsPanel
            milestones={pendingMilestones}
            hydrated={hydrated && !isLoading}
          />
        </div>
      </div>
    </div>
  )
}
