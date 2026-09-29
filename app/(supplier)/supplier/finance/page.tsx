"use client"

import { useState } from "react"
import { ArrowDownToLine, FileText, Plus, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InlineHint } from "@/components/process"
import { AddPayoutDestinationDialog } from "@/components/supplier/finance/add-payout-destination-dialog"
import { milestoneStatusMeta } from "@/lib/contract-display"
import { formatCurrency } from "@/lib/format"
import { PageFrame, PageHeader, PageSurface } from "@/components/layout"
import { useAuthStore } from "@/lib/store/auth-store"
import { useFinanceStore } from "@/lib/store/finance-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import {
  useSupplierBalanceQuery,
  useSupplierPaymentHistoryQuery,
} from "@/hooks/api/use-supplier-payments-query"
import {
  useSupplierFinanceDestinationsQuery,
  useSupplierInvoicesQuery,
  useSupplierWithdrawalsQuery,
  useRequestWithdrawalMutation,
  useCreateDestinationMutation,
} from "@/hooks/api/use-supplier-finance-query"
import { useSupplierCompaniesQuery } from "@/hooks/api/use-supplier-companies-query"
import { publicApi } from "@/lib/api/public"
import { useQuery } from "@tanstack/react-query"
import { getSupplierBalances } from "@/lib/finance-display"
import { BalanceCards } from "@/components/supplier/finance/balance-cards"
import { WithdrawalForm } from "@/components/supplier/finance/withdrawal-form"
import { WithdrawalsHistoryTable } from "@/components/supplier/finance/withdrawals-history-table"
import { InvoicesTable } from "@/components/supplier/finance/invoices-table"
import { ReviewsReceivedTable } from "@/components/supplier/finance/reviews-received-table"
import type { Currency, PaymentMilestoneStatus, Review, WithdrawalDestinationType } from "@/types"

export default function SupplierFinancePage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const useApi = isApiEnabled()

  const getDestinations = useFinanceStore((s) => s.getDestinations)
  const getWithdrawals = useFinanceStore((s) => s.getWithdrawals)
  const getInvoices = useFinanceStore((s) => s.getInvoices)
  const requestWithdrawal = useFinanceStore((s) => s.requestWithdrawal)
  const addDestinationLocal = useFinanceStore((s) => s.addDestination)
  const [addDestinationOpen, setAddDestinationOpen] = useState(false)
  const destinations = useFinanceStore((s) => s.destinations)
  const contracts = useContractsStore((s) => s.contracts)
  const getContract = useContractsStore((s) => s.getContract)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const getMyCompany = useCompaniesStore((s) => s.getMyCompany)

  const { data: apiBalance } = useSupplierBalanceQuery(hydrated && useApi)
  const { data: paymentHistory } = useSupplierPaymentHistoryQuery(hydrated && useApi)
  const { data: apiCompanies } = useSupplierCompaniesQuery(hydrated && useApi)
  const { data: apiDestinations } = useSupplierFinanceDestinationsQuery(hydrated && useApi)
  const { data: apiWithdrawals } = useSupplierWithdrawalsQuery(hydrated && useApi)
  const { data: apiInvoices } = useSupplierInvoicesQuery(hydrated && useApi)
  const withdrawalMutation = useRequestWithdrawalMutation()
  const createDestinationMutation = useCreateDestinationMutation()

  const activeCompanyId = user?.activeCompanyId ?? apiCompanies?.[0]?.id
  const { data: apiReviews } = useQuery({
    queryKey: ["company-reviews", activeCompanyId],
    queryFn: () => publicApi.companyReviews(activeCompanyId!) as Promise<Review[]>,
    enabled: hydrated && useApi && Boolean(activeCompanyId),
  })

  const localBalances = hydrated
    ? getSupplierBalances(actorId, contracts, getWithdrawals(actorId))
    : { available: 0, pending: 0, escrowLocked: 0, currency: "TJS" as Currency }

  const balances = useApi && apiBalance
    ? {
        available: apiBalance.available,
        pending: apiBalance.pending,
        escrowLocked: apiBalance.escrow_locked,
        currency: apiBalance.currency as Currency,
      }
    : localBalances

  const destinationList = useApi
    ? (apiDestinations ?? [])
    : hydrated
      ? getDestinations(actorId)
      : []

  const withdrawalList = useApi
    ? (apiWithdrawals ?? [])
    : hydrated
      ? getWithdrawals(actorId)
      : []

  const invoiceList = useApi
    ? (apiInvoices ?? [])
    : hydrated
      ? getInvoices(actorId)
      : paymentHistory
        ? paymentHistory
            .filter((p) => p.status === "released")
            .map((p, idx) => ({
              id: idx + 1,
              actor_id: actorId,
              contract_id: p.contract_id,
              number: `INV-${p.contract_id}-${p.milestone_id}`,
              title: p.title,
              amount: p.amount,
              currency: p.currency as Currency,
              status: "paid" as const,
              issued_at: p.created_at,
              due_at: null,
              paid_at: p.created_at,
            }))
        : []

  const reviews = useApi ? (apiReviews ?? []) : hydrated ? (getMyCompany(actorId)?.reviews ?? []) : []

  const getDestination = (id: number) => destinationList.find((d) => d.id === id)

  const getContractTitle = (contractId: number | null) => {
    if (!contractId) return "—"
    return getContract(contractId)?.title ?? `Сделка #${contractId}`
  }

  const getReviewerName = (reviewerActorId: number) =>
    getCompany(reviewerActorId)?.title ?? `Заказчик #${reviewerActorId}`

  const handleAddDestination = async (input: {
    type: WithdrawalDestinationType
    label: string
    details: string
  }) => {
    if (useApi) {
      await createDestinationMutation.mutateAsync({
        ...input,
        is_default: destinationList.length === 0,
      })
      return
    }
    addDestinationLocal(actorId, input)
  }

  const handleWithdrawal = async (input: { destinationId: number; amount: number }) => {
    if (!useApi) return requestWithdrawal(actorId, input)
    try {
      await withdrawalMutation.mutateAsync({
        destination_id: input.destinationId,
        amount: input.amount,
      })
      return { ok: true as const }
    } catch {
      return { ok: false as const, error: "Не удалось создать заявку на вывод" }
    }
  }

  return (
    <PageFrame>
      <PageHeader
        title="Финансы"
        description="Сколько можно вывести, что поступит после приёмки, и документы"
      />

      {hydrated && destinationList.length === 0 && (
        <InlineHint variant="warning" className="items-center">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              <b>Добавьте счёт для выплат.</b> Без него деньги за принятые работы нельзя вывести.
            </span>
            <Button size="sm" onClick={() => setAddDestinationOpen(true)}>
              <Plus /> Добавить счёт
            </Button>
          </div>
        </InlineHint>
      )}

      <BalanceCards balances={balances} hydrated={hydrated} />

      <PageSurface id="payout" className="p-6 scroll-mt-24">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <ArrowDownToLine size={16} className="text-primary" />
          </div>
          <h2 className="text-base font-bold text-foreground">Выводы</h2>
          {destinationList.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => setAddDestinationOpen(true)}
            >
              <Plus /> Добавить счёт
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <WithdrawalForm
            destinations={destinationList}
            balances={balances}
            onSubmit={handleWithdrawal}
          />
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
              История
            </h3>
            <WithdrawalsHistoryTable
              withdrawals={withdrawalList}
              getDestination={getDestination}
            />
          </div>
        </div>
      </PageSurface>

      {useApi && paymentHistory && paymentHistory.length > 0 && (
        <PageSurface className="p-6">
          <h2 className="text-base font-bold text-foreground mb-4">История выплат по сделкам</h2>
          <div className="space-y-2 text-sm">
            {paymentHistory.map((p) => (
              <div
                key={`${p.contract_id}-${p.milestone_id}`}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="font-medium">{p.title}</span>
                <span className="text-muted-foreground">
                  {formatCurrency(p.amount, p.currency)} ·{" "}
                  {milestoneStatusMeta[p.status as PaymentMilestoneStatus]?.label ?? "—"}
                </span>
              </div>
            ))}
          </div>
        </PageSurface>
      )}

      <PageSurface className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <FileText size={16} className="text-primary" />
          </div>
          <h2 className="text-base font-bold text-foreground">Счета</h2>
        </div>
        <InvoicesTable invoices={invoiceList} getContractTitle={getContractTitle} />
      </PageSurface>

      <PageSurface id="reviews" className="p-6 scroll-mt-24">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <Star size={16} className="text-primary" />
          </div>
          <h2 className="text-base font-bold text-foreground">Полученные отзывы</h2>
        </div>
        <ReviewsReceivedTable
          reviews={reviews}
          getReviewerName={getReviewerName}
          getContractTitle={(id) => getContractTitle(id)}
        />
      </PageSurface>

      <AddPayoutDestinationDialog
        open={addDestinationOpen}
        onOpenChange={setAddDestinationOpen}
        busy={createDestinationMutation.isPending}
        onSubmit={handleAddDestination}
      />
    </PageFrame>
  )
}
