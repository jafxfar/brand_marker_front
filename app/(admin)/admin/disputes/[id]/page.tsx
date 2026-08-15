"use client"

import { use, useState } from "react"
import Link from "next/link"
import {
  Banknote,
  CheckCircle2,
  FileSearch,
  Gavel,
  RefreshCcw,
  Undo2,
  XCircle,
} from "lucide-react"
import { DisputeActionDialog } from "@/components/admin/disputes/dispute-action-dialog"
import { AdminDisputeDetailSections } from "@/components/admin/disputes/dispute-detail-sections"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAdminDisputeQuery } from "@/hooks/api/use-admin-disputes-query"
import type { AdminDisputeAction } from "@/lib/api/admin"
import { adminDisputeStatusMeta } from "@/lib/admin-display"
import { PageFrame, PageHeader, PageSurface } from "@/components/layout"

const sections = [
  ["overview", "Обзор"],
  ["buyer-statement", "Заявление покупателя"],
  ["supplier-statement", "Заявление поставщика"],
  ["evidence", "Доказательства"],
  ["files", "Файлы"],
  ["chat", "Чат"],
  ["escrow", "Escrow"],
  ["timeline", "Хронология"],
] as const

const DetailSkeleton = () => (
  <PageFrame className="animate-pulse space-y-5">
    <div className="h-5 w-36 rounded bg-muted" />
    <div className="h-56 rounded-xl bg-muted" />
    <div className="h-14 rounded-xl bg-muted" />
    <div className="h-80 rounded-xl bg-muted" />
  </PageFrame>
)

const formatMoney = (value: number, currency: string) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency || "TJS",
    maximumFractionDigits: 0,
  }).format(value)

type PageProps = {
  params: Promise<{ id: string }>
}

export default function AdminDisputeDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const disputeId = Number(id)
  const disputeQuery = useAdminDisputeQuery(disputeId)
  const [selectedAction, setSelectedAction] = useState<AdminDisputeAction | null>(null)

  if (!Number.isInteger(disputeId) || disputeId <= 0) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-8 text-center">
        <h1 className="text-xl font-bold">Некорректный ID спора</h1>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/admin/disputes">Вернуться к спорам</Link>
        </Button>
      </div>
    )
  }

  if (disputeQuery.isLoading) return <DetailSkeleton />

  if (disputeQuery.isError || !disputeQuery.data) {
    return (
      <div className="mx-auto flex min-h-[55dvh] max-w-lg items-center justify-center">
        <div className="w-full rounded-xl border border-border bg-card p-8 text-center">
          <Gavel className="mx-auto text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold">Спор не найден</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Запись удалена, недоступна или API временно не отвечает.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/disputes">К списку</Link>
            </Button>
            <Button type="button" onClick={() => disputeQuery.refetch()}>
              <RefreshCcw aria-hidden="true" />
              Повторить
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const dispute = disputeQuery.data
  const statusMeta = adminDisputeStatusMeta[dispute.status] || {
    label: dispute.status,
    className: "bg-muted text-muted-foreground",
  }
  const isResolved = dispute.status === "resolved"
  const buyerName =
    dispute.buyer?.company_title ||
    dispute.buyer?.name ||
    dispute.buyer?.display_name ||
    "Без покупателя"
  const supplierName =
    dispute.supplier?.company_title ||
    dispute.supplier?.name ||
    dispute.supplier?.display_name ||
    "Без поставщика"

  return (
    <PageFrame>
      <PageHeader
        title={dispute.contract.title}
        description={
          <>
            {buyerName} → {supplierName}
            {" · "}
            {formatMoney(dispute.contract.agreed_amount, dispute.contract.currency)}
          </>
        }
        backHref="/admin/disputes"
        backLabel="Все споры"
      />
      <PageSurface className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Спор · #{dispute.id}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className={statusMeta.className}>
                {statusMeta.label}
              </Badge>
              <Badge variant="outline">
                Escrow:{" "}
                {formatMoney(
                  dispute.escrow.held + dispute.escrow.disputed,
                  dispute.escrow.currency,
                )}
              </Badge>
            </div>
          </div>

          {!isResolved && (
            <div className="flex flex-wrap gap-2 xl:max-w-xl xl:justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedAction("release_funds")}
              >
                <Banknote aria-hidden="true" />
                Выплатить
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedAction("refund_buyer")}
              >
                <Undo2 aria-hidden="true" />
                Вернуть покупателю
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedAction("partial_refund")}
              >
                <CheckCircle2 aria-hidden="true" />
                Частичный возврат
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedAction("request_evidence")}
              >
                <FileSearch aria-hidden="true" />
                Запросить доказательства
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedAction("close_case")}
              >
                <XCircle aria-hidden="true" />
                Закрыть дело
              </Button>
            </div>
          )}
        </div>
      </PageSurface>

      <nav
        className="flex gap-2 overflow-x-auto rounded-xl border border-border bg-card p-2"
        aria-label="Секции спора"
      >
        {sections.map(([sectionId, label]) => (
          <a
            key={sectionId}
            href={`#${sectionId}`}
            className="shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {label}
          </a>
        ))}
      </nav>

      <AdminDisputeDetailSections dispute={dispute} />

      <DisputeActionDialog
        disputeId={dispute.id}
        contractTitle={dispute.contract.title}
        action={selectedAction}
        onOpenChange={(open) => {
          if (!open) setSelectedAction(null)
        }}
      />
    </PageFrame>
  )
}
