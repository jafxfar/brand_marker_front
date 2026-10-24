import { useMemo } from "react"
import { useQueries } from "@tanstack/react-query"
import { publicApi } from "@/lib/api/public"
import { isApiEnabled } from "@/lib/api/config"
import { publicKeys } from "@/hooks/api/use-public-query"
import { useCompaniesStore } from "@/lib/store/companies-store"
import {
  isSupplierCompany,
  toPublicSupplierFromCompany,
} from "@/lib/supplier-directory"
import { mapCatalogItemToService } from "@/lib/marketplace-hybrid"
import type { CatalogItemWithRelations, PublicSupplier } from "@/types"
import type { MarketplaceService } from "@/types/marketplace"

export const usePublicSuppliersByActor = (actorIds: number[]) => {
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const useApi = isApiEnabled()
  const idsKey = [...new Set(actorIds.filter((id) => id > 0))]
    .sort((a, b) => a - b)
    .join(",")
  const ids = useMemo(
    () => (idsKey ? idsKey.split(",").map(Number) : []),
    [idsKey],
  )

  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: publicKeys.supplier(id),
      queryFn: () => publicApi.supplier(id),
      enabled: useApi && id > 0,
      staleTime: 5 * 60 * 1000,
    })),
  })

  const resolvedKey = results
    .map((result) => `${result.dataUpdatedAt}:${result.data?.display_name ?? ""}`)
    .join("|")

  return useMemo(() => {
    const map = new Map<number, PublicSupplier>()
    for (let index = 0; index < ids.length; index += 1) {
      const id = ids[index]!
      const fromApi = results[index]?.data
      if (fromApi) {
        map.set(id, fromApi)
        continue
      }
      const local = getCompany(id)
      if (local && isSupplierCompany(local)) {
        map.set(id, toPublicSupplierFromCompany(local))
      }
    }

    const getSupplier = (actorId: number) => map.get(actorId)
    const getName = (actorId: number) => map.get(actorId)?.display_name ?? ""

    return { getSupplier, getName }
    // results is mirrored by resolvedKey; including results would churn every render
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resolvedKey tracks query data
  }, [ids, resolvedKey, getCompany])
}

export const useSupplierActorName = (actorIds: number[]) => {
  const { getName } = usePublicSuppliersByActor(actorIds)
  return getName
}

/** Map catalog API items to marketplace cards with real supplier names. */
export const useMappedMarketplaceServices = (
  items: CatalogItemWithRelations[] | undefined | null,
  options?: { limit?: number; excludeId?: number },
): MarketplaceService[] => {
  const excludeId = options?.excludeId
  const limit = options?.limit

  const filtered = useMemo(() => {
    let list = items ?? []
    if (excludeId != null) list = list.filter((entry) => entry.id !== excludeId)
    if (limit != null) list = list.slice(0, limit)
    return list
  }, [items, excludeId, limit])

  const actorIds = useMemo(
    () => filtered.map((entry) => entry.actor_id),
    [filtered],
  )
  const { getSupplier } = usePublicSuppliersByActor(actorIds)

  return useMemo(
    () =>
      filtered.map((item) =>
        mapCatalogItemToService(item, null, getSupplier(item.actor_id) ?? null),
      ),
    [filtered, getSupplier],
  )
}
