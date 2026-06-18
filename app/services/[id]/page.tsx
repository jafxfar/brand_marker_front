import { notFound } from "next/navigation"
import { ServiceDetailContent } from "./service-detail-content"

type ServiceDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { id } = await params
  const serviceId = Number(id)
  if (Number.isNaN(serviceId)) notFound()

  return <ServiceDetailContent serviceId={serviceId} />
}
