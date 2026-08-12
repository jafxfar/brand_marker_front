"use client"

import { use, useState } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, FileCheck, MessageSquare, Paperclip, Upload } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import {
  useMarkMessagesReadMutation,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
  const userId = user?.userId ?? 0
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
  const markMessagesReadMutation = useMarkMessagesReadMutation("supplier")
  const openDisputeMutation = useSupplierOpenDisputeMutation()
  const submitWorkMutation = useSupplierSubmitWorkMutation()

  const localContract = hydrated ? getContractLocal(contractId) : undefined
  const contract: ContractWithRelations | undefined = useApi
    ? (apiContract as ContractWithRelations | undefined)
    : localContract

  if (!hydrated || (useApi && isLoading)) {
    return (
      <div className="max-w-[960px] mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-secondary rounded-xl w-1/3" />
        <div className="h-40 bg-secondary rounded-xl" />
      </div>
    )
  }

  if (!contract || contract.supplier_actor_id !== actorId) {
    return (
      <div className="max-w-[960px] mx-auto text-center py-16">
        <p className="text-sm font-semibold text-foreground">Контракт не найден</p>
        <Link href="/supplier/contracts" className="text-sm text-primary hover:underline mt-2 inline-block">
          Вернуться к списку
        </Link>
      </div>
    )
  }

  const meta = contractStatusMeta[contract.status]
  const buyer = getCompany(contract.buyer_actor_id)
  const buyerName = buyer?.title ?? "Заказчик"
  const canDispute = !DISPUTE_DISABLED_STATUSES.includes(
    contract.status as (typeof DISPUTE_DISABLED_STATUSES)[number],
  )
  const messageCount = contract.conversation?.messages?.length ?? 0
  const fileCount = contract.files?.length ?? 0

  const handleSendMessage = (text: string) => {
    if (useApi) {
      sendMessageMutation.mutate({ contractId, text })
      return
    }
    addMessageLocal(contractId, userId, text, user?.name)
  }

  const handleSubmitWork = (input: {
    note: string
    fileNames: string[]
    assets: { kind: "image" | "video" | "file" | "link"; name: string; url: string; file_type?: string | null }[]
  }) => {
    if (useApi) {
      submitWorkMutation.mutate({
        contractId,
        note: input.note,
        fileNames: input.fileNames,
        assets: input.assets,
      })
      return
    }
    submitWorkLocal(contractId, input)
  }

  return (
    <div className="max-w-[960px] mx-auto space-y-5">
      <Link
        href="/supplier/contracts"
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
            <p className="text-sm text-muted-foreground mt-0.5">{buyerName}</p>
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
          <TabsTrigger value="files" className="gap-1.5">
            <Paperclip size={14} /> Файлы
            {fileCount > 0 && (
              <span className="ml-1 text-[10px] bg-muted text-muted-foreground font-semibold px-1.5 py-0.5 rounded-full">
                {fileCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="submission" className="gap-1.5">
            <Upload size={14} /> Demo
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
              <ContractMilestonesPanel contract={contract} />
            </div>
            <div className="space-y-5 lg:sticky lg:top-24">
              <ContractBuyerCard buyer={buyer} />
              <ContractEscrowCard contract={contract} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <ContractMessagesPanel
            contract={contract}
            currentUserId={userId}
            counterpartName={buyerName}
            onSendMessage={handleSendMessage}
            onMarkRead={(id) => {
              if (useApi) markMessagesReadMutation.mutate(id)
            }}
          />
        </TabsContent>

        <TabsContent value="files">
          <ContractFilesPanel files={contract.files} />
        </TabsContent>

        <TabsContent value="submission">
          <ContractSubmissionPanel
            contract={contract}
            onSubmit={handleSubmitWork}
          />
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
