import type { CompanyWizardInput, CompanyWithRelations } from "@/types"
import { apiFetch } from "../client"

const PREFIX = "/supplier/companies"

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

export const supplierCompaniesApi = {
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

  addCertificate: (
    companyId: number,
    data: { title: string; issuer: string; issue_date: string; expiry_date?: string; file_url: string },
  ) =>
    apiFetch<{ id: number }>(`${PREFIX}/${companyId}/certificates`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  addTeamMember: (companyId: number, data: { email: string; role: string }) =>
    apiFetch<{ id: number }>(`${PREFIX}/${companyId}/team`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  removeTeamMember: (companyId: number, targetUserId: number) =>
    apiFetch<void>(`${PREFIX}/${companyId}/team/${targetUserId}`, { method: "DELETE" }),
}
