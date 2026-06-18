import type { CompanyWizardInput, CompanyWithRelations, Review } from "@/types"
import { apiFetch } from "./client"

const PREFIX = "/buyer/companies"

type CompanyUpdatePayload = {
  title?: string
  legal_name?: string | null
  tax_number?: string | null
  website?: string | null
  description?: string | null
  logo?: string | null
  country?: string | null
  city?: string | null
  address?: string | null
  founded_year?: number | null
  employees_count?: number | null
  annual_revenue_range?: string | null
  languages?: string[]
  industries?: string[]
  category_ids?: number[]
  actor_types?: string[]
}

const wizardToUpdate = (data: CompanyWizardInput): CompanyUpdatePayload => ({
  title: data.title,
  legal_name: data.legal_name || null,
  tax_number: data.tax_number || null,
  website: data.website || null,
  description: data.description || null,
  logo: data.logo || null,
  country: data.country || null,
  city: data.city || null,
  address: data.address || null,
  founded_year: data.founded_year ? Number(data.founded_year) : null,
  employees_count: data.employees_count ? Number(data.employees_count) : null,
  annual_revenue_range: data.annual_revenue_range || null,
  languages: data.languages,
  industries: data.industries,
  category_ids: data.category_ids,
  actor_types: data.actor_types,
})

export const buyerCompaniesApi = {
  mine: () => apiFetch<CompanyWithRelations[]>(`${PREFIX}/me`),

  create: (data: CompanyWizardInput) =>
    apiFetch<CompanyWithRelations>(`${PREFIX}/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (companyId: number, data: CompanyWizardInput) =>
    apiFetch<CompanyWithRelations>(`${PREFIX}/${companyId}`, {
      method: "PATCH",
      body: JSON.stringify(wizardToUpdate(data)),
    }),
}

export const companiesApi = {
  mine: () => buyerCompaniesApi.mine(),

  get: (id: number) => apiFetch<CompanyWithRelations>(`/public/companies/${id}`),

  suppliers: (q?: string, category?: string) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (category) params.set("category", category)
    const qs = params.toString()
    return apiFetch<CompanyWithRelations[]>(
      `/public/suppliers${qs ? `?${qs}` : ""}`,
    )
  },
}

export const reviewsApi = {
  listGiven: () => apiFetch<Review[]>("/buyer/reviews/"),

  create: (data: {
    contract_id: number
    target_actor_id: number
    rating: number
    comment?: string | null
  }) =>
    apiFetch<Review>("/buyer/reviews/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}
