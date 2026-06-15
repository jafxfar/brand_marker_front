import type { CompanyWithRelations } from "@/types"
import { apiFetch } from "./client"

export const companiesApi = {
  mine: () => apiFetch<CompanyWithRelations[]>("/buyer/companies/me"),

  get: (id: number) => apiFetch<CompanyWithRelations>(`/public/companies/${id}`),

  suppliers: (q?: string) =>
    apiFetch<CompanyWithRelations[]>(
      `/public/suppliers${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    ),
}
