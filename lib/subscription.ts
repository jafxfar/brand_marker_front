import type { SubscriptionPlan } from "@/lib/store/subscription-store"

export interface PlanMeta {
  id: Exclude<SubscriptionPlan, "none">
  name: string
  price: number
  tagline: string
  features: string[]
  highlighted?: boolean
}

export const plans: PlanMeta[] = [
  {
    id: "start",
    name: "Старт",
    price: 1990,
    tagline: "Для начала продвижения",
    features: [
      "Бейдж «Продвигается» на откликах",
      "Приоритет в ленте заказов",
      "До 10 активных позиций",
      "До 2 компаний",
    ],
  },
  {
    id: "pro",
    name: "Про",
    price: 4990,
    tagline: "Оптимально для роста",
    features: [
      "Всё из тарифа «Старт»",
      "Топ-размещение профиля",
      "Расширенная аналитика",
      "До 50 активных позиций",
      "До 5 компаний",
    ],
    highlighted: true,
  },
  {
    id: "business",
    name: "Бизнес",
    price: 9990,
    tagline: "Максимальная видимость",
    features: [
      "Всё из тарифа «Про»",
      "Закрепление в топе категории",
      "Персональный менеджер",
      "Безлимит позиций",
      "Безлимит компаний",
    ],
  },
]

export const planName = (plan: SubscriptionPlan): string =>
  plan === "none" ? "Нет подписки" : plans.find((p) => p.id === plan)?.name ?? plan

export const companyLimits: Record<SubscriptionPlan, number | null> = {
  none: 1,
  start: 2,
  pro: 5,
  business: null,
}

export const getCompanyLimit = (plan: SubscriptionPlan): number | null =>
  companyLimits[plan]

export const canCreateMoreCompanies = (
  ownedCount: number,
  plan: SubscriptionPlan,
): boolean => {
  const limit = getCompanyLimit(plan)
  if (limit === null) return true
  return ownedCount < limit
}
