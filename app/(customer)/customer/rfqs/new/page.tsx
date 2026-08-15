"use client"

import { useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { RfqForm } from "@/components/cabinet/rfq/rfq-form"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useNotificationsStore } from "@/lib/store/notifications-store"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import {
  useCreateRfqMutation,
  useInviteSuppliersMutation,
  usePublishRfqMutation,
  useUploadRfqAttachmentMutation,
} from "@/hooks/api/use-rfqs-query"
import type { RfqCreate } from "@/types"

type PendingFile = {
  id: string
  file: File
  file_name: string
}

export default function NewRfqPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supplierIdParam = searchParams.get("supplierId")
  const invitedSupplierId = supplierIdParam ? Number(supplierIdParam) : undefined

  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const createRfqLocal = useRfqsStore((s) => s.createRfq)
  const publishRfqLocal = useRfqsStore((s) => s.publishRfq)
  const inviteSupplierToRfqLocal = useRfqsStore((s) => s.inviteSupplierToRfq)
  const addAttachmentLocal = useRfqsStore((s) => s.addAttachment)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const notify = useNotificationsStore((s) => s.add)
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const useApi = isApiEnabled()
  const createMutation = useCreateRfqMutation()
  const publishMutation = usePublishRfqMutation()
  const inviteMutation = useInviteSuppliersMutation()
  const uploadMutation = useUploadRfqAttachmentMutation()

  const invitedSupplier = invitedSupplierId ? getCompany(invitedSupplierId) : undefined

  const buildInput = (input: RfqCreate): RfqCreate => {
    if (!invitedSupplierId) return input
    return {
      ...input,
      visibility: "invited_only",
      invited_supplier_ids: [invitedSupplierId],
    }
  }

  const handleCreateLocal = (input: RfqCreate, publish: boolean) => {
    if (!user) return
    const payload = buildInput(input)
    const rfq = createRfqLocal(payload, actorId, user.id)
    for (const file of pendingFiles) {
      addAttachmentLocal(rfq.id, {
        file_name: file.file_name,
        file_url: URL.createObjectURL(file.file),
        file_type: file.file.type || "application/octet-stream",
      })
    }
    if (invitedSupplierId) {
      inviteSupplierToRfqLocal(rfq.id, invitedSupplierId)
    }
    if (publish) {
      publishRfqLocal(rfq.id)
      notify({
        type: "order",
        title: "Заявка опубликована",
        body: invitedSupplier
          ? `Запрос «${rfq.title}» отправлен поставщику «${invitedSupplier.title}».`
          : `Запрос «${rfq.title}» доступен поставщикам на маркетплейсе.`,
        href: `/customer/rfqs/${rfq.id}`,
      })
    } else {
      notify({
        type: "order",
        title: "Черновик сохранён",
        body: `Заявку «${rfq.title}» можно опубликовать позже.`,
        href: `/customer/rfqs/${rfq.id}/edit`,
      })
    }
    router.push(`/customer/rfqs/${rfq.id}`)
  }

  const handleCreateApi = async (input: RfqCreate, publish: boolean) => {
    if (!user) {
      submittingRef.current = false
      setSubmitting(false)
      return
    }
    setError(null)
    try {
      const payload = buildInput(input)
      let rfq = await createMutation.mutateAsync(payload)

      for (const pending of pendingFiles) {
        rfq = await uploadMutation.mutateAsync({ id: rfq.id, file: pending.file })
      }

      if (invitedSupplierId) {
        rfq = await inviteMutation.mutateAsync({
          id: rfq.id,
          supplierIds: [invitedSupplierId],
        })
      }

      if (publish) {
        rfq = await publishMutation.mutateAsync(rfq.id)
      }

      router.push(`/customer/rfqs/${rfq.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать заявку")
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const handleCreate = (input: RfqCreate, publish: boolean) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)

    if (useApi) {
      void handleCreateApi(input, publish)
      return
    }
    handleCreateLocal(input, publish)
    submittingRef.current = false
    setSubmitting(false)
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <RfqForm
        cancelHref="/customer/rfqs"
        invitedSupplierId={invitedSupplierId}
        invitedSupplierName={invitedSupplier?.title}
        pendingAttachments={pendingFiles.map((f) => ({ id: f.id, file_name: f.file_name }))}
        isSubmitting={submitting}
        onSaveDraft={(input) => handleCreate(input, false)}
        onPublish={(input) => handleCreate(input, true)}
        onAddAttachment={(file) => {
          setPendingFiles((prev) => [
            ...prev,
            {
              id: `pending-${Date.now()}`,
              file,
              file_name: file.name,
            },
          ])
        }}
        onRemovePendingAttachment={(id) => {
          setPendingFiles((prev) => prev.filter((f) => f.id !== id))
        }}
      />
    </div>
  )
}
