import { RFQ_STATUSES, type RfqStatus } from "@/types"
import { rfqStatusMeta } from "@/lib/rfq-display"

export type BuyerRfqStatusFilter = "all" | RfqStatus

const CLOSED_STATUSES: RfqStatus[] = [
  "supplier_selected",
  "contract_created",
  "in_progress",
  "completed",
  "cancelled",
  "expired",
  "disputed",
]

export const ACTIVE_RFQ_STATUSES: RfqStatus[] = [
  "published",
  "receiving_proposals",
  "in_progress",
  "disputed",
]

export const BUYER_RFQ_STATUS_FILTER_OPTIONS: {
  value: BuyerRfqStatusFilter
  label: string
}[] = [
  { value: "all", label: "Все статусы" },
  ...RFQ_STATUSES.filter((status) => status !== "archived").map((status) => ({
    value: status as BuyerRfqStatusFilter,
    label: rfqStatusMeta[status].label,
  })),
]

export const getRfqStatusesForBuyerFilter = (
  filter: BuyerRfqStatusFilter,
): RfqStatus[] | null => {
  if (filter === "all") return null
  return [filter]
}

/** @deprecated use getRfqStatusesForBuyerFilter */
export type BuyerRfqListTab = "draft" | "published" | "collecting" | "closed"

/** @deprecated use BUYER_RFQ_STATUS_FILTER_OPTIONS */
export const BUYER_RFQ_LIST_TABS: { value: BuyerRfqListTab; label: string }[] = [
  { value: "draft", label: "Черновик" },
  { value: "published", label: "Опубликован" },
  { value: "collecting", label: "Приём предложений" },
  { value: "closed", label: "Закрыт" },
]

/** @deprecated use getRfqStatusesForBuyerFilter */
export const getRfqStatusesForBuyerTab = (tab: BuyerRfqListTab): RfqStatus[] => {
  if (tab === "draft") return ["draft"]
  if (tab === "published") return ["published"]
  if (tab === "collecting") return ["receiving_proposals"]
  return CLOSED_STATUSES
}

export const isClosedRfqStatus = (status: RfqStatus): boolean =>
  CLOSED_STATUSES.includes(status)
