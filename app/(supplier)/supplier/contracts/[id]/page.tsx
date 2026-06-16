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
  useSupplierContractQuery,
  useSupplierOpenDisputeMutation,
  useSupplierSendMessageMutation,
  useSupplierSubmitWorkMutation,
} from "@/hooks/api/use-contracts-query"
import { contractStatusMeta } from "@/lib/contract-display"
import { formatCurrency, formatIsoDate } from "@/lib/format"
import { DeadlineBanner, DeadlineCountdown } from "@/components/contracts/deadline-countdown"
import { ContractBuyerCard } from "@/components/supplier/contracts/contract-buyer-card"
import { ContractMilestonesPanel } from "@/components/supplier/contracts/contract-milestones-panel"
import { ContractEscrowCard } from "@/components/supplier/contracts/contract-escrow-card"
import { ContractFilesPanel } from "@/components/supplier/contracts/contract-files-panel"
import { ContractMessagesPanel } from "@/components/supplier/contracts/contract-messages-panel"
import { ContractSubmissionPanel } from "@/components/supplier/contracts/contract-submission-panel"
import { ContractDisputeDialog } from "@/components/supplier/contracts/contract-dispute-dialog"
import type { ContractWithRelations } from "@/types"

type PageProps = {
  params: Promise<{ id: string }>
}

const DISPUTE_DISABLED_STATUSES = ["disputed", "cancelled", "completed"] as const

export default function SupplierContractDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const contractId = Number(id)
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const useApi = isApiEnabled()

  const getContractLocal = useContractsStore((s) => s.getContract)
  const submitWorkLocal = useContractsStore((s) => s.submitWork)
  const openDisputeLocal = useContractsStore((s) => s.openDispute)
  const addMessageLocal = useContractsStore((s) => s.addMessage)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const [disputeOpen, setDisputeOpen] = useState(false)

  const { data: apiContract, isLoading } = useSupplierContractQuery(
    contractId,
    hydrated && useApi,
  )
  const sendMessageMutation = useSupplierSendMessageMutation()
  const openDisputeMutation = useSupplierOpenDisputeMutation()
  const submitWorkMutation = useSupplierSubmitWorkMutation()

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

  if (!contract || contract.supplier_actor_id !== actorId) {
    return (
      <div className="max-w-[1000px] mx-auto text-center py-16">
        <p className="text-sm font-semibold text-foreground">Контракт не найден</p>
        <Link href="/supplier/contracts" className="text-sm text-primary hover:underline mt-2 inline-block">
          Вернуться к списку
        </Link>
      </div>
    )
  }

  const meta = contractStatusMeta[contract.status]
  const buyer = getCompany(contract.buyer_actor_id)
  const canDispute = !DISPUTE_DISABLED_STATUSES.includes(
    contract.status as (typeof DISPUTE_DISABLED_STATUSES)[number],
  )

  const getSenderName = (senderId: number) => {
    if (senderId === actorId) return "Вы"
    if (senderId === contract.buyer_actor_id) return buyer?.title ?? "Заказчик"
    return getCompany(senderId)?.title ?? "Участник"
  }

  const handleSendMessage = (text: string) => {
    if (useApi) {
      sendMessageMutation.mutate({ contractId, text })
      return
    }
    addMessageLocal(contractId, actorId, text)
  }

  const handleSubmitWork = (input: { note: string; fileNames: string[] }) => {
    if (useApi) {
      submitWorkMutation.mutate({
        contractId,
        note: input.note,
        fileNames: input.fileNames,
      })
      return
    }
    submitWorkLocal(contractId, input)
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <Link
        href="/supplier/contracts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} /> Назад к контрактам
      </Link>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <FileCheck size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-black text-foreground">{contract.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {buyer?.title ?? "Заказчик"}
                </p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-2 ${meta.className}`}>
                  {meta.label}
                </span>
              </div>
              <div className="text-right shrink-0">
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

          <ContractMilestonesPanel contract={contract} />
          <ContractFilesPanel files={contract.files} />
          <ContractMessagesPanel
            contract={contract}
            currentSenderId={actorId}
            getSenderName={getSenderName}
            onSendMessage={handleSendMessage}
          />
          <ContractSubmissionPanel
            contract={contract}
            onSubmit={handleSubmitWork}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <ContractBuyerCard buyer={buyer} />
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
            {!canDispute && contract.status !== "disputed" && (
              <p className="text-xs text-muted-foreground mt-2">
                Действие недоступно для завершённых и отменённых контрактов
              </p>
            )}
          </section>
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
