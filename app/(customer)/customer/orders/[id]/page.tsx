import { redirect } from "next/navigation"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function OrderDetailRedirectPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/customer/rfqs/${id}`)
}
