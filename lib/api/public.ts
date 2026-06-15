import { apiFetch } from "./client"

export type CategoryTree = {
  id: number
  name: string
  slug: string
  children?: CategoryTree[]
}

export const publicApi = {
  categories: () => apiFetch<CategoryTree[]>("/public/categories"),

  suppliers: (q?: string, category?: string) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (category) params.set("category", category)
    const qs = params.toString()
    return apiFetch<unknown[]>(`/public/suppliers${qs ? `?${qs}` : ""}`)
  },

  company: (id: number) => apiFetch<unknown>(`/public/companies/${id}`),

  companyReviews: (id: number) => apiFetch<unknown[]>(`/public/companies/${id}/reviews`),
}
