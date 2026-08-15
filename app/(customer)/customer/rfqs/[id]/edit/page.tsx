"use client"

import { use, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { PageFrame, PageHeader } from "@/components/layout"
import { RfqForm } from "@/components/cabinet/rfq/rfq-form"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import {
  usePublishRfqMutation,
  useRfqQuery,
  useUpdateRfqMutation,
  useUploadRfqAttachmentMutation,
  useDeleteRfqAttachmentMutation,
} from "@/hooks/api/use-rfqs-query"
import type { RfqCreate, RfqUpdate, RfqWithRelations } from "@/types"

type PageProps = {
  params: Promise<{ id: string }>
}

export default function EditRfqPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const hydrated = useHydrated()
  const actorId = getActorId(useAuthStore((s) => s.user))
  const useApi = isApiEnabled()

  const getRfqWithRelations = useRfqsStore((s) => s.getRfqWithRelations)
  const updateRfqLocal = useRfqsStore((s) => s.updateRfq)
  const publishRfqLocal = useRfqsStore((s) => s.publishRfq)
  const addAttachmentLocal = useRfqsStore((s) => s.addAttachment)
  const removeAttachmentLocal = useRfqsStore((s) => s.removeAttachment)

  const { data: apiRfq, isLoading } = useRfqQuery(id, hydrated && useApi)
  const updateMutation = useUpdateRfqMutation()
  const publishMutation = usePublishRfqMutation()
  const uploadMutation = useUploadRfqAttachmentMutation()
  const deleteAttachmentMutation = useDeleteRfqAttachmentMutation()
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const localRfq = hydrated ? getRfqWithRelations(id) : undefined
  const rfq: RfqWithRelations | undefined = useApi ? apiRfq : localRfq

  if (!hydrated || (useApi && isLoading)) {
    return (
      <PageFrame className="animate-pulse">
        <div className="h-96 rounded-xl bg-secondary" />
      </PageFrame>
    )
  }

  if (!rfq || rfq.actor_id !== String(actorId)) {
    return (
      <PageFrame>
        <PageHeader
          title="Заявка не найдена"
          backHref="/customer/rfqs"
          backLabel="К списку заявок"
        />
      </PageFrame>
    )
  }

  if (rfq.status !== "draft") {
    return (
      <PageFrame>
        <PageHeader
          title="Редактирование недоступно"
          description="Только черновики можно изменять"
          backHref={`/customer/rfqs/${rfq.id}`}
          backLabel="К заявке"
        />
      </PageFrame>
    )
  }

  const applyUpdateLocal = (input: RfqCreate) => {
    const patch: RfqUpdate = { ...input }
    updateRfqLocal(id, patch)
  }

  const applyUpdateApi = async (input: RfqCreate, publish: boolean) => {
    try {
      const patch: RfqUpdate = { ...input }
      await updateMutation.mutateAsync({ id, data: patch })
      if (publish) {
        await publishMutation.mutateAsync(id)
      }
      router.push(`/customer/rfqs/${id}`)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const handleSubmit = (input: RfqCreate, publish: boolean) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)

    if (useApi) {
      void applyUpdateApi(input, publish)
      return
    }
    applyUpdateLocal(input)
    if (publish) {
      publishRfqLocal(id)
    }
    router.push(`/customer/rfqs/${id}`)
    submittingRef.current = false
    setSubmitting(false)
  }

  return (
    <RfqForm
      initial={rfq}
      cancelHref={`/customer/rfqs/${id}`}
      isSubmitting={submitting}
      onSaveDraft={(input) => handleSubmit(input, false)}
      onPublish={(input) => handleSubmit(input, true)}
      onAddAttachment={(file) => {
        if (useApi) {
          uploadMutation.mutate({ id, file })
          return
        }
        addAttachmentLocal(id, {
          file_name: file.name,
          file_url: URL.createObjectURL(file),
          file_type: file.type || "application/octet-stream",
        })
      }}
      onRemoveAttachment={(attachmentId) => {
        if (useApi) {
          deleteAttachmentMutation.mutate({ id, attachmentId })
          return
        }
        removeAttachmentLocal(id, attachmentId)
      }}
    />
  )
}
