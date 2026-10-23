import type { ContractListTab } from "@/lib/contract-display"

export type BuyerContractListTab = Extract<ContractListTab, "active" | "completed">

export const BUYER_CONTRACT_LIST_TABS: {
  value: BuyerContractListTab
  label: string
}[] = [
  { value: "active", label: "В работе" },
  { value: "completed", label: "Завершённые" },
]

export const buyerContractEmptyMessages: Record<BuyerContractListTab, string> = {
  active: "Сделка появится, когда вы купите в каталоге или выберете КП.",
  completed: "Здесь будут сделки, по которым исполнитель получил оплату",
}
