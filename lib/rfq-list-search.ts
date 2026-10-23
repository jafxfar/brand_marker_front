import type { RfqWithRelations } from "@/types"
import {
  isCatalogOfferRfq,
  isPendingCatalogOffer,
  type SupplierRfqSourceFilter,
} from "@/lib/rfq-board"
import { OPEN_RFQ_STATUSES } from "@/lib/rfq-display"

export type RfqTypeFilter = "all" | "product" | "service"

export type SupplierRfqResponseFilter = "all" | "open" | "sent" | "closed"

export const RFQ_TYPE_FILTER_VALUES = ["all", "product", "service"] as const

export const RFQ_TYPE_FILTER_OPTIONS: { value: RfqTypeFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "product", label: "Товары" },
  { value: "service", label: "Услуги" },
]

export const SUPPLIER_SOURCE_FILTER_VALUES = [
  "all",
  "marketplace",
  "catalog",
] as const

export const SUPPLIER_SOURCE_FILTER_OPTIONS: {
  value: SupplierRfqSourceFilter
  label: string
}[] = [
  { value: "all", label: "Все" },
  { value: "marketplace", label: "С площадки" },
  { value: "catalog", label: "Из каталога" },
]

export const SUPPLIER_RESPONSE_FILTER_VALUES = [
  "all",
  "open",
  "sent",
  "closed",
] as const

export const SUPPLIER_RESPONSE_FILTER_OPTIONS: {
  value: SupplierRfqResponseFilter
  label: string
}[] = [
  { value: "all", label: "Все" },
  { value: "open", label: "Ждут ответа" },
  { value: "sent", label: "Ответил" },
  { value: "closed", label: "Приём закрыт" },
]

const formatRfqNoDigits = (rfqId: string): string => {
  const digits = rfqId.replace(/\D/g, "")
  return (digits || rfqId).slice(-4)
}

export const matchesRfqSearch = (
  rfq: RfqWithRelations,
  query: string,
  extraText = "",
): boolean => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const no = formatRfqNoDigits(rfq.id)
  const haystack = [rfq.id, rfq.title, no, `з-${no}`, `з‑${no}`, extraText]
    .join(" ")
    .toLowerCase()
  return haystack.includes(q)
}

export const filterRfqsByType = (
  rfqs: RfqWithRelations[],
  type: RfqTypeFilter,
): RfqWithRelations[] => {
  if (type === "all") return rfqs
  return rfqs.filter((rfq) => rfq.type === type)
}

export const isSupplierRfqClosed = (rfq: RfqWithRelations): boolean =>
  rfq.status === "expired" || !OPEN_RFQ_STATUSES.includes(rfq.status)

export const filterSupplierRfqsByResponse = (
  rfqs: RfqWithRelations[],
  filter: SupplierRfqResponseFilter,
  hasResponse: (rfqId: string) => boolean,
): RfqWithRelations[] => {
  if (filter === "all") return rfqs
  return rfqs.filter((rfq) => {
    const closed = isSupplierRfqClosed(rfq)
    if (filter === "closed") return closed
    if (filter === "sent") return !closed && hasResponse(rfq.id)
    return !closed && !hasResponse(rfq.id)
  })
}

export { isCatalogOfferRfq, isPendingCatalogOffer }
export type { SupplierRfqSourceFilter }
