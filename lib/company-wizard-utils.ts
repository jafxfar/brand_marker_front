import type { CompanyWizardInput, CompanyWithRelations } from "@/types"
import { emptyCompanyWizardInput } from "@/types/company"

export const companyToWizardInput = (
  company: CompanyWithRelations,
): CompanyWizardInput => ({
  title: company.title,
  legal_name: company.legal_name ?? "",
  tax_number: company.tax_number ?? "",
  description: company.description ?? "",
  logo: company.logo ?? "",
  country: company.country ?? "",
  city: company.city ?? "",
  address: company.address ?? "",
  website: company.website ?? "",
  founded_year: company.profile?.founded_year
    ? String(company.profile.founded_year)
    : "",
  employees_count: company.profile?.employees_count
    ? String(company.profile.employees_count)
    : "",
  annual_revenue_range: company.profile?.annual_revenue_range ?? "",
  languages: company.profile?.languages ?? [],
  industries: company.profile?.industries ?? [],
  category_ids: company.categories.map((c) => c.category_id),
  certificates: company.certificates.map((c) => ({
    title: c.title,
    issuer: c.issuer,
    issue_date: c.issue_date,
    expiry_date: c.expiry_date ?? "",
    file_url: c.file_url,
  })),
  team: company.company_users.map((u) => ({
    email: u.email ?? "",
    role: u.role,
  })),
})

export const filterCompaniesByActorType = (
  companies: CompanyWithRelations[],
  actorType: "buyer" | "supplier",
): CompanyWithRelations[] =>
  companies.filter((c) => c.actor_type === actorType)

export { emptyCompanyWizardInput }
