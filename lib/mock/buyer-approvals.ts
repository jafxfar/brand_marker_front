export type BuyerApprovalStatus = "wait" | "auto" | "approved" | "rejected"

export type BuyerApproval = {
  id: string
  whoName: string
  whoRole: string
  limitLabel: string
  what: string
  supplierName: string
  amount: number
  currency: string
  created: string
  status: BuyerApprovalStatus
  reason: string
}

export const MOCK_BUYER_APPROVALS: BuyerApproval[] = [
  {
    id: "a1",
    whoName: "Мадина Саидова",
    whoRole: "Закупщик",
    limitLabel: "20 000 TJS",
    what: "Бумага А4 SvetoCopy, 100 коробок",
    supplierName: "ОфисПро",
    amount: 25500,
    currency: "TJS",
    created: "2026-09-26",
    status: "wait",
    reason: "Сумма больше лимита сотрудника — 20 000 TJS",
  },
  {
    id: "a2",
    whoName: "Мадина Саидова",
    whoRole: "Закупщик",
    limitLabel: "20 000 TJS",
    what: "Кофе в зёрнах, 12 кг",
    supplierName: "HoReCa Supply",
    amount: 2220,
    currency: "TJS",
    created: "2026-09-19",
    status: "auto",
    reason: "В пределах лимита",
  },
  {
    id: "a3",
    whoName: "Алишер Рахимов",
    whoRole: "Кладовщик",
    limitLabel: "10 000 TJS",
    what: "Костюмы рабочие, 20 комплектов",
    supplierName: "Спецодежда ТД",
    amount: 6400,
    currency: "TJS",
    created: "2026-09-12",
    status: "approved",
    reason: "",
  },
]

export const MOCK_PENDING_APPROVALS_COUNT = MOCK_BUYER_APPROVALS.filter(
  (a) => a.status === "wait",
).length
