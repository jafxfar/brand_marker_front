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
import { formatPrice, formatRating } from "@/lib/format"
import { StatCard } from "@/components/supplier/dashboard/stat-card"
import { ActiveContractsPanel } from "@/components/supplier/dashboard/active-contracts-panel"
import { NewRfqPanel } from "@/components/supplier/dashboard/new-rfq-panel"
import { IncomingMessagesPanel } from "@/components/supplier/dashboard/incoming-messages-panel"
import { RatingSummaryCard } from "@/components/supplier/dashboard/rating-summary-card"
import { PendingPaymentsPanel } from "@/components/supplier/dashboard/pending-payments-panel"

export default function SupplierDashboard() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)

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

  const getBuyerName = (buyerId: number) =>
    getCompany(buyerId)?.title ?? `Заказчик #${buyerId}`

  const activeContracts = hydrated ? getActiveContracts(actorId) : []
  const newRfqs = hydrated ? getNewRfqsForSupplier(actorId, hasProposal) : []
  const revenue = hydrated ? getRevenue(actorId) : 0
  const pendingAmount = hydrated ? getPendingPaymentsAmount(actorId) : 0
  const pendingMilestones = hydrated ? getPendingMilestones(actorId) : []
  const incomingMessages = hydrated
    ? getIncomingMessages(actorId, actorId, getBuyerName)
    : []
  const unreadCount = hydrated ? getUnreadMessageCount(actorId, actorId) : 0
  const myCompany = hydrated ? getMyCompany(actorId) : undefined

  const rating = myCompany?.rating ?? 0
  const reviewCount = myCompany?.reviews.length ?? 0
  const completedContracts = myCompany?.stats?.completed_contracts ?? 0

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">
            Здравствуйте{hydrated && user ? `, ${getUserDisplayName(user)}` : ""}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Обзор контрактов, RFQ и финансовых показателей
          </p>
        </div>
        <Link
          href="/supplier/rfqs"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-[oklch(0.58_0.22_38)] text-white text-sm font-bold transition-colors"
        >
          Откликнуться на RFQ <ArrowRight size={17} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          Icon={FileCheck}
          label="Активные контракты"
          value={hydrated ? String(activeContracts.length) : "—"}
          accent="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          Icon={Inbox}
          label="Новые RFQ"
          value={hydrated ? String(newRfqs.length) : "—"}
          accent="bg-blue-100 text-blue-600"
        />
        <StatCard
          Icon={MessageSquare}
          label="Входящие сообщения"
          value={hydrated ? String(unreadCount) : "—"}
          subValue={hydrated && unreadCount > 0 ? "непрочитанных" : undefined}
          accent="bg-amber-100 text-amber-600"
        />
        <StatCard
          Icon={TrendingUp}
          label="Выручка"
          value={hydrated ? formatPrice(revenue) : "—"}
          accent="bg-violet-100 text-violet-600"
        />
        <StatCard
          Icon={Wallet}
          label="Ожидают выплаты"
          value={hydrated ? formatPrice(pendingAmount) : "—"}
          accent="bg-orange-100 text-orange-600"
        />
        <StatCard
          Icon={Star}
          label="Рейтинг"
          value={hydrated ? formatRating(rating) : "—"}
          subValue={hydrated ? `${reviewCount} отзывов` : undefined}
          accent="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ActiveContractsPanel
            contracts={activeContracts}
            hydrated={hydrated}
            getBuyerName={getBuyerName}
          />
          <NewRfqPanel rfqs={newRfqs} hydrated={hydrated} />
        </div>

        <div className="space-y-4">
          <IncomingMessagesPanel messages={incomingMessages} hydrated={hydrated} />
          <RatingSummaryCard
            rating={rating}
            reviewCount={reviewCount}
            completedContracts={completedContracts}
            hydrated={hydrated}
          />
          <PendingPaymentsPanel milestones={pendingMilestones} hydrated={hydrated} />
        </div>
      </div>
    </div>
  )
}
