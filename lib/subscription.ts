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
    ],
  },
]

export const planName = (plan: SubscriptionPlan): string =>
  plan === "none" ? "Нет подписки" : plans.find((p) => p.id === plan)?.name ?? plan
