import type { UserPublic } from "./user"

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
