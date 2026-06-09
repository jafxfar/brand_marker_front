"use client"

import { ArrowDownToLine, FileText, Star, Wallet } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useFinanceStore } from "@/lib/store/finance-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { getSupplierBalances } from "@/lib/finance-display"
import { BalanceCards } from "@/components/supplier/finance/balance-cards"
import { WithdrawalForm } from "@/components/supplier/finance/withdrawal-form"
import { WithdrawalsHistoryTable } from "@/components/supplier/finance/withdrawals-history-table"
import { InvoicesTable } from "@/components/supplier/finance/invoices-table"
import { ReviewsReceivedTable } from "@/components/supplier/finance/reviews-received-table"

export default function SupplierFinancePage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)

  const getDestinations = useFinanceStore((s) => s.getDestinations)
  const getWithdrawals = useFinanceStore((s) => s.getWithdrawals)
  const getInvoices = useFinanceStore((s) => s.getInvoices)
  const requestWithdrawal = useFinanceStore((s) => s.requestWithdrawal)
  const destinations = useFinanceStore((s) => s.destinations)
  const withdrawals = useFinanceStore((s) => s.withdrawals)
  const contracts = useContractsStore((s) => s.contracts)
  const getContract = useContractsStore((s) => s.getContract)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const getMyCompany = useCompaniesStore((s) => s.getMyCompany)

  const balances = hydrated
    ? getSupplierBalances(actorId, contracts, withdrawals)
    : {
        available: 0,
        pending: 0,
        escrowLocked: 0,
        currency: "RUB" as const,
      }
  const withdrawalList = hydrated ? getWithdrawals(actorId) : []
  const invoiceList = hydrated ? getInvoices(actorId) : []
  const destinationList = hydrated ? getDestinations(actorId) : []
  const reviews = hydrated ? (getMyCompany(actorId)?.reviews ?? []) : []

  const getDestination = (id: number) =>
    destinations.find((d) => d.id === id)

  const getContractTitle = (contractId: number | null) => {
    if (!contractId) return "—"
    return getContract(contractId)?.title ?? `Контракт #${contractId}`
  }

  const getReviewerName = (reviewerActorId: number) =>
    getCompany(reviewerActorId)?.title ?? `Заказчик #${reviewerActorId}`

  const handleWithdrawal = (input: { destinationId: number; amount: number }) =>
    requestWithdrawal(actorId, input)

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Wallet size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Финансы</h1>
          <p className="text-sm text-muted-foreground">Баланс, выводы и документы</p>
        </div>
      </div>

      <BalanceCards balances={balances} hydrated={hydrated} />

      <section className="bg-white border border-border rounded-2xl p-6">
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
      </section>

      <section className="bg-white border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <FileText size={16} className="text-primary" />
          </div>
          <h2 className="text-base font-bold text-foreground">Счета</h2>
        </div>
        <InvoicesTable
          invoices={invoiceList}
          getContractTitle={getContractTitle}
        />
      </section>

      <section className="bg-white border border-border rounded-2xl p-6">
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
      </section>
    </div>
  )
}
