import type { BudgetType, RfqStatus, RfqType } from "@/types"

export const rfqStatusMeta: Record<
  RfqStatus,
  { label: string; className: string }
> = {
  draft: { label: "Черновик", className: "bg-muted text-muted-foreground" },
  published: { label: "Опубликован", className: "bg-blue-100 text-blue-700" },
  receiving_proposals: {
    label: "Приём предложений",
    className: "bg-emerald-100 text-emerald-700",
  },
  supplier_selected: {
    label: "Поставщик выбран",
    className: "bg-violet-100 text-violet-700",
  },
  contract_created: {
    label: "Контракт создан",
    className: "bg-violet-100 text-violet-700",
  },
  in_progress: { label: "В работе", className: "bg-amber-100 text-amber-700" },
  completed: { label: "Завершён", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Отменён", className: "bg-muted text-muted-foreground" },
  expired: { label: "Истёк", className: "bg-red-100 text-red-700" },
  disputed: { label: "Спор", className: "bg-red-100 text-red-700" },
}

export const budgetTypeMeta: Record<BudgetType, string> = {
  fixed: "Фиксированный",
  range: "Диапазон",
  open: "Открытый",
}

export const OPEN_RFQ_STATUSES: RfqStatus[] = ["published", "receiving_proposals"]

export const rfqTypeLabel: Record<RfqType, string> = {
  product: "Товар",
  service: "Услуга",
}
