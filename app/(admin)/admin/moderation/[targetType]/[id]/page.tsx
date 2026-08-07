"use client"

import { use } from "react"
import { useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  RefreshCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react"
import { ReportActionDialog } from "@/components/admin/moderation/report-action-dialog"
import { AdminReportDetailSections } from "@/components/admin/moderation/report-detail-sections"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAdminReportQuery } from "@/hooks/api/use-admin-reports-query"
import type { AdminReportAction, AdminReportTargetType } from "@/lib/api/admin"
import {
  adminLabel,
  adminReportReasonLabels,
  adminReportStatusLabels,
  adminReportTargetLabels,
} from "@/lib/admin-display"

const sections = [
  ["reporter", "Reporter"],
  ["reported-object", "Reported Object"],
  ["evidence", "Evidence"],
  ["history", "History"],
] as const

const DetailSkeleton = () => (
  <div className="mx-auto max-w-350 animate-pulse space-y-5">
    <div className="h-5 w-36 rounded bg-muted" />
    <div className="h-56 rounded-2xl bg-muted" />
    <div className="h-14 rounded-2xl bg-muted" />
    <div className="h-80 rounded-2xl bg-muted" />
  </div>
)

const isTargetType = (value: string): value is AdminReportTargetType =>
  value === "catalog" || value === "rfq" || value === "proposal"

type PageProps = {
  params: Promise<{ targetType: string; id: string }>
}

export default function AdminReportDetailPage({ params }: PageProps) {
  const { targetType: rawTargetType, id } = use(params)
  const reportId = Number(id)
  const targetType = isTargetType(rawTargetType) ? rawTargetType : ""
  const reportQuery = useAdminReportQuery(targetType, reportId)
  const [selectedAction, setSelectedAction] = useState<AdminReportAction | null>(
    null,
  )

  if (!isTargetType(rawTargetType) || !Number.isInteger(reportId) || reportId <= 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-white p-8 text-center">
        <h1 className="text-xl font-black">Некорректный ID жалобы</h1>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/admin/moderation">Вернуться к жалобам</Link>
        </Button>
      </div>
    )
  }

  if (reportQuery.isLoading) return <DetailSkeleton />

  if (reportQuery.isError || !reportQuery.data) {
    return (
      <div className="mx-auto flex min-h-[55dvh] max-w-lg items-center justify-center">
        <div className="w-full rounded-2xl border border-border bg-white p-8 text-center">
          <ShieldCheck className="mx-auto text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-black">Жалоба не найдена</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Запись удалена, недоступна или API временно не отвечает.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/moderation">К списку</Link>
            </Button>
            <Button type="button" onClick={() => reportQuery.refetch()}>
              <RefreshCcw aria-hidden="true" />
              Повторить
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const report = reportQuery.data
  const isOpen = report.status === "open"

  return (
    <div className="mx-auto max-w-350 space-y-5">
      <Link
        href="/admin/moderation"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Все жалобы
      </Link>

      <header className="rounded-2xl border border-border bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Report · {adminLabel(adminReportTargetLabels, report.target_type)} · #
              {report.id}
            </p>
            <h1 className="mt-1 truncate text-2xl font-black tracking-tight sm:text-3xl">
              {report.reported_object.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {report.reporter.name || report.reporter.email}
              {" · "}
              {adminLabel(adminReportReasonLabels, report.reason)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline">
                {adminLabel(adminReportStatusLabels, report.status)}
              </Badge>
              <Badge variant="outline">
                {adminLabel(adminReportReasonLabels, report.reason)}
              </Badge>
            </div>
          </div>

          {isOpen && (
            <div className="flex flex-wrap gap-2 xl:max-w-xl xl:justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedAction("dismiss")}
              >
                <CheckCircle2 aria-hidden="true" />
                Dismiss
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedAction("warn")}
              >
                <AlertTriangle aria-hidden="true" />
                Warn
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedAction("suspend")}
              >
                <Ban aria-hidden="true" />
                Suspend
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedAction("delete")}
              >
                <Trash2 aria-hidden="true" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <nav
          className="mt-6 flex gap-2 overflow-x-auto border-t border-border pt-4"
          aria-label="Секции жалобы"
        >
          {sections.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="shrink-0 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <AdminReportDetailSections report={report} />

      <ReportActionDialog
        targetType={report.target_type}
        reportId={report.id}
        objectTitle={report.reported_object.title}
        action={selectedAction}
        onOpenChange={(open) => {
          if (!open) setSelectedAction(null)
        }}
      />
    </div>
  )
}
