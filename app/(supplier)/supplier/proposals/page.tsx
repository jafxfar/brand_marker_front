"use client"

import { useState } from "react"
import Link from "next/link"
import { Send, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/auth-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import {
  useSupplierProposalsQuery,
  useWithdrawProposalMutation,
} from "@/hooks/api/use-supplier-rfqs-query"
import {
  MY_PROPOSAL_FILTER_STATUSES,
  myProposalTabLabels,
  type MyProposalFilterStatus,
} from "@/lib/proposal-display"
import { MyProposalsTable } from "@/components/supplier/proposals/my-proposals-table"
import type { Proposal, ProposalWithRelations } from "@/types"

type Tab = "all" | MyProposalFilterStatus

const tabs: { value: Tab; label: string }[] = [
  { value: "all", label: "Все" },
  ...MY_PROPOSAL_FILTER_STATUSES.map((status) => ({
    value: status as Tab,
    label: myProposalTabLabels[status],
  })),
]

const filterProposals = <T extends Proposal>(proposals: T[], tab: Tab): T[] => {
  if (tab === "all") return proposals
  return proposals.filter((p) => p.status === tab)
}

const emptyText: Record<Tab, string> = {
  all: "Вы ещё не отправляли откликов на заявки.",
  submitted: "Нет предложений со статусом «Отправлено».",
  shortlisted: "Нет предложений в избранном у заказчика.",
  accepted: "Нет принятых предложений.",
  rejected: "Нет отклонённых предложений.",
  withdrawn: "Нет отозванных предложений.",
}

export default function SupplierProposalsPage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const getProposalsBySupplier = useProposalsStore((s) => s.getProposalsBySupplier)
  const getRfq = useRfqsStore((s) => s.getRfq)
  const [tab, setTab] = useState<Tab>("all")

  const useApi = isApiEnabled()
  const { data: apiProposals, isLoading } = useSupplierProposalsQuery(hydrated && useApi)
  const withdrawMutation = useWithdrawProposalMutation()

  const localProposals = hydrated ? getProposalsBySupplier(actorId) : []
  const allProposals: ProposalWithRelations[] = useApi
    ? (apiProposals ?? [])
    : localProposals
  const filtered = filterProposals(allProposals, tab)

  const getRfqTitle = (rfqId: string) => getRfq(rfqId)?.title ?? rfqId

  const handleWithdraw = (proposalId: number) => {
    if (!useApi) return
    withdrawMutation.mutate(proposalId)
  }

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Send size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Мои предложения</h1>
          <p className="text-sm text-muted-foreground">
            Отслеживайте статус ваших откликов на заявки
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 mb-5 bg-white border border-border rounded-xl p-1 w-fit max-w-full">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap",
              tab === t.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!hydrated || (useApi && isLoading) ? (
        <div className="bg-white border border-border rounded-2xl p-12 animate-pulse">
          <div className="h-4 bg-secondary rounded w-1/3 mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <Send size={32} className="text-primary mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Предложений нет</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">{emptyText[tab]}</p>
          <Link
            href="/supplier/rfqs"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-dark transition-colors"
          >
            Перейти к заявкам заказчиков <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <MyProposalsTable
          proposals={filtered}
          getRfqTitle={getRfqTitle}
          onWithdraw={useApi ? handleWithdraw : undefined}
          withdrawingId={withdrawMutation.isPending ? withdrawMutation.variables : undefined}
        />
      )}
    </div>
  )
}
