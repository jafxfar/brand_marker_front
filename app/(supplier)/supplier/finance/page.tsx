"use client"

import { useMemo, useRef, useState } from "react"
import { FileText, Landmark, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddPayoutDestinationDialog } from "@/components/supplier/finance/add-payout-destination-dialog"
import { PayoutAccountCard } from "@/components/supplier/finance/payout-account-card"
import { formatCurrency, formatIsoDate } from "@/lib/format"
import { PageFrame, PageHeader, SegmentedControl } from "@/components/layout"
import { MetricTile } from "@/components/process"
import { StatusBadge } from "@/components/bm"
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
import { WithdrawalForm } from "@/components/supplier/finance/withdrawal-form"
import { InvoicesTable } from "@/components/supplier/finance/invoices-table"
import { ReviewsReceivedTable } from "@/components/supplier/finance/reviews-received-table"
import { isDealOpen } from "@/lib/process/deal-stages"
import type { Currency, WithdrawalDestinationType } from "@/types"

type HistoryTab = "invoices" | "reviews"

const WITHDRAWAL_LABEL: Record<string, string> = {
  pending: "В обработке",
  processing: "В обработке",
  completed: "Выплачено",
  failed: "Ошибка",
  cancelled: "Отменено",
}

export default function SupplierFinancePage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const useApi = isApiEnabled()
  const payoutRef = useRef<HTMLDivElement>(null)
  const [tab, setTab] = useState<HistoryTab>("invoices")
  const [addDestinationOpen, setAddDestinationOpen] = useState(false)

  const getDestinations = useFinanceStore((s) => s.getDestinations)
  const getWithdrawals = useFinanceStore((s) => s.getWithdrawals)
  const getInvoices = useFinanceStore((s) => s.getInvoices)
  const requestWithdrawal = useFinanceStore((s) => s.requestWithdrawal)
  const addDestinationLocal = useFinanceStore((s) => s.addDestination)
  const contracts = useContractsStore((s) => s.contracts)
  const getContract = useContractsStore((s) => s.getContract)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const getMyCompany = useCompaniesStore((s) => s.getMyCompany)

  const { data: apiBalance } = useSupplierBalanceQuery(hydrated && useApi)
  const { data: paymentHistoryPage } = useSupplierPaymentHistoryQuery(
    hydrated && useApi,
  )
  const paymentHistory = paymentHistoryPage?.items ?? []
  const { data: apiCompanies } = useSupplierCompaniesQuery(hydrated && useApi)
  const { data: apiDestinations } = useSupplierFinanceDestinationsQuery(
    hydrated && useApi,
  )
  const { data: apiWithdrawals } = useSupplierWithdrawalsQuery(hydrated && useApi)
  const { data: apiInvoices } = useSupplierInvoicesQuery(hydrated && useApi)
  const withdrawalMutation = useRequestWithdrawalMutation()
  const createDestinationMutation = useCreateDestinationMutation()

  const activeCompanyId = user?.activeCompanyId ?? apiCompanies?.items?.[0]?.id
  const { data: apiReviewsPage } = useQuery({
    queryKey: ["company-reviews", activeCompanyId],
    queryFn: () => publicApi.companyReviews(activeCompanyId!),
    enabled: hydrated && useApi && Boolean(activeCompanyId),
  })

  const localBalances = hydrated
    ? getSupplierBalances(actorId, contracts, getWithdrawals(actorId))
    : {
        available: 0,
        pending: 0,
        escrowLocked: 0,
        currency: "TJS" as Currency,
      }

  const balances =
    useApi && apiBalance
      ? {
          available: apiBalance.available,
          pending: apiBalance.pending,
          escrowLocked: apiBalance.escrow_locked,
          currency: apiBalance.currency as Currency,
        }
      : localBalances

  const destinationList = useApi
    ? (apiDestinations?.items ?? [])
    : hydrated
      ? getDestinations(actorId)
      : []

  const withdrawalList = useApi
    ? (apiWithdrawals?.items ?? [])
    : hydrated
      ? getWithdrawals(actorId)
      : []

  const invoiceList = useApi
    ? (apiInvoices?.items ?? [])
    : hydrated
      ? getInvoices(actorId)
      : paymentHistory
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

  const reviews = useApi
    ? (apiReviewsPage?.items ?? [])
    : hydrated
      ? (getMyCompany(actorId)?.reviews ?? [])
      : []

  const incomingAfterAccept = useMemo(() => {
    if (balances.escrowLocked > 0) return balances.escrowLocked
    const open = contracts.filter(
      (c) => c.supplier_actor_id === actorId && isDealOpen(c),
    )
    return Math.round(
      open.reduce((sum, c) => sum + c.agreed_amount * 0.96, 0),
    )
  }, [balances.escrowLocked, contracts, actorId])

  const defaultDestination =
    destinationList.find((d) => d.is_default) ?? destinationList[0] ?? null

  const historyRows = useMemo(() => {
    const rows: {
      key: string
      date: string
      what: string
      amount: number
      currency: string
      status: string
      statusLabel: string
    }[] = []

    withdrawalList.forEach((w) => {
      rows.push({
        key: `w-${w.id}`,
        date: w.created_at,
        what: "Вывод на счёт",
        amount: -w.amount,
        currency: w.currency,
        status: w.status,
        statusLabel: WITHDRAWAL_LABEL[w.status] ?? w.status,
      })
    })

    paymentHistory.forEach((p) => {
      rows.push({
        key: `p-${p.contract_id}-${p.milestone_id}`,
        date: p.created_at,
        what: p.title,
        amount: p.status === "released" ? p.amount : p.amount,
        currency: p.currency,
        status: p.status,
        statusLabel:
          p.status === "released"
            ? "Переведено"
            : p.status === "funded" || p.status === "held"
              ? "На гарантии"
              : p.status,
      })
    })

    rows.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    return rows
  }, [withdrawalList, paymentHistory])

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

  const handleWithdrawal = async (input: {
    destinationId: number
    amount: number
  }) => {
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

  const scrollToWithdraw = () => {
    payoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <PageFrame>
      <PageHeader
        title="Финансы"
        description="Выплаты по завершённым сделкам"
        actions={
          <Button type="button" size="lg" onClick={scrollToWithdraw}>
            <Landmark size={16} />
            Вывести на счёт
          </Button>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Баланс">
        <MetricTile
          label="Можно вывести"
          value={
            hydrated
              ? formatCurrency(balances.available, balances.currency)
              : "—"
          }
          hint="после приёмки покупателями"
          valueClassName="text-safe-700"
        />
        <MetricTile
          label="Поступит после приёмки"
          value={
            hydrated
              ? formatCurrency(incomingAfterAccept, balances.currency)
              : "—"
          }
          hint="на гарантии банка"
        />
        <MetricTile
          label="Комиссия площадки"
          value="4%"
          hint="только с завершённых сделок"
        />
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <span className="text-[13px] font-semibold text-mute">История</span>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-line bg-white">
            {historyRows.length === 0 ? (
              <p className="p-6 text-[14px] text-mute">Операций пока нет.</p>
            ) : (
              <table className="w-full min-w-[560px] text-[14.5px]">
                <thead>
                  <tr className="border-b border-line text-left">
                    {["Дата", "Операция", "Сумма", "Статус"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-[13px] font-semibold whitespace-nowrap text-mute"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {historyRows.map((row) => (
                    <tr key={row.key}>
                      <td className="whitespace-nowrap px-5 py-4 text-mute">
                        {formatIsoDate(row.date)}
                      </td>
                      <td className="px-5 py-4">{row.what}</td>
                      <td className="mono whitespace-nowrap px-5 py-4 font-semibold">
                        <span
                          className={
                            row.amount > 0 ? "text-safe-700" : undefined
                          }
                        >
                          {row.amount > 0 ? "+" : "−"}
                          {formatCurrency(
                            Math.abs(row.amount),
                            row.currency,
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          status={row.status}
                          label={row.statusLabel}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <PayoutAccountCard
          destination={defaultDestination}
          onEdit={() => setAddDestinationOpen(true)}
        />
      </div>

      <div
        ref={payoutRef}
        id="payout"
        className="mt-8 scroll-mt-24 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)] md:p-6"
      >
        <b className="text-[15px]">Вывести средства</b>
        <div className="mt-4 max-w-lg">
          <WithdrawalForm
            destinations={destinationList}
            balances={balances}
            onSubmit={handleWithdrawal}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          ariaLabel="Дополнительно"
          options={[
            { value: "invoices", label: "Счета", count: invoiceList.length },
            { value: "reviews", label: "Отзывы", count: reviews.length },
          ]}
        />
        {tab === "invoices" ? (
          <div className="rounded-2xl border border-line bg-white p-5 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="size-4 text-mute" aria-hidden />
              <b className="text-[15px]">Счета</b>
            </div>
            <InvoicesTable
              invoices={invoiceList}
              getContractTitle={getContractTitle}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-white p-5 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Star className="size-4 text-mute" aria-hidden />
              <b className="text-[15px]">Полученные отзывы</b>
            </div>
            <ReviewsReceivedTable
              reviews={reviews}
              getReviewerName={getReviewerName}
              getContractTitle={(id) => getContractTitle(id)}
            />
          </div>
        )}
      </div>

      <AddPayoutDestinationDialog
        open={addDestinationOpen}
        onOpenChange={setAddDestinationOpen}
        busy={createDestinationMutation.isPending}
        onSubmit={handleAddDestination}
      />
    </PageFrame>
  )
}
