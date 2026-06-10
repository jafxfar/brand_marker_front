import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CompanyWithRelations, Review } from "@/types"
import { mockCompanies } from "@/lib/mock/companies"
import {
  isSupplierCompany,
  matchesSupplierSearch,
} from "@/lib/supplier-directory"

type SubmitReviewInput = {
  contractId: number
  reviewerActorId: number
  targetActorId: number
  rating: number
  comment: string | null
}

interface CompaniesState {
  companies: CompanyWithRelations[]
  contractReviewIds: Record<number, number>
  getCompany: (id: number) => CompanyWithRelations | undefined
  getMyCompany: (actorId: number) => CompanyWithRelations | undefined
  getSupplierCompanies: () => CompanyWithRelations[]
  getSupplierCompaniesByCategory: (
    categorySlug: string,
    getCategoriesForSupplier: (companyId: number) => { slug: string }[],
  ) => CompanyWithRelations[]
  searchSupplierCompanies: (query: string) => CompanyWithRelations[]
  submitReview: (input: SubmitReviewInput) => Review
  getReviewsGivenByBuyer: (buyerId: number) => Review[]
  hasReviewForContract: (buyerId: number, contractId: number) => boolean
}

const nextReviewId = (companies: CompanyWithRelations[]): number => {
  let maxId = 0
  for (const company of companies) {
    for (const review of company.reviews) {
      if (review.id > maxId) maxId = review.id
    }
  }
  return maxId + 1
}

const recalculateRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

export const useCompaniesStore = create<CompaniesState>()(
  persist(
    (set, get) => ({
      companies: mockCompanies,
      contractReviewIds: {},

      getCompany: (id) => get().companies.find((c) => c.id === id),

      getMyCompany: (actorId) => get().companies.find((c) => c.id === actorId),

      getSupplierCompanies: () =>
        get()
          .companies.filter(isSupplierCompany)
          .sort((a, b) => b.rating - a.rating),

      getSupplierCompaniesByCategory: (categorySlug, getCategoriesForSupplier) => {
        if (!categorySlug) return get().getSupplierCompanies()
        return get()
          .getSupplierCompanies()
          .filter((company) =>
            getCategoriesForSupplier(company.id).some((c) => c.slug === categorySlug),
          )
      },

      searchSupplierCompanies: (query) => {
        const suppliers = get().getSupplierCompanies()
        if (!query.trim()) return suppliers
        return suppliers.filter((c) => matchesSupplierSearch(c, query))
      },

      submitReview: (input) => {
        const reviewId = nextReviewId(get().companies)
        const review: Review = {
          id: reviewId,
          contract_id: input.contractId,
          reviewer_actor_id: input.reviewerActorId,
          target_actor_id: input.targetActorId,
          rating: input.rating,
          comment: input.comment,
          created_at: new Date().toISOString(),
        }

        set((state) => ({
          contractReviewIds: {
            ...state.contractReviewIds,
            [input.contractId]: reviewId,
          },
          companies: state.companies.map((company) => {
            if (company.id !== input.targetActorId) return company
            const reviews = [...company.reviews, review]
            return {
              ...company,
              reviews,
              rating: recalculateRating(reviews),
            }
          }),
        }))

        return review
      },

      getReviewsGivenByBuyer: (buyerId) => {
        const reviews: Review[] = []
        for (const company of get().companies) {
          for (const review of company.reviews) {
            if (review.reviewer_actor_id === buyerId) {
              reviews.push(review)
            }
          }
        }
        return reviews.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
      },

      hasReviewForContract: (buyerId, contractId) => {
        const { contractReviewIds } = get()
        if (contractReviewIds[contractId]) return true
        for (const company of get().companies) {
          if (
            company.reviews.some(
              (r) =>
                r.contract_id === contractId &&
                r.reviewer_actor_id === buyerId,
            )
          ) {
            return true
          }
        }
        return false
      },
    }),
    { name: "bm-companies" },
  ),
)
