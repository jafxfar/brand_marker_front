import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { publicApi } from "@/lib/api/public"
import { isApiEnabled } from "@/lib/api/config"
import { useCompaniesStore } from "@/lib/store/companies-store"
import type { PublicSupplier } from "@/types"

const findSupplierTitle = (
  actorId: number,
  suppliers: PublicSupplier[],
): string | null => {
  for (const supplier of suppliers) {
    if (supplier.actor_id === actorId) return supplier.display_name
  }
  return null
}

export const useSupplierActorName = (actorIds: number[]) => {
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const useApi = isApiEnabled()
  const uniqueIds = [...new Set(actorIds.filter(Boolean))]

  const { data: suppliers } = useQuery({
    queryKey: ["public-suppliers-names"],
    queryFn: () => publicApi.suppliers(),
    enabled: useApi && uniqueIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  return useMemo(() => {
    const map = new Map<number, string>()
    for (const id of uniqueIds) {
      const fromList = suppliers ? findSupplierTitle(id, suppliers) : null
      if (fromList) {
        map.set(id, fromList)
        continue
      }
      const local = getCompany(id)?.title
      map.set(id, local ?? `Поставщик #${id}`)
    }
    return (actorId: number) => map.get(actorId) ?? `Поставщик #${actorId}`
  }, [uniqueIds, getCompany, suppliers])
}
