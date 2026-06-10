"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { RfqForm } from "@/components/cabinet/rfq/rfq-form"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useNotificationsStore } from "@/lib/store/notifications-store"
import { getActorId } from "@/lib/auth-display"
import type { RfqCreate } from "@/types"

type PendingFile = {
  id: string
  file_name: string
  file_url: string
  file_type: string
}

export default function NewRfqPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supplierIdParam = searchParams.get("supplierId")
  const invitedSupplierId = supplierIdParam ? Number(supplierIdParam) : undefined

  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const createRfq = useRfqsStore((s) => s.createRfq)
  const publishRfq = useRfqsStore((s) => s.publishRfq)
  const inviteSupplierToRfq = useRfqsStore((s) => s.inviteSupplierToRfq)
  const addAttachment = useRfqsStore((s) => s.addAttachment)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const notify = useNotificationsStore((s) => s.add)
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])

  const invitedSupplier = invitedSupplierId ? getCompany(invitedSupplierId) : undefined

  const buildInput = (input: RfqCreate): RfqCreate => {
    if (!invitedSupplierId) return input
    return {
      ...input,
      visibility: "invited_only",
      invited_supplier_ids: [invitedSupplierId],
    }
  }

  const handleCreate = (input: RfqCreate, publish: boolean) => {
    if (!user) return
    const payload = buildInput(input)
    const rfq = createRfq(payload, actorId, user.id)
    for (const file of pendingFiles) {
      addAttachment(rfq.id, file)
    }
    if (invitedSupplierId) {
      inviteSupplierToRfq(rfq.id, invitedSupplierId)
    }
    if (publish) {
      publishRfq(rfq.id)
      notify({
        type: "order",
        title: "RFQ опубликован",
        body: invitedSupplier
          ? `Запрос «${rfq.title}» отправлен поставщику «${invitedSupplier.title}».`
          : `Запрос «${rfq.title}» доступен поставщикам на маркетплейсе.`,
        href: `/customer/rfqs/${rfq.id}`,
      })
    } else {
      notify({
        type: "order",
        title: "Черновик сохранён",
        body: `RFQ «${rfq.title}» можно опубликовать позже.`,
        href: `/customer/rfqs/${rfq.id}/edit`,
      })
    }
    router.push(`/customer/rfqs/${rfq.id}`)
  }

  return (
    <RfqForm
      cancelHref="/customer/rfqs"
      invitedSupplierId={invitedSupplierId}
      invitedSupplierName={invitedSupplier?.title}
      pendingAttachments={pendingFiles.map((f) => ({ id: f.id, file_name: f.file_name }))}
      onSaveDraft={(input) => handleCreate(input, false)}
      onPublish={(input) => handleCreate(input, true)}
      onAddAttachment={(file) => {
        setPendingFiles((prev) => [
          ...prev,
          {
            id: `pending-${Date.now()}`,
            file_name: file.name,
            file_url: URL.createObjectURL(file),
            file_type: file.type || "application/octet-stream",
          },
        ])
      }}
      onRemovePendingAttachment={(id) => {
        setPendingFiles((prev) => prev.filter((f) => f.id !== id))
      }}
    />
  )
}
