import type { EscrowStatus, OrderStatus, PaymentScheme } from "@/types"

export const orderStatusMeta: Record<OrderStatus, { label: string; className: string }> = {
  draft: { label: "Черновик", className: "bg-muted text-muted-foreground" },
  published: { label: "Опубликован", className: "bg-blue-100 text-blue-700" },
  in_progress: { label: "В работе", className: "bg-amber-100 text-amber-700" },
  completed: { label: "Завершён", className: "bg-emerald-100 text-emerald-700" },
  disputed: { label: "Спор", className: "bg-red-100 text-red-700" },
  cancelled: { label: "Отменён", className: "bg-muted text-muted-foreground" },
}

export const paymentSchemeMeta: Record<PaymentScheme, { label: string; desc: string }> = {
  prepay: { label: "Предоплата 100%", desc: "Вся сумма под защитой до приёмки" },
  half: { label: "50% / 50%", desc: "Половина авансом, остаток после выполнения" },
  postpay: { label: "Постоплата", desc: "Оплата после выполнения (только для услуг)" },
}

export const escrowMeta: Record<EscrowStatus, { label: string; className: string }> = {
  none: { label: "Без оплаты", className: "bg-muted text-muted-foreground" },
  held: { label: "Под защитой", className: "bg-amber-100 text-amber-700" },
  released: { label: "Выплачено", className: "bg-emerald-100 text-emerald-700" },
  disputed: { label: "Заморожено (спор)", className: "bg-red-100 text-red-700" },
  refunded: { label: "Возвращено", className: "bg-blue-100 text-blue-700" },
}

/** postpay is not allowed for products. */
export const availableSchemes = (kind: "product" | "service"): PaymentScheme[] =>
  kind === "product" ? ["prepay", "half"] : ["prepay", "half", "postpay"]
