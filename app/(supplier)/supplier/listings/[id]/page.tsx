import { redirect } from "next/navigation"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditListingRedirectPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/supplier/catalog/${id}`)
}
