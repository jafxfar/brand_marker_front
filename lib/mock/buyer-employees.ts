export type BuyerEmployeeRole =
  | "Руководитель"
  | "Закупщик"
  | "Бухгалтер"
  | "Наблюдатель"

export type BuyerEmployeeStatus = "active" | "invited" | "blocked"

export type BuyerEmployee = {
  id: string
  name: string
  role: BuyerEmployeeRole
  rights: string
  /** null = без лимита; 0 = не может покупать */
  limit: number | null
  phone: string
  status: BuyerEmployeeStatus
  me?: boolean
}

export type BuyerCompanyLogEntry = {
  at: string
  who: string
  text: string
}

export const BUYER_ROLE_RIGHTS: Record<BuyerEmployeeRole, string> = {
  Руководитель: "Всё, включая согласование и оплату",
  Закупщик: "Заявки и покупки",
  Бухгалтер: "Оплата и документы, без покупок",
  Наблюдатель: "Только просмотр",
}

export const BUYER_EMPLOYEE_ROLES = Object.keys(
  BUYER_ROLE_RIGHTS,
) as BuyerEmployeeRole[]

export const MOCK_BUYER_EMPLOYEES: BuyerEmployee[] = [
  {
    id: "e1",
    name: "Шерзод Додобоев",
    role: "Руководитель",
    rights: BUYER_ROLE_RIGHTS["Руководитель"],
    limit: null,
    phone: "+992 92 797 77 13",
    status: "active",
    me: true,
  },
  {
    id: "e2",
    name: "Мадина Саидова",
    role: "Закупщик",
    rights: BUYER_ROLE_RIGHTS["Закупщик"],
    limit: 20000,
    phone: "+992 93 410 22 05",
    status: "active",
  },
  {
    id: "e3",
    name: "Фаррух Назаров",
    role: "Бухгалтер",
    rights: BUYER_ROLE_RIGHTS["Бухгалтер"],
    limit: 0,
    phone: "+992 90 118 64 30",
    status: "active",
  },
  {
    id: "e4",
    name: "Далер Каримов",
    role: "Закупщик",
    rights: BUYER_ROLE_RIGHTS["Закупщик"],
    limit: 10000,
    phone: "+992 91 555 01 77",
    status: "invited",
  },
]

export const MOCK_BUYER_COMPANY_LOG: BuyerCompanyLogEntry[] = [
  {
    at: "26 сен, 08:40",
    who: "Мадина Саидова",
    text: "Запросила согласование: бумага А4, 25 500 TJS",
  },
  {
    at: "12 сен, 10:15",
    who: "Шерзод Додобоев",
    text: "Изменил лимит Далера Каримова: 10 000 TJS",
  },
  {
    at: "01 мар, 09:15",
    who: "Шерзод Додобоев",
    text: "Пригласил Мадину Саидову (закупщик)",
  },
]

export type PurchaseRuleId = "rule1" | "rule2" | "rule3"

export type PurchaseRules = Record<PurchaseRuleId, boolean>

export const DEFAULT_PURCHASE_RULES: PurchaseRules = {
  rule1: true,
  rule2: true,
  rule3: false,
}

export const PURCHASE_RULE_LABELS: Record<PurchaseRuleId, string> = {
  rule1: "Покупки дороже лимита сотрудника — только после согласования руководителя",
  rule2: "Обязательный двухфакторный вход для всех сотрудников",
  rule3: "Покупать только у проверенных компаний",
}

export const PURCHASE_RULES_KEY = "buyer.purchaseRules"

export const formatEmployeeLimit = (limit: number | null): string => {
  if (limit == null) return "без лимита"
  if (limit === 0) return "—"
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "TJS",
    maximumFractionDigits: 0,
  }).format(limit)
}

export const initialsFromName = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
  }
  return name.trim().slice(0, 2).toUpperCase() || "?"
}

export const readPurchaseRules = (): PurchaseRules => {
  if (typeof window === "undefined") return { ...DEFAULT_PURCHASE_RULES }
  try {
    const raw = localStorage.getItem(PURCHASE_RULES_KEY)
    if (!raw) return { ...DEFAULT_PURCHASE_RULES }
    const parsed = JSON.parse(raw) as Partial<PurchaseRules>
    return { ...DEFAULT_PURCHASE_RULES, ...parsed }
  } catch {
    return { ...DEFAULT_PURCHASE_RULES }
  }
}

export const writePurchaseRules = (rules: PurchaseRules) => {
  localStorage.setItem(PURCHASE_RULES_KEY, JSON.stringify(rules))
}
