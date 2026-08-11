import type { BudgetType, RfqStatus, RfqType } from "@/types"

export const rfqStatusMeta: Record<
  RfqStatus,
  { label: string; className: string }
> = {
  draft: { label: "Черновик", className: "bg-muted text-muted-foreground" },
  published: { label: "Опубликован", className: "bg-info/10 text-info" },
  receiving_proposals: {
    label: "Приём предложений",
    className: "bg-primary/10 text-primary",
  },
  supplier_selected: {
    label: "Поставщик выбран",
    className: "bg-muted text-muted-foreground",
  },
  contract_created: {
    label: "Контракт создан",
    className: "bg-muted text-muted-foreground",
  },
  in_progress: { label: "В работе", className: "bg-warning/10 text-warning" },
  completed: { label: "Завершён", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Отменён", className: "bg-muted text-muted-foreground" },
  expired: { label: "Истёк", className: "bg-destructive/10 text-destructive" },
  disputed: { label: "Спор", className: "bg-destructive/10 text-destructive" },
  archived: { label: "Архив", className: "bg-muted text-muted-foreground" },
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
