"use client"

import { useState } from "react"
import { Wallet } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useBuyerPaymentsStore } from "@/lib/store/buyer-payments-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { getEscrowSummary } from "@/lib/contract-display"
import {
  BuyerPaymentsTabs,
  type BuyerPaymentsTab,
} from "@/components/cabinet/payments/buyer-payments-tabs"
import { BuyerPaymentsSummaryCards } from "@/components/cabinet/payments/buyer-payments-summary-cards"
import { OutgoingPaymentsTable } from "@/components/cabinet/payments/outgoing-payments-table"
import { EscrowFundingTable } from "@/components/cabinet/payments/escrow-funding-table"
import { BuyerInvoicesTable } from "@/components/cabinet/payments/buyer-invoices-table"
import { BuyerRefundsTable } from "@/components/cabinet/payments/buyer-refunds-table"
import { isApiEnabled } from "@/lib/api/config"
import {
  mapApiPaymentHistoryEvent,
  type EscrowFundingRow,
  type OutgoingPaymentRow,
} from "@/lib/buyer-payments-display"
import {
  usePaymentHistoryQuery,
  usePendingPaymentsQuery,
  useFundAndConfirmMilestoneMutation,
} from "@/hooks/api/use-payments-query"
import { useContractsQuery } from "@/hooks/api/use-contracts-query"

export default function BuyerPaymentsPage() {
  const hydrated = useHydrated()
  const actorId = getActorId(useAuthStore((s) => s.user))
  const [tab, setTab] = useState<BuyerPaymentsTab>("outgoing")

  const getOutgoingPayments = useBuyerPaymentsStore((s) => s.getOutgoingPayments)
  const getEscrowFundingQueue = useBuyerPaymentsStore((s) => s.getEscrowFundingQueue)
  const getBuyerInvoices = useBuyerPaymentsStore((s) => s.getBuyerInvoices)
  const getBuyerRefunds = useBuyerPaymentsStore((s) => s.getBuyerRefunds)
  const fundMilestone = useContractsStore((s) => s.fundMilestone)
  const getContract = useContractsStore((s) => s.getContract)
  const getContractsForBuyer = useContractsStore((s) => s.getContractsForBuyer)
  const getCompany = useCompaniesStore((s) => s.getCompany)

  const outgoing = hydrated ? getOutgoingPayments(actorId) : []
  const escrowQueue = hydrated ? getEscrowFundingQueue(actorId) : []
  const invoices = hydrated ? getBuyerInvoices(actorId) : []
  const refunds = hydrated ? getBuyerRefunds(actorId) : []
  const buyerContracts = hydrated ? getContractsForBuyer(actorId) : []
  const useApi = isApiEnabled()
  const { data: paymentHistory } = usePaymentHistoryQuery(hydrated && useApi)
  const { data: pendingPayments } = usePendingPaymentsQuery(hydrated && useApi)
  const { data: apiContracts = [] } = useContractsQuery(hydrated && useApi)
  const fundMutation = useFundAndConfirmMilestoneMutation()

  const contractById = new Map(apiContracts.map((c) => [c.id, c]))

  const apiOutgoing: OutgoingPaymentRow[] =
    paymentHistory
      ?.map((item) => {
        const event = mapApiPaymentHistoryEvent(item)
        if (event.type !== "funding" && event.type !== "release") return null
        const contract = contractById.get(event.contractId)
        return {
          ...event,
          contractTitle: contract?.title ?? `Контракт #${event.contractId}`,
          supplierActorId: contract?.supplier_actor_id ?? 0,
        }
      })
      .filter((row): row is OutgoingPaymentRow => row !== null)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()) ?? []

  const apiEscrowQueue: EscrowFundingRow[] =
    pendingPayments?.items.map((p) => {
      const contract = contractById.get(p.contract_id)
      return {
        contractId: p.contract_id,
        contractTitle: contract?.title ?? `Контракт #${p.contract_id}`,
        milestoneId: p.milestone_id,
        title: p.title,
        amount: p.amount,
        currency: p.currency as EscrowFundingRow["currency"],
        status: p.status,
        supplierActorId: contract?.supplier_actor_id ?? 0,
      }
    }) ?? []

  const effectiveOutgoing = useApi ? apiOutgoing : outgoing
  const effectiveEscrowQueue = useApi ? apiEscrowQueue : escrowQueue
  const effectiveContracts = useApi
    ? (apiContracts as typeof buyerContracts)
    : buyerContracts

  const totalOutgoing = effectiveOutgoing.reduce((sum, p) => sum + p.amount, 0)
  const inEscrow = effectiveContracts.reduce(
    (sum, c) => sum + getEscrowSummary(c).held,
    0,
  )
  const pendingFunding = effectiveEscrowQueue.reduce((sum, r) => sum + r.amount, 0)
  const currency = effectiveContracts[0]?.currency ?? "RUB"

  const getContractTitle = (contractId: number | null) => {
    if (!contractId) return "—"
    return getContract(contractId)?.title ?? `Контракт #${contractId}`
  }

  const handleFund = (contractId: number, milestoneId: number) => {
    if (useApi) {
      fundMutation.mutate(milestoneId)
      return
    }
    fundMilestone(contractId, milestoneId, actorId)
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Wallet size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Платежи</h1>
          <p className="text-sm text-muted-foreground">Платежи, безопасные сделки и документы</p>
        </div>
      </div>

      <BuyerPaymentsSummaryCards
        totalOutgoing={totalOutgoing}
        inEscrow={inEscrow}
        pendingFunding={pendingFunding}
        currency={currency}
        hydrated={hydrated}
      />

      <BuyerPaymentsTabs tab={tab} onTabChange={setTab} />

      <section className="bg-white border border-border rounded-2xl p-6">
        {tab === "outgoing" && (
          <OutgoingPaymentsTable
            payments={effectiveOutgoing}
            getSupplierName={(id) => getCompany(id)?.title ?? "Поставщик"}
          />
        )}
        {tab === "escrow" && (
          <EscrowFundingTable
            rows={effectiveEscrowQueue}
            getSupplierName={(id) => getCompany(id)?.title ?? "Поставщик"}
            onFund={handleFund}
          />
        )}
        {tab === "invoices" && (
          <BuyerInvoicesTable
            invoices={invoices}
            getContractTitle={getContractTitle}
          />
        )}
        {tab === "refunds" && (
          <BuyerRefundsTable
            refunds={refunds}
            getContractTitle={(id) => getContractTitle(id)}
          />
        )}
      </section>
    </div>
  )
}
