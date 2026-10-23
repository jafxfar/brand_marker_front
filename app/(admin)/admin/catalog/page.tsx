import { redirect } from "next/navigation"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>
}

export default async function AdminCatalogRedirectPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams ?? {})
  const next = new URLSearchParams()
  next.set("tab", "catalog")
  const view = Array.isArray(params.view) ? params.view[0] : params.view
  const status = Array.isArray(params.status) ? params.status[0] : params.status
  const query = Array.isArray(params.query) ? params.query[0] : params.query
  const page = Array.isArray(params.page) ? params.page[0] : params.page
  if (view) next.set("view", view)
  else if (status) next.set("view", status)
  if (query) next.set("query", query)
  if (page) next.set("page", page)
  redirect(`/admin/moderation?${next.toString()}`)
}
