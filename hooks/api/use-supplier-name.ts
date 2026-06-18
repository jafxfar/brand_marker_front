import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { publicApi } from "@/lib/api/public"
import { isApiEnabled } from "@/lib/api/config"
import { useCompaniesStore } from "@/lib/store/companies-store"
import type { CompanyWithRelations } from "@/types"

const findSupplierTitle = (
  actorId: number,
  suppliers: CompanyWithRelations[],
): string | null => {
  for (const company of suppliers) {
    if (company.id === actorId) return company.title
  }
  return null
}

export const useSupplierActorName = (actorIds: number[]) => {
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const useApi = isApiEnabled()
  const uniqueIds = [...new Set(actorIds.filter(Boolean))]

  const { data: suppliers } = useQuery({
    queryKey: ["public-suppliers-names"],
    queryFn: () => publicApi.suppliers() as Promise<CompanyWithRelations[]>,
    enabled: useApi && uniqueIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  return useMemo(() => {
    const map = new Map<number, string>()
    for (const id of uniqueIds) {
      const local = getCompany(id)?.title
      if (local) {
        map.set(id, local)
        continue
      }
      const fromList = suppliers ? findSupplierTitle(id, suppliers) : null
      map.set(id, fromList ?? `Поставщик #${id}`)
    }
    return (actorId: number) => map.get(actorId) ?? `Поставщик #${actorId}`
  }, [uniqueIds, getCompany, suppliers])
}
