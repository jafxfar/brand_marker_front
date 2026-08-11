import type { EscrowStatus, OrderStatus, PaymentScheme } from "@/types"

export const orderStatusMeta: Record<OrderStatus, { label: string; className: string }> = {
  draft: { label: "Черновик", className: "bg-muted text-muted-foreground" },
  published: { label: "Опубликован", className: "bg-info/10 text-info" },
  in_progress: { label: "В работе", className: "bg-warning/10 text-warning" },
  completed: { label: "Завершён", className: "bg-primary/10 text-primary" },
  disputed: { label: "Спор", className: "bg-destructive/10 text-destructive" },
  cancelled: { label: "Отменён", className: "bg-muted text-muted-foreground" },
}

export const paymentSchemeMeta: Record<PaymentScheme, { label: string; desc: string }> = {
  prepay: { label: "Предоплата 100%", desc: "Вся сумма под защитой до приёмки" },
  half: { label: "50% / 50%", desc: "Половина авансом, остаток после выполнения" },
  postpay: { label: "Постоплата", desc: "Оплата после выполнения (только для услуг)" },
}

export const escrowMeta: Record<EscrowStatus, { label: string; className: string }> = {
  none: { label: "Без оплаты", className: "bg-muted text-muted-foreground" },
  held: { label: "Под защитой", className: "bg-warning/10 text-warning" },
  released: { label: "Выплачено", className: "bg-primary/10 text-primary" },
  disputed: { label: "Заморожено (спор)", className: "bg-destructive/10 text-destructive" },
  refunded: { label: "Возвращено", className: "bg-info/10 text-info" },
}

/** postpay is not allowed for products. */
export const availableSchemes = (kind: "product" | "service"): PaymentScheme[] =>
  kind === "product" ? ["prepay", "half"] : ["prepay", "half", "postpay"]
