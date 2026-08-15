"use client"

import Link from "next/link"
import { Users, ChevronRight } from "lucide-react"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useSupplierContractsQuery } from "@/hooks/api/use-contracts-query"
import { getActorId } from "@/lib/auth-display"
import { formatPrice } from "@/lib/format"
import { PageEmptyState, PageFrame, PageHeader, PageSurface } from "@/components/layout"
import type { ContractWithRelations } from "@/types"

interface CustomerGroup {
  id: number
  name: string
  contractCount: number
  totalAmount: number
  latestContractId: number
}

const groupCustomers = (
  contracts: ContractWithRelations[],
  getName: (buyerActorId: number) => string,
): CustomerGroup[] => {
  const groups = new Map<number, CustomerGroup>()

  for (const contract of contracts) {
    const existing = groups.get(contract.buyer_actor_id)
    if (existing) {
      existing.contractCount += 1
      existing.totalAmount += contract.agreed_amount
      if (contract.id > existing.latestContractId) {
        existing.latestContractId = contract.id
      }
      continue
    }

    groups.set(contract.buyer_actor_id, {
      id: contract.buyer_actor_id,
      name: getName(contract.buyer_actor_id),
      contractCount: 1,
      totalAmount: contract.agreed_amount,
      latestContractId: contract.id,
    })
  }

  return Array.from(groups.values()).sort((a, b) => b.totalAmount - a.totalAmount)
}

export default function SupplierCustomersPage() {
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const getContractsForSupplier = useContractsStore((s) => s.getContractsForSupplier)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const { data: apiContracts, isLoading } = useSupplierContractsQuery(hydrated && useApi)

  const getBuyerName = (buyerActorId: number): string =>
    getCompany(buyerActorId)?.title ?? `Заказчик #${buyerActorId}`

  const contracts: ContractWithRelations[] = useApi
    ? ((apiContracts ?? []) as ContractWithRelations[])
    : hydrated
      ? getContractsForSupplier(actorId)
      : []

  const customers = groupCustomers(contracts, getBuyerName)

  if (!hydrated || (useApi && isLoading)) {
    return (
      <PageFrame className="animate-pulse">
        <div className="mb-6 h-10 w-1/3 rounded bg-secondary" />
        <div className="h-32 rounded-xl bg-secondary" />
      </PageFrame>
    )
  }

  return (
    <PageFrame>
      <PageHeader
        title="Заказчики"
        description="Клиенты по договорам и сделкам"
      />

      {customers.length === 0 ? (
        <PageSurface>
          <PageEmptyState
            icon={<Users size={32} />}
            title="Заказчиков пока нет"
            description="Заказчики появятся после принятых предложений и договоров"
          />
        </PageSurface>
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Users size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{customer.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {customer.contractCount}{" "}
                  {customer.contractCount === 1 ? "договор" : "договоров"} ·{" "}
                  {formatPrice(customer.totalAmount)}
                </p>
              </div>
              <Link
                href={`/supplier/contracts/${customer.latestContractId}`}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                aria-label={`Открыть договоры с ${customer.name}`}
              >
                Сделки <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </PageFrame>
  )
}
