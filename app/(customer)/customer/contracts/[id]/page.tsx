"use client"

import { use, useState } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, FileCheck } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import {
  useContractQuery,
  useOpenDisputeMutation,
  useSendMessageMutation,
} from "@/hooks/api/use-contracts-query"
import { useCreateReviewMutation, useBuyerReviewsQuery } from "@/hooks/api/use-reviews-query"
import { useSupplierActorName } from "@/hooks/api/use-supplier-name"
import {
  useFundAndConfirmMilestoneMutation,
  useApproveMilestoneMutation,
  usePaymentHistoryQuery,
} from "@/hooks/api/use-payments-query"
import { contractStatusMeta } from "@/lib/contract-display"
import { formatCurrency, formatIsoDate } from "@/lib/format"
import { DeadlineBanner, DeadlineCountdown } from "@/components/contracts/deadline-countdown"
import { ContractSupplierCard } from "@/components/cabinet/contracts/contract-supplier-card"
import { BuyerContractMilestonesPanel } from "@/components/cabinet/contracts/buyer-contract-milestones-panel"
import { ContractPaymentHistoryPanel } from "@/components/cabinet/contracts/contract-payment-history-panel"
import { ContractReviewSection } from "@/components/cabinet/contracts/contract-review-section"
import { ContractEscrowCard } from "@/components/supplier/contracts/contract-escrow-card"
import { ContractFilesPanel } from "@/components/supplier/contracts/contract-files-panel"
import { ContractMessagesPanel } from "@/components/supplier/contracts/contract-messages-panel"
import { ContractDisputeDialog } from "@/components/supplier/contracts/contract-dispute-dialog"
import type { PaymentHistoryEvent } from "@/lib/buyer-payments-display"
import { mapApiPaymentHistoryEvent } from "@/lib/buyer-payments-display"
import type { ContractWithRelations } from "@/types"

type PageProps = {
  params: Promise<{ id: string }>
}

const DISPUTE_DISABLED_STATUSES = ["disputed", "cancelled", "completed"] as const

export default function BuyerContractDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const contractId = Number(id)
  const hydrated = useHydrated()
  const actorId = getActorId(useAuthStore((s) => s.user))
  const useApi = isApiEnabled()

  const getContractLocal = useContractsStore((s) => s.getContract)
  const fundMilestoneLocal = useContractsStore((s) => s.fundMilestone)
  const approveMilestoneLocal = useContractsStore((s) => s.approveMilestone)
  const getPaymentHistoryLocal = useContractsStore((s) => s.getPaymentHistory)
  const openDisputeLocal = useContractsStore((s) => s.openDispute)
  const addMessageLocal = useContractsStore((s) => s.addMessage)
  const markConversationReadLocal = useContractsStore((s) => s.markConversationRead)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const submitReview = useCompaniesStore((s) => s.submitReview)
  const hasReviewForContract = useCompaniesStore((s) => s.hasReviewForContract)
  const [disputeOpen, setDisputeOpen] = useState(false)

  const { data: apiContract, isLoading } = useContractQuery(contractId, hydrated && useApi)
  const { data: paymentHistoryApi = [] } = usePaymentHistoryQuery(hydrated && useApi)
  const { data: buyerReviews = [] } = useBuyerReviewsQuery(hydrated && useApi)
  const sendMessageMutation = useSendMessageMutation()
  const openDisputeMutation = useOpenDisputeMutation()
  const fundAndConfirmMutation = useFundAndConfirmMilestoneMutation()
  const approveMilestoneMutation = useApproveMilestoneMutation()
  const createReviewMutation = useCreateReviewMutation()

  const supplierActorId =
    (useApi ? apiContract?.supplier_actor_id : getContractLocal(contractId)?.supplier_actor_id) ?? 0
  const resolveSupplierName = useSupplierActorName(
    supplierActorId ? [supplierActorId] : [],
  )

  const localContract = hydrated ? getContractLocal(contractId) : undefined
  const contract: ContractWithRelations | undefined = useApi
    ? (apiContract as ContractWithRelations | undefined)
    : localContract

  if (!hydrated || (useApi && isLoading)) {
    return (
      <div className="max-w-[1000px] mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-secondary rounded-xl w-1/3" />
        <div className="h-40 bg-secondary rounded-2xl" />
      </div>
    )
  }

  if (!contract || contract.buyer_actor_id !== actorId) {
    return (
      <div className="max-w-[1000px] mx-auto text-center py-16">
        <p className="text-sm font-semibold text-foreground">Контракт не найден</p>
        <Link href="/customer/contracts" className="text-sm text-primary hover:underline mt-2 inline-block">
          Вернуться к списку
        </Link>
      </div>
    )
  }

  const meta = contractStatusMeta[contract.status]
  const supplier = getCompany(contract.supplier_actor_id)
  const supplierName = useApi
    ? resolveSupplierName(contract.supplier_actor_id)
    : (supplier?.title ?? "Поставщик")
  const canDispute = !DISPUTE_DISABLED_STATUSES.includes(
    contract.status as (typeof DISPUTE_DISABLED_STATUSES)[number],
  )
  const paymentHistory: PaymentHistoryEvent[] = useApi
    ? paymentHistoryApi
        .filter((p) => p.contract_id === contractId)
        .map(mapApiPaymentHistoryEvent)
    : getPaymentHistoryLocal(contractId)
  const hasReview = useApi
    ? buyerReviews.some((r) => r.contract_id === contractId)
    : hasReviewForContract(actorId, contractId)

  const getSenderName = (senderId: number) => {
    if (senderId === actorId) return "Вы"
    if (senderId === contract.supplier_actor_id) {
      return supplierName
    }
    return getCompany(senderId)?.title ?? "Участник"
  }

  const handleSendMessage = (text: string) => {
    if (useApi) {
      sendMessageMutation.mutate({ contractId, text })
      return
    }
    addMessageLocal(contractId, actorId, text)
    markConversationReadLocal(contractId)
  }

  const handleSubmitReview = (rating: number, text: string) => {
    if (useApi) {
      createReviewMutation.mutate({
        contract_id: contractId,
        target_actor_id: contract.supplier_actor_id,
        rating,
        comment: text || null,
      })
      return
    }
    submitReview({
      contractId,
      reviewerActorId: actorId,
      targetActorId: contract.supplier_actor_id,
      rating,
      comment: text || null,
    })
  }

  const handleFund = (milestoneId: number) => {
    if (useApi) {
      fundAndConfirmMutation.mutate(milestoneId)
      return
    }
    fundMilestoneLocal(contractId, milestoneId, actorId)
  }

  const handleApprove = (milestoneId: number) => {
    if (useApi) {
      approveMilestoneMutation.mutate(milestoneId)
      return
    }
    approveMilestoneLocal(contractId, milestoneId, actorId)
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <Link
        href="/customer/contracts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} /> Назад к контрактам
      </Link>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <FileCheck size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-black text-foreground">{contract.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {supplier?.title ?? "Поставщик"}
                </p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-2 ${meta.className}`}>
                  {meta.label}
                </span>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-black text-primary">
                  {formatCurrency(contract.agreed_amount, contract.currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  с {formatIsoDate(contract.start_date)}
                </p>
                <DeadlineCountdown
                  dueDate={contract.due_date}
                  status={contract.status}
                  variant="prominent"
                  showAbsoluteDate
                  className="mt-1"
                />
              </div>
            </div>

            <DeadlineBanner dueDate={contract.due_date} status={contract.status} />

            {contract.description && (
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                {contract.description}
              </p>
            )}
          </div>

          <BuyerContractMilestonesPanel
            contract={contract}
            onFund={handleFund}
            onApprove={handleApprove}
          />
          <ContractPaymentHistoryPanel events={paymentHistory} />
          <ContractFilesPanel files={contract.files} />
          <ContractMessagesPanel
            contract={contract}
            currentSenderId={actorId}
            getSenderName={getSenderName}
            onSendMessage={handleSendMessage}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <ContractSupplierCard supplier={supplier} supplierTitle={supplierName} />
          <ContractEscrowCard contract={contract} />

          <section className="bg-white border border-border rounded-2xl p-6">
            <h2 className="text-base font-bold text-foreground mb-4">Действия</h2>
            <button
              type="button"
              onClick={() => setDisputeOpen(true)}
              disabled={!canDispute}
              className="w-full h-10 px-4 rounded-xl border border-destructive/30 text-destructive text-sm font-bold hover:bg-destructive/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <AlertTriangle size={16} />
              {contract.status === "disputed" ? "Спор открыт" : "Открыть спор"}
            </button>
          </section>

          <ContractReviewSection
            supplierName={supplierName}
            canReview={contract.status === "completed"}
            hasReview={hasReview}
            onSubmit={handleSubmitReview}
          />

          <Link
            href={`/customer/rfqs/${contract.rfq_id}`}
            className="block text-center text-sm font-semibold text-primary hover:underline"
          >
            Перейти к заявке
          </Link>
        </div>
      </div>

      <ContractDisputeDialog
        open={disputeOpen}
        onOpenChange={setDisputeOpen}
        onConfirm={(reason) => {
          if (useApi) {
            openDisputeMutation.mutate({ contractId, reason })
            return
          }
          openDisputeLocal(contractId, reason, actorId)
        }}
      />
    </div>
  )
}
