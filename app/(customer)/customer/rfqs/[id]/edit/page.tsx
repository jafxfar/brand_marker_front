"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RfqForm } from "@/components/cabinet/rfq/rfq-form"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import type { RfqCreate, RfqUpdate } from "@/types"

type PageProps = {
  params: Promise<{ id: string }>
}

export default function EditRfqPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const hydrated = useHydrated()
  const actorId = getActorId(useAuthStore((s) => s.user))
  const getRfqWithRelations = useRfqsStore((s) => s.getRfqWithRelations)
  const updateRfq = useRfqsStore((s) => s.updateRfq)
  const publishRfq = useRfqsStore((s) => s.publishRfq)
  const addAttachment = useRfqsStore((s) => s.addAttachment)
  const removeAttachment = useRfqsStore((s) => s.removeAttachment)

  const rfq = hydrated ? getRfqWithRelations(id) : undefined

  if (!hydrated) {
    return (
      <div className="max-w-[820px] mx-auto animate-pulse h-96 bg-secondary rounded-2xl" />
    )
  }

  if (!rfq || rfq.actor_id !== String(actorId)) {
    return (
      <div className="max-w-[820px] mx-auto text-center py-16">
        <p className="text-sm font-semibold text-foreground">RFQ не найден</p>
        <Link href="/customer/rfqs" className="text-sm text-primary hover:underline mt-2 inline-block">
          К списку RFQ
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
          К RFQ
        </Link>
      </div>
    )
  }

  const applyUpdate = (input: RfqCreate) => {
    const patch: RfqUpdate = { ...input }
    updateRfq(id, patch)
  }

  return (
    <RfqForm
      initial={rfq}
      cancelHref={`/customer/rfqs/${id}`}
      onSaveDraft={(input) => {
        applyUpdate(input)
        router.push(`/customer/rfqs/${id}`)
      }}
      onPublish={(input) => {
        applyUpdate(input)
        publishRfq(id)
        router.push(`/customer/rfqs/${id}`)
      }}
      onAddAttachment={(file) => {
        addAttachment(id, {
          file_name: file.name,
          file_url: URL.createObjectURL(file),
          file_type: file.type || "application/octet-stream",
        })
      }}
      onRemoveAttachment={(attachmentId) => removeAttachment(id, attachmentId)}
    />
  )
}
