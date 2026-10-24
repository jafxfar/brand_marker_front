import { Suspense } from "react"
import { notFound } from "next/navigation"
import { PerformerDetailContent } from "./performer-detail-content"

type PerformerDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function PerformerDetailPage({
  params,
}: PerformerDetailPageProps) {
  const { id } = await params
  const performerId = Number(id)
  if (Number.isNaN(performerId)) notFound()

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1120px] animate-pulse px-6 py-16">
          <div className="h-48 rounded-2xl bg-secondary" />
        </div>
      }
    >
      <PerformerDetailContent performerId={performerId} />
    </Suspense>
  )
}
