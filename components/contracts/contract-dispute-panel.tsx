"use client"

import { AlertTriangle, FileText } from "lucide-react"
import { FilePreviewLink } from "@/components/shared/file-preview-link"
import { formatIsoDate } from "@/lib/format"
import type { ContractDispute, DisputeStatus } from "@/types"

const disputeStatusLabel: Record<DisputeStatus, string> = {
  open: "Открыт",
  under_review: "На рассмотрении — запрошены доказательства",
  resolved: "Закрыт",
  appealed: "Апелляция",
}

type ContractDisputePanelProps = {
  dispute: ContractDispute
}

export const ContractDisputePanel = ({ dispute }: ContractDisputePanelProps) => {
  const statusLabel = disputeStatusLabel[dispute.status] || dispute.status
  const showInstructions =
    Boolean(dispute.admin_instructions?.trim()) ||
    dispute.status === "under_review"

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
            <AlertTriangle size={18} className="text-destructive" aria-hidden="true" />
          </span>
          <div className="min-w-0 space-y-1">
            <h2 className="text-sm font-semibold text-foreground">Спор #{dispute.id}</h2>
            <p className="text-sm text-destructive font-medium">{statusLabel}</p>
            <p className="text-xs text-muted-foreground">
              Открыт {formatIsoDate(dispute.created_at.split("T")[0] ?? dispute.created_at)}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Закрыть спор может только администратор. До решения статус контракта остаётся «Спор».
        </p>
      </div>

      {showInstructions && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Инструкции администратора
          </h3>
          {dispute.admin_instructions?.trim() ? (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {dispute.admin_instructions}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Администратор запросил дополнительные доказательства. Следуйте уведомлению и
              подготовьте материалы по спору.
            </p>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Заявления сторон</h3>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Покупатель</p>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {dispute.buyer_statement?.trim() || "Заявление не предоставлено"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Исполнитель</p>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {dispute.supplier_statement?.trim() || "Заявление не предоставлено"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Доказательства</h3>
        {dispute.evidence.length === 0 ? (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <FileText size={14} aria-hidden="true" />
            Пока нет загруженных файлов
          </p>
        ) : (
          <ul className="space-y-2">
            {dispute.evidence.map((item) => (
              <li key={item.id}>
                <FilePreviewLink
                  url={item.file_url}
                  fileName={item.file_name}
                  fileType={item.file_type}
                />
                {item.note ? (
                  <p className="text-xs text-muted-foreground mt-1 px-1">{item.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
