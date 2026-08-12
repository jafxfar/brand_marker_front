"use client"

import { use, useState } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, FileCheck, MessageSquare, Paperclip, Clock, Package } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import {
  useApproveSubmissionMutation,
  useContractQuery,
  useMarkMessagesReadMutation,
  useOpenDisputeMutation,
  useRejectSubmissionMutation,
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
import { BuyerContractSubmissionsPanel } from "@/components/cabinet/contracts/buyer-contract-submissions-panel"
import { ContractPaymentHistoryPanel } from "@/components/cabinet/contracts/contract-payment-history-panel"
import { ContractReviewSection } from "@/components/cabinet/contracts/contract-review-section"
import { ContractEscrowCard } from "@/components/supplier/contracts/contract-escrow-card"
import { ContractFilesPanel } from "@/components/supplier/contracts/contract-files-panel"
import { ContractMessagesPanel } from "@/components/supplier/contracts/contract-messages-panel"
import { ContractDisputeDialog } from "@/components/supplier/contracts/contract-dispute-dialog"
import type { PaymentHistoryEvent } from "@/lib/buyer-payments-display"
import { mapApiPaymentHistoryEvent } from "@/lib/buyer-payments-display"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { ContractWithRelations } from "@/types"

type PageProps = {
  params: Promise<{ id: string }>
}

const DISPUTE_DISABLED_STATUSES = ["disputed", "cancelled", "completed"] as const

export default function BuyerContractDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const contractId = Number(id)
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const userId = user?.userId ?? 0
  const useApi = isApiEnabled()

  const getContractLocal = useContractsStore((s) => s.getContract)
  const fundMilestoneLocal = useContractsStore((s) => s.fundMilestone)
  const approveMilestoneLocal = useContractsStore((s) => s.approveMilestone)
  const getPaymentHistoryLocal = useContractsStore((s) => s.getPaymentHistory)
  const openDisputeLocal = useContractsStore((s) => s.openDispute)
  const addMessageLocal = useContractsStore((s) => s.addMessage)
  const markConversationReadLocal = useContractsStore((s) => s.markConversationRead)
  const approveSubmissionLocal = useContractsStore((s) => s.approveSubmission)
  const rejectSubmissionLocal = useContractsStore((s) => s.rejectSubmission)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const submitReview = useCompaniesStore((s) => s.submitReview)
  const hasReviewForContract = useCompaniesStore((s) => s.hasReviewForContract)
  const [disputeOpen, setDisputeOpen] = useState(false)

  const { data: apiContract, isLoading } = useContractQuery(contractId, hydrated && useApi)
  const { data: paymentHistoryApi = [] } = usePaymentHistoryQuery(hydrated && useApi)
  const { data: buyerReviews = [] } = useBuyerReviewsQuery(hydrated && useApi)
  const sendMessageMutation = useSendMessageMutation()
  const markMessagesReadMutation = useMarkMessagesReadMutation("buyer")
  const openDisputeMutation = useOpenDisputeMutation()
  const fundAndConfirmMutation = useFundAndConfirmMilestoneMutation()
  const approveMilestoneMutation = useApproveMilestoneMutation()
  const createReviewMutation = useCreateReviewMutation()
  const approveSubmissionMutation = useApproveSubmissionMutation()
  const rejectSubmissionMutation = useRejectSubmissionMutation()

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
        <div className="h-40 bg-secondary rounded-xl" />
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

  const handleSendMessage = (text: string) => {
    if (useApi) {
      sendMessageMutation.mutate({ contractId, text })
      return
    }
    addMessageLocal(contractId, userId, text, user?.name)
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

  const handleApproveSubmission = (submissionId: number) => {
    if (useApi) {
      approveSubmissionMutation.mutate({ contractId, submissionId })
      return
    }
    approveSubmissionLocal(contractId, submissionId)
  }

  const handleRejectSubmission = (submissionId: number) => {
    if (useApi) {
      rejectSubmissionMutation.mutate({ contractId, submissionId })
      return
    }
    rejectSubmissionLocal(contractId, submissionId)
  }

  const messageCount = contract.conversation?.messages?.length ?? 0
  const fileCount = contract.files?.length ?? 0
  const submissionCount = contract.submissions?.length ?? 0

  return (
    <div className="max-w-[960px] mx-auto space-y-5">
      <Link
        href="/customer/contracts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} /> Назад к контрактам
      </Link>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileCheck size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground leading-tight">{contract.title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{supplierName}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-primary">
              {formatCurrency(contract.agreed_amount, contract.currency)}
            </p>
            <DeadlineCountdown
              dueDate={contract.due_date}
              status={contract.status}
              variant="prominent"
              showAbsoluteDate
              className="mt-0.5"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <span className={`inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${meta.className}`}>
            {meta.label}
          </span>
          <span className="text-xs text-muted-foreground">
            с {formatIsoDate(contract.start_date)}
          </span>
          {canDispute && (
            <button
              type="button"
              onClick={() => setDisputeOpen(true)}
              className="ml-auto inline-flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
              aria-label="Открыть спор"
            >
              <AlertTriangle size={12} />
              Спор
            </button>
          )}
          {contract.status === "disputed" && (
            <span className="ml-auto text-xs text-destructive font-semibold">Спор открыт</span>
          )}
        </div>
        <DeadlineBanner dueDate={contract.due_date} status={contract.status} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview" className="gap-1.5">
            <FileCheck size={14} /> Обзор
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-1.5">
            <MessageSquare size={14} /> Сообщения
            {messageCount > 0 && (
              <span className="ml-1 text-[10px] bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded-full">
                {messageCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="submission" className="gap-1.5">
            <Package size={14} /> Demo
            {submissionCount > 0 && (
              <span className="ml-1 text-[10px] bg-muted text-muted-foreground font-semibold px-1.5 py-0.5 rounded-full">
                {submissionCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-1.5">
            <Paperclip size={14} /> Файлы
            {fileCount > 0 && (
              <span className="ml-1 text-[10px] bg-muted text-muted-foreground font-semibold px-1.5 py-0.5 rounded-full">
                {fileCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <Clock size={14} /> История
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid lg:grid-cols-3 gap-5 items-start">
            <div className="lg:col-span-2 space-y-5">
              {contract.description && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h2 className="text-sm font-semibold text-foreground mb-2">Описание</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{contract.description}</p>
                </div>
              )}
              <BuyerContractMilestonesPanel
                contract={contract}
                onFund={handleFund}
                onApprove={handleApprove}
              />
            </div>
            <div className="space-y-5 lg:sticky lg:top-24">
              <ContractSupplierCard supplier={supplier} supplierTitle={supplierName} />
              <ContractEscrowCard contract={contract} />
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
        </TabsContent>

        <TabsContent value="messages">
          <ContractMessagesPanel
            contract={contract}
            currentUserId={userId}
            counterpartName={supplierName}
            onSendMessage={handleSendMessage}
            onMarkRead={(id) => {
              if (useApi) markMessagesReadMutation.mutate(id)
            }}
          />
        </TabsContent>

        <TabsContent value="submission">
          <BuyerContractSubmissionsPanel
            contract={contract}
            onApprove={handleApproveSubmission}
            onReject={handleRejectSubmission}
            busy={
              approveSubmissionMutation.isPending || rejectSubmissionMutation.isPending
            }
          />
        </TabsContent>

        <TabsContent value="files">
          <ContractFilesPanel files={contract.files} />
        </TabsContent>

        <TabsContent value="history">
          <ContractPaymentHistoryPanel events={paymentHistory} />
        </TabsContent>
      </Tabs>

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
