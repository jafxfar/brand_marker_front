import type { CompanyRole, UserPublic } from "./user"

export const ACTOR_TYPES = ["buyer", "supplier"] as const

export type ActorType = (typeof ACTOR_TYPES)[number]

export const VERIFICATION_STATUSES = [
  "pending",
  "verified",
  "rejected",
] as const

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number]

export type CompanyProfile = {
  company_id: number
  founded_year: number | null
  employees_count: number | null
  annual_revenue_range: string | null
  languages: string[]
  industries: string[]
}

export type CompanyCategory = {
  id: number
  company_id: number
  category_id: number
}

export type CompanyStats = {
  company_id: number
  completed_contracts: number
  active_contracts: number
  disputes_count: number
  average_rating: number
}

export type CompanyCertificate = {
  id: number
  company_id: number
  title: string
  issuer: string
  issue_date: string
  expiry_date: string | null
  file_url: string
}

export type CompanyUser = {
  id: number
  company_id: number
  user_id: number
  role: CompanyRole
  email?: string
}

export type Review = {
  id: number
  contract_id: number
  reviewer_actor_id: number
  target_actor_id: number
  rating: number
  comment: string | null
  created_at: string
}

export type Company = {
  id: number
  title: string
  actor_type: ActorType
  actor_types?: ActorType[]
  owner_id: number
  team_members: number[]
  legal_name: string | null
  tax_number: string | null
  website: string | null
  description: string | null
  logo: string | null
  country: string | null
  city: string | null
  address: string | null
  verification_status: VerificationStatus
  rating: number
  created_at: string
  updated_at: string
}

export type CompanyWithRelations = Company & {
  profile: CompanyProfile | null
  categories: CompanyCategory[]
  stats: CompanyStats | null
  certificates: CompanyCertificate[]
  reviews: Review[]
  company_users: CompanyUser[]
  owner?: UserPublic
  team?: UserPublic[]
}

export type CompanyPublic = Company

export type CompanyCreate = Omit<
  Company,
  "id" | "rating" | "created_at" | "updated_at"
> & {
  rating?: number
}

export type CompanyUpdate = Partial<
  Omit<Company, "id" | "created_at" | "updated_at">
>

export type CompanyProfileCreate = Omit<CompanyProfile, "company_id">

export type CompanyProfileUpdate = Partial<CompanyProfileCreate>

export type CompanyCertificateCreate = Omit<CompanyCertificate, "id">

export type CompanyCertificateUpdate = Partial<CompanyCertificateCreate>

export type ReviewCreate = Omit<Review, "id" | "created_at">

export type CompanyWizardCertificate = {
  title: string
  issuer: string
  issue_date: string
  expiry_date: string
  file_url: string
}

export type CompanyWizardTeamMember = {
  email: string
  role: CompanyRole
}

export type CompanyWizardInput = {
  title: string
  legal_name: string
  tax_number: string
  description: string
  logo: string
  country: string
  city: string
  address: string
  website: string
  founded_year: string
  employees_count: string
  annual_revenue_range: string
  languages: string[]
  industries: string[]
  category_ids: number[]
  certificates: CompanyWizardCertificate[]
  team: CompanyWizardTeamMember[]
  actor_types: ActorType[]
}

export const emptyCompanyWizardInput = (): CompanyWizardInput => ({
  title: "",
  legal_name: "",
  tax_number: "",
  description: "",
  logo: "",
  country: "",
  city: "",
  address: "",
  website: "",
  founded_year: "",
  employees_count: "",
  annual_revenue_range: "",
  languages: [],
  industries: [],
  category_ids: [],
  certificates: [],
  team: [],
  actor_types: ["buyer"],
})

export type PublicSupplier = {
  actor_id: number
  kind: "individual" | "company"
  display_name: string
  company_id: number | null
  city: string | null
  country: string | null
  description: string | null
  website: string | null
  rating: number
  verification_status: VerificationStatus
  reviews_count: number
  industries: string[]
  active_catalog_count: number
  trust_level: string
}
