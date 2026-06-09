import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CompanyWithRelations } from "@/types"
import { mockCompanies } from "@/lib/mock/companies"

interface CompaniesState {
  companies: CompanyWithRelations[]
  getCompany: (id: number) => CompanyWithRelations | undefined
  getMyCompany: (actorId: number) => CompanyWithRelations | undefined
}

export const useCompaniesStore = create<CompaniesState>()(
  persist(
    () => ({
      companies: mockCompanies,

      getCompany: (id) => mockCompanies.find((c) => c.id === id),

      getMyCompany: (actorId) => mockCompanies.find((c) => c.id === actorId),
    }),
    { name: "bm-companies" },
  ),
)
