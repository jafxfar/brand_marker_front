"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { CompanyConfirmDialog } from "@/components/admin/companies/company-confirm-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAdminCompanyVerificationStatusMutation } from "@/hooks/api/use-admin-companies-query"
import type { AdminCompanyDetail, AdminCompanyVerificationStatus } from "@/lib/api/admin"

export const VERIFICATION_STATUS_LABELS: Record<AdminCompanyVerificationStatus, string> = {
  verified: "Проверено",
  pending: "На проверке",
  needs_documents: "Нужны документы",
  rejected: "Отклонено",
}

type CompanyVerificationDialogProps = {
  company: AdminCompanyDetail
  status: AdminCompanyVerificationStatus | null
  onOpenChange: (open: boolean) => void
}

export const CompanyVerificationDialog = ({
  company,
  status,
  onOpenChange,
}: CompanyVerificationDialogProps) => {
  const [reason, setReason] = useState("")
  const mutation = useAdminCompanyVerificationStatusMutation()
  const revoking = company.verification_status === "verified" && status !== "verified"
  const reasonRequired = status !== null && status !== "verified"

  useEffect(() => {
    if (!status) setReason("")
  }, [status])

  const handleConfirm = async () => {
    if (!status) return
    if (reasonRequired && !reason.trim()) {
      toast.error("Укажите причину")
      return
    }
    try {
      await mutation.mutateAsync({ companyId: company.id, status, reason })
      toast.success(`Статус проверки: ${VERIFICATION_STATUS_LABELS[status]}`)
      onOpenChange(false)
    } catch {
      // MutationCache toast
    }
  }

  return (
    <CompanyConfirmDialog
      open={Boolean(status)}
      onOpenChange={onOpenChange}
      title={
        revoking
          ? "Снять отметку «Проверено»?"
          : `Установить статус «${status ? VERIFICATION_STATUS_LABELS[status] : ""}»?`
      }
      description={
        revoking
          ? `Компания «${company.title}» потеряет статус проверенной, уровень доверия её акторов будет понижен. Владелец получит уведомление.`
          : `Статус проверки компании «${company.title}» будет изменён вручную. Владелец получит уведомление.`
      }
      confirmLabel={revoking ? "Снять проверку" : "Применить"}
      destructive={revoking || status === "rejected"}
      pending={mutation.isPending}
      confirmDisabled={reasonRequired && !reason.trim()}
      onConfirm={() => void handleConfirm()}
    >
      <div className="space-y-2">
        <Label htmlFor="company-verification-reason" className="text-sm font-semibold">
          Причина {reasonRequired && <span className="text-destructive">*</span>}
        </Label>
        <Textarea
          id="company-verification-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Для владельца и журнала аудита"
        />
      </div>
    </CompanyConfirmDialog>
  )
}
