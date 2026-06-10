"use client"

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
import { StatCard } from "@/components/supplier/dashboard/stat-card"
import { ActiveRfqsPanel } from "@/components/cabinet/dashboard/active-rfqs-panel"
import { IncomingProposalsPanel } from "@/components/cabinet/dashboard/incoming-proposals-panel"
import { BuyerActiveContractsPanel } from "@/components/cabinet/dashboard/buyer-active-contracts-panel"
import { BuyerPendingPaymentsPanel } from "@/components/cabinet/dashboard/buyer-pending-payments-panel"
import { BuyerDisputesPanel } from "@/components/cabinet/dashboard/buyer-disputes-panel"
import { BuyerMessagesPanel } from "@/components/cabinet/dashboard/buyer-messages-panel"

export default function CustomerDashboard() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)

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

  const getRfqTitle = (rfqId: string) => getRfqWithRelations(rfqId)?.title ?? "RFQ"
  const getRfqActorId = (rfqId: string) => getRfqWithRelations(rfqId)?.actor_id
  const getSupplierName = (supplierId: number) =>
    getCompany(supplierId)?.title ?? `Поставщик #${supplierId}`

  const activeRfqs = hydrated ? getActiveRfqsByBuyer(actorId) : []
  const incomingProposals = hydrated
    ? getIncomingProposalsForBuyer(actorId, getRfqTitle, getRfqActorId)
    : []
  const newProposalsCount = hydrated
    ? getNewProposalsCountForBuyer(actorId, getRfqActorId)
    : 0
  const activeContracts = hydrated ? getActiveContractsForBuyer(actorId) : []
  const pendingAmount = hydrated ? getPendingPaymentsForBuyer(actorId) : 0
  const pendingMilestones = hydrated ? getPendingMilestonesForBuyer(actorId) : []
  const disputes = hydrated ? getDisputesForBuyer(actorId) : []
  const messages = hydrated ? getIncomingMessagesForBuyer(actorId, getSupplierName) : []
  const unreadCount = hydrated ? getUnreadMessageCountForBuyer(actorId) : 0

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">
            Здравствуйте{hydrated && user ? `, ${getUserDisplayName(user)}` : ""}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Обзор RFQ, предложений и контрактов
          </p>
        </div>
        <Link
          href="/customer/rfqs/new"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-bold transition-colors"
        >
          <Plus size={17} /> Создать RFQ
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          Icon={FileText}
          label="Активные RFQ"
          value={hydrated ? String(activeRfqs.length) : "—"}
          accent="bg-blue-100 text-blue-600"
        />
        <StatCard
          Icon={Inbox}
          label="Входящие предложения"
          value={hydrated ? String(newProposalsCount) : "—"}
          accent="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          Icon={FileCheck}
          label="Активные контракты"
          value={hydrated ? String(activeContracts.length) : "—"}
          accent="bg-violet-100 text-violet-600"
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
          accent="bg-red-100 text-red-600"
        />
        <StatCard
          Icon={MessageSquare}
          label="Сообщения"
          value={hydrated ? String(unreadCount) : "—"}
          subValue={hydrated && unreadCount > 0 ? "непрочитанных" : undefined}
          accent="bg-amber-100 text-amber-600"
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
            className="block bg-white border border-border rounded-2xl p-5 hover:border-primary/30 transition-all text-sm font-bold text-foreground hover:text-primary"
          >
            Каталог поставщиков <ArrowRight size={14} className="inline ml-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}
