import { redirect } from "next/navigation"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProposalsReviewRedirectPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/customer/rfqs/${id}`)
}
