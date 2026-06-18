"use client"

import Link from "next/link"
import { Building2, Plus } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useSubscriptionStore } from "@/lib/store/subscription-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import { useBuyerCompaniesQuery } from "@/hooks/api/use-buyer-companies-query"
import { useSupplierCompaniesQuery } from "@/hooks/api/use-supplier-companies-query"
import { useSupplierSubscriptionQuery } from "@/hooks/api/use-supplier-subscription-query"
import { CompanyCard } from "@/components/company/company-card"
import { filterCompaniesByActorType } from "@/lib/company-wizard-utils"
import { getCompanyLimit } from "@/lib/subscription"
import type { ActorType, CompanyWithRelations } from "@/types"

type CompanyListPageProps = {
  actorType: ActorType
  basePath: string
  roleLabel: string
}

export const CompanyListPage = ({
  actorType,
  basePath,
  roleLabel,
}: CompanyListPageProps) => {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const switchActor = useAuthStore((s) => s.switchActor)
  const getCompaniesForUser = useCompaniesStore((s) => s.getCompaniesForUser)
  const canUserCreateCompany = useCompaniesStore((s) => s.canUserCreateCompany)
  const getOwnedCompaniesCount = useCompaniesStore((s) => s.getOwnedCompaniesCount)
  const localPlan = useSubscriptionStore((s) => s.plan)

  const useApi = isApiEnabled()
  const { data: apiSupplierCompanies, isLoading: supplierLoading } =
    useSupplierCompaniesQuery(hydrated && useApi && actorType === "supplier")
  const { data: apiBuyerCompanies, isLoading: buyerLoading } =
    useBuyerCompaniesQuery(hydrated && useApi && actorType === "buyer")
  const { data: apiSub } = useSupplierSubscriptionQuery(
    hydrated && useApi && actorType === "supplier",
  )

  const apiCompanies =
    actorType === "supplier" ? apiSupplierCompanies : apiBuyerCompanies
  const isLoading = actorType === "supplier" ? supplierLoading : buyerLoading

  const plan = useApi && actorType === "supplier"
    ? ((apiSub?.is_active ? apiSub.plan : "none") as typeof localPlan)
    : localPlan

  if (!hydrated || !user) return null

  const localCompanies = filterCompaniesByActorType(
    getCompaniesForUser(user.userId),
    actorType,
  )
  const companies: CompanyWithRelations[] = useApi
    ? filterCompaniesByActorType(apiCompanies ?? [], actorType)
    : localCompanies

  const ownedCount = useApi
    ? companies.filter((c) => c.owner_id === user.userId).length
    : getOwnedCompaniesCount(user.userId)
  const canCreate = useApi
    ? (() => {
        const limit = getCompanyLimit(plan)
        if (limit === null) return true
        return ownedCount < limit
      })()
    : canUserCreateCompany(user.userId, plan)
  const limit = getCompanyLimit(plan)

  if (useApi && isLoading) {
    return (
      <div className="max-w-[900px] mx-auto animate-pulse">
        <div className="h-10 bg-secondary rounded w-1/3 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 bg-secondary rounded-2xl" />
          <div className="h-40 bg-secondary rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Building2 size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Мои компании</h1>
            <p className="text-sm text-muted-foreground">
              {roleLabel} · {companies.length} компаний
              {limit !== null && ` · лимит ${ownedCount}/${limit}`}
            </p>
          </div>
        </div>

        {canCreate ? (
          <Link
            href={`${basePath}/new`}
            className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Создать компанию
          </Link>
        ) : (
          <Link
            href={actorType === "supplier" ? "/supplier/subscription" : `${basePath}/new`}
            className="h-11 px-5 rounded-xl border border-input text-sm font-semibold flex items-center justify-center hover:bg-secondary transition-colors"
          >
            Лимит исчерпан
          </Link>
        )}
      </div>

      {companies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-input bg-white p-12 text-center">
          <Building2 size={40} className="text-muted-foreground mx-auto mb-4 opacity-40" />
          <h2 className="text-lg font-bold mb-2">Нет компаний</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Создайте профиль компании, чтобы участвовать в сделках на платформе
          </p>
          {canCreate && (
            <Link
              href={`${basePath}/new`}
              className="inline-flex h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              Создать первую компанию
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              isActive={company.id === user.activeCompanyId}
              editHref={`${basePath}/${company.id}`}
              onSwitch={() => {
                const actor = user.actors.find(
                  (a) => a.company_id === company.id && a.side === actorType,
                )
                if (actor) {
                  switchActor(actor.id)
                  return
                }
                switchActor(company.id)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
