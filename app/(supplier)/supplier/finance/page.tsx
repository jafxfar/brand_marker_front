"use client"

import { ArrowDownToLine, FileText, Star } from "lucide-react"
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
import type { Currency, Review } from "@/types"

export default function SupplierFinancePage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const useApi = isApiEnabled()

  const getDestinations = useFinanceStore((s) => s.getDestinations)
  const getWithdrawals = useFinanceStore((s) => s.getWithdrawals)
  const getInvoices = useFinanceStore((s) => s.getInvoices)
  const requestWithdrawal = useFinanceStore((s) => s.requestWithdrawal)
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
    return getContract(contractId)?.title ?? `Контракт #${contractId}`
  }

  const getReviewerName = (reviewerActorId: number) =>
    getCompany(reviewerActorId)?.title ?? `Заказчик #${reviewerActorId}`

  const handleWithdrawal = async (input: { destinationId: number; amount: number }) => {
    if (useApi) {
      await withdrawalMutation.mutateAsync({
        destination_id: input.destinationId,
        amount: input.amount,
      })
      return
    }
    requestWithdrawal(actorId, input)
  }

  return (
    <PageFrame>
      <PageHeader
        title="Финансы"
        description="Баланс, выводы и документы"
      />

      <BalanceCards balances={balances} hydrated={hydrated} />

      <PageSurface className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <ArrowDownToLine size={16} className="text-primary" />
          </div>
          <h2 className="text-base font-bold text-foreground">Выводы</h2>
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
          <h2 className="text-base font-bold text-foreground mb-4">История безопасных выплат</h2>
          <div className="space-y-2 text-sm">
            {paymentHistory.map((p) => (
              <div
                key={`${p.contract_id}-${p.milestone_id}`}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="font-medium">{p.title}</span>
                <span className="text-muted-foreground">
                  {p.amount.toLocaleString("ru-RU")} {p.currency} · {p.status}
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

      <PageSurface className="p-6">
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
    </PageFrame>
  )
}
