import type { ContractListTab } from "@/lib/contract-display"

export type BuyerContractListTab = Extract<
  ContractListTab,
  "active" | "completed" | "disputed"
>

export const BUYER_CONTRACT_LIST_TABS: {
  value: BuyerContractListTab
  label: string
}[] = [
  { value: "active", label: "Активные" },
  { value: "completed", label: "Завершённые" },
  { value: "disputed", label: "Спорные" },
]

export const buyerContractEmptyMessages: Record<BuyerContractListTab, string> = {
  active: "Активные договоры появятся после принятия предложения по заявке",
  completed: "Завершённые контракты отобразятся здесь",
  disputed: "Спорных контрактов нет",
}
