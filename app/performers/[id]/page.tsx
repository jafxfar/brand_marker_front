import { notFound } from "next/navigation"
import { PerformerDetailContent } from "./performer-detail-content"

type PerformerDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function PerformerDetailPage({ params }: PerformerDetailPageProps) {
  const { id } = await params
  const performerId = Number(id)
  if (Number.isNaN(performerId)) notFound()

  return <PerformerDetailContent performerId={performerId} />
}
