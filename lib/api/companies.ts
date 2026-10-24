import { buildPageQuery, type Page, type PageParams } from "@/lib/pagination"
import type {
  CompanyCertificate,
  CompanyUser,
  CompanyWizardInput,
  CompanyWithRelations,
  Review,
} from "@/types"
import { apiFetch } from "./client"

export type TeamMemberPayload = { email: string; role: string }
export type TeamMemberUpdatePayload = { role: string }
export type CertificateCreatePayload = {
  title: string
  issuer: string
  issue_date: string
  expiry_date?: string | null
  file_url: string
}
export type CertificateUpdatePayload = {
  title?: string | null
  issuer?: string | null
  issue_date?: string | null
  expiry_date?: string | null
  file_url?: string | null
}

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
  mine: (params: PageParams = {}) =>
    apiFetch<Page<CompanyWithRelations>>(`${PREFIX}/me${buildPageQuery(params)}`),

  get: (companyId: number) =>
    apiFetch<CompanyWithRelations>(`${PREFIX}/${companyId}`),

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

  uploadLogo: (file: File) => {
    const form = new FormData()
    form.append("file", file)
    return apiFetch<{ logo: string }>(`${PREFIX}/logo`, {
      method: "POST",
      body: form,
    })
  },

  addTeamMember: (companyId: number, data: TeamMemberPayload) =>
    apiFetch<{ id: number }>(`${PREFIX}/${companyId}/team`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateTeamMember: (
    companyId: number,
    targetUserId: number,
    data: TeamMemberUpdatePayload,
  ) =>
    apiFetch<CompanyUser>(`${PREFIX}/${companyId}/team/${targetUserId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  removeTeamMember: (companyId: number, targetUserId: number) =>
    apiFetch<void>(`${PREFIX}/${companyId}/team/${targetUserId}`, {
      method: "DELETE",
    }),

  uploadCertificateFile: (file: File) => {
    const form = new FormData()
    form.append("file", file)
    return apiFetch<{ file_url: string }>(`${PREFIX}/certificates/upload`, {
      method: "POST",
      body: form,
    })
  },

  addCertificate: (companyId: number, data: CertificateCreatePayload) =>
    apiFetch<{ id: number }>(`${PREFIX}/${companyId}/certificates`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCertificate: (
    companyId: number,
    certificateId: number,
    data: CertificateUpdatePayload,
  ) =>
    apiFetch<CompanyCertificate>(
      `${PREFIX}/${companyId}/certificates/${certificateId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    ),

  removeCertificate: (companyId: number, certificateId: number) =>
    apiFetch<void>(`${PREFIX}/${companyId}/certificates/${certificateId}`, {
      method: "DELETE",
    }),
}

export const companiesApi = {
  mine: (params?: PageParams) => buyerCompaniesApi.mine(params),

  get: (id: number) => apiFetch<CompanyWithRelations>(`/public/companies/${id}`),

  suppliers: (q?: string, category?: string, params: PageParams = {}) =>
    apiFetch<Page<CompanyWithRelations>>(
      `/public/suppliers${buildPageQuery({ ...params, q, category })}`,
    ),
}

export const reviewsApi = {
  listGiven: (params: PageParams = {}) =>
    apiFetch<Page<Review>>(`/buyer/reviews/${buildPageQuery(params)}`),

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
