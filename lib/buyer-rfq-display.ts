import type { RfqStatus } from "@/types"

export type BuyerRfqListTab = "draft" | "published" | "collecting" | "closed"

export const BUYER_RFQ_LIST_TABS: { value: BuyerRfqListTab; label: string }[] = [
  { value: "draft", label: "Черновик" },
  { value: "published", label: "Опубликован" },
  { value: "collecting", label: "Приём предложений" },
  { value: "closed", label: "Закрыт" },
]

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

export const getRfqStatusesForBuyerTab = (tab: BuyerRfqListTab): RfqStatus[] => {
  if (tab === "draft") return ["draft"]
  if (tab === "published") return ["published"]
  if (tab === "collecting") return ["receiving_proposals"]
  return CLOSED_STATUSES
}

export const isClosedRfqStatus = (status: RfqStatus): boolean =>
  CLOSED_STATUSES.includes(status)
