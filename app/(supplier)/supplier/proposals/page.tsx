"use client"

import { useState } from "react"
import Link from "next/link"
import { Send, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  PageEmptyState,
  PageFrame,
  PageHeader,
  PageSurface,
  SegmentedControl,
} from "@/components/layout"
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
    <PageFrame>
      <PageHeader
        title="Мои предложения"
        description="Отслеживайте статус ваших откликов на заявки"
      />

      <SegmentedControl
        value={tab}
        options={tabs}
        onChange={setTab}
        ariaLabel="Статус предложения"
      />

      {!hydrated || (useApi && isLoading) ? (
        <PageSurface className="animate-pulse p-12">
          <div className="mx-auto h-4 w-1/3 rounded bg-secondary" />
        </PageSurface>
      ) : filtered.length === 0 ? (
        <PageSurface>
          <PageEmptyState
            icon={<Send size={32} />}
            title="Предложений нет"
            description={emptyText[tab]}
          />
          <div className="flex justify-center pb-10">
            <Button asChild size="lg">
              <Link href="/supplier/rfqs">
                Перейти к заявкам заказчиков <ArrowRight size={15} />
              </Link>
            </Button>
          </div>
        </PageSurface>
      ) : (
        <PageSurface>
          <MyProposalsTable
            proposals={filtered}
            getRfqTitle={getRfqTitle}
            onWithdraw={useApi ? handleWithdraw : undefined}
            withdrawingId={withdrawMutation.isPending ? withdrawMutation.variables : undefined}
          />
        </PageSurface>
      )}
    </PageFrame>
  )
}
