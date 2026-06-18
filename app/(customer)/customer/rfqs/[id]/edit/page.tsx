"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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

  const localRfq = hydrated ? getRfqWithRelations(id) : undefined
  const rfq: RfqWithRelations | undefined = useApi ? apiRfq : localRfq

  if (!hydrated || (useApi && isLoading)) {
    return (
      <div className="max-w-[820px] mx-auto animate-pulse h-96 bg-secondary rounded-2xl" />
    )
  }

  if (!rfq || rfq.actor_id !== String(actorId)) {
    return (
      <div className="max-w-[820px] mx-auto text-center py-16">
        <p className="text-sm font-semibold text-foreground">Заявка не найдена</p>
        <Link href="/customer/rfqs" className="text-sm text-primary hover:underline mt-2 inline-block">
          К списку заявок
        </Link>
      </div>
    )
  }

  if (rfq.status !== "draft") {
    return (
      <div className="max-w-[820px] mx-auto text-center py-16">
        <p className="text-sm font-semibold text-foreground">Редактирование недоступно</p>
        <p className="text-xs text-muted-foreground mt-1">Только черновики можно изменять</p>
        <Link href={`/customer/rfqs/${rfq.id}`} className="text-sm text-primary hover:underline mt-3 inline-block">
          К заявке
        </Link>
      </div>
    )
  }

  const applyUpdateLocal = (input: RfqCreate) => {
    const patch: RfqUpdate = { ...input }
    updateRfqLocal(id, patch)
  }

  const applyUpdateApi = async (input: RfqCreate, publish: boolean) => {
    const patch: RfqUpdate = { ...input }
    await updateMutation.mutateAsync({ id, data: patch })
    if (publish) {
      await publishMutation.mutateAsync(id)
    }
    router.push(`/customer/rfqs/${id}`)
  }

  return (
    <RfqForm
      initial={rfq}
      cancelHref={`/customer/rfqs/${id}`}
      onSaveDraft={(input) => {
        if (useApi) {
          void applyUpdateApi(input, false)
          return
        }
        applyUpdateLocal(input)
        router.push(`/customer/rfqs/${id}`)
      }}
      onPublish={(input) => {
        if (useApi) {
          void applyUpdateApi(input, true)
          return
        }
        applyUpdateLocal(input)
        publishRfqLocal(id)
        router.push(`/customer/rfqs/${id}`)
      }}
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
