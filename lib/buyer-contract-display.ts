import type { ContractListTab } from "@/lib/contract-display"

export type BuyerContractListTab = Extract<
  ContractListTab,
  "active" | "completed" | "disputed"
>

export const BUYER_CONTRACT_LIST_TABS: {
  value: BuyerContractListTab
  label: string
}[] = [
  { value: "active", label: "Идут" },
  { value: "completed", label: "Завершённые" },
  { value: "disputed", label: "Споры" },
]

export const buyerContractEmptyMessages: Record<BuyerContractListTab, string> = {
  active: "Сделка появится, когда вы выберете исполнителя по заявке",
  completed: "Здесь будут сделки, по которым исполнитель получил оплату",
  disputed: "Споров нет — и хорошо",
}
