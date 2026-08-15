import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { publicApi } from "@/lib/api/public"
import { isApiEnabled } from "@/lib/api/config"
import { publicKeys } from "@/hooks/api/use-public-query"
import { useCompaniesStore } from "@/lib/store/companies-store"
import {
  isSupplierCompany,
  toPublicSupplierFromCompany,
} from "@/lib/supplier-directory"
import type { PublicSupplier } from "@/types"

const findSupplier = (
  actorId: number,
  suppliers: PublicSupplier[],
): PublicSupplier | undefined => {
  for (const supplier of suppliers) {
    if (supplier.actor_id === actorId) return supplier
  }
  return undefined
}

export const usePublicSuppliersByActor = (actorIds: number[]) => {
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const useApi = isApiEnabled()
  const uniqueKey = [...new Set(actorIds.filter((id) => id > 0))]
    .sort((a, b) => a - b)
    .join(",")

  const { data: suppliers } = useQuery({
    queryKey: publicKeys.suppliers(),
    queryFn: () => publicApi.suppliers(),
    enabled: useApi && uniqueKey.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  return useMemo(() => {
    const ids = uniqueKey ? uniqueKey.split(",").map(Number) : []
    const map = new Map<number, PublicSupplier>()
    for (const id of ids) {
      const fromList = suppliers ? findSupplier(id, suppliers) : undefined
      if (fromList) {
        map.set(id, fromList)
        continue
      }
      const local = getCompany(id)
      if (local && isSupplierCompany(local)) {
        map.set(id, toPublicSupplierFromCompany(local))
      }
    }

    const getSupplier = (actorId: number) => map.get(actorId)
    const getName = (actorId: number) =>
      map.get(actorId)?.display_name ?? `Поставщик #${actorId}`

    return { getSupplier, getName }
  }, [uniqueKey, getCompany, suppliers])
}

export const useSupplierActorName = (actorIds: number[]) => {
  const { getName } = usePublicSuppliersByActor(actorIds)
  return getName
}
