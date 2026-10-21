import type { ProposalStatus, RfqWithRelations } from "@/types"

export type SupplierRfqSourceFilter = "all" | "marketplace" | "catalog"

export const isCatalogOfferRfq = (rfq: RfqWithRelations): boolean =>
  Boolean(rfq.is_catalog_offer) ||
  rfq.catalog_item_id != null ||
  rfq.my_proposal_status === "pending_supplier"

export const filterRfqsBySource = (
  rfqs: RfqWithRelations[],
  source: SupplierRfqSourceFilter,
): RfqWithRelations[] => {
  if (source === "all") return rfqs
  if (source === "catalog") return rfqs.filter(isCatalogOfferRfq)
  return rfqs.filter((rfq) => !isCatalogOfferRfq(rfq))
}

export const sortSupplierBoardRfqs = (
  rfqs: RfqWithRelations[],
  actorId: number,
  isInvited: (rfq: RfqWithRelations, actorId: number) => boolean,
): RfqWithRelations[] =>
  [...rfqs].sort((a, b) => {
    const catalogDelta = Number(isCatalogOfferRfq(b)) - Number(isCatalogOfferRfq(a))
    if (catalogDelta !== 0) return catalogDelta
    return Number(isInvited(b, actorId)) - Number(isInvited(a, actorId))
  })

export const isPendingCatalogOffer = (
  status: ProposalStatus | null | undefined,
): boolean => status === "pending_supplier"
