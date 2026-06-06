"use client"

import { Crown, Check, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSubscriptionStore } from "@/lib/store/subscription-store"
import { useNotificationsStore } from "@/lib/store/notifications-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { formatPrice } from "@/lib/format"
import { plans, planName } from "@/lib/subscription"

export default function SubscriptionPage() {
  const hydrated = useHydrated()
  const plan = useSubscriptionStore((s) => s.plan)
  const activeUntil = useSubscriptionStore((s) => s.activeUntil)
  const activate = useSubscriptionStore((s) => s.activate)
  const cancel = useSubscriptionStore((s) => s.cancel)
  const isActive = useSubscriptionStore((s) => s.isActive)
  const notify = useNotificationsStore((s) => s.add)

  const active = hydrated && isActive()

  const handleActivate = (planId: (typeof plans)[number]["id"], name: string) => {
    activate(planId)
    notify({
      type: "payment",
      title: "Подписка оформлена",
      body: `Тариф «${name}» активирован на 30 дней. Ваши отклики продвигаются.`,
      href: "/supplier/subscription",
    })
  }

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Crown size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Подписка для продвижения</h1>
          <p className="text-sm text-muted-foreground">Поднимайте отклики и профиль в топ</p>
        </div>
      </div>

      {/* Current status */}
      <div
        className="rounded-2xl p-5 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.055 255) 0%, oklch(0.3 0.09 255) 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
            <Crown size={20} className="text-orange-300" />
          </div>
          <div>
            <p className="text-sm font-bold">
              {active ? `Активен тариф «${planName(plan)}»` : "Подписка не активна"}
            </p>
            <p className="text-xs text-white/70 mt-0.5">
              {active && activeUntil
                ? `Действует до ${new Date(activeUntil).toLocaleDateString("ru-RU")}`
                : "Оформите тариф, чтобы продвигать предложения"}
            </p>
          </div>
        </div>
        {active && (
          <button
            onClick={cancel}
            className="h-10 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold transition-colors self-start sm:self-auto"
          >
            Отменить подписку
          </button>
        )}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => {
          const current = hydrated && active && plan === p.id
          return (
            <div
              key={p.id}
              className={cn(
                "bg-white border rounded-2xl p-6 flex flex-col relative",
                p.highlighted ? "border-primary shadow-lg" : "border-border",
              )}
            >
              {p.highlighted && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary text-white">
                  Популярный
                </span>
              )}
              <h2 className="text-lg font-black text-foreground">{p.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{p.tagline}</p>
              <div className="mt-4 mb-5">
                <span className="text-3xl font-black text-foreground">{formatPrice(p.price)}</span>
                <span className="text-sm text-muted-foreground">/мес</span>
              </div>
              <ul className="space-y-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleActivate(p.id, p.name)}
                disabled={current}
                className={cn(
                  "mt-6 h-11 rounded-xl text-sm font-bold transition-colors",
                  current
                    ? "bg-secondary text-primary cursor-default"
                    : p.highlighted
                      ? "bg-primary hover:bg-[oklch(0.58_0.22_38)] text-white"
                      : "border border-primary text-primary hover:bg-secondary",
                )}
              >
                {current ? "Текущий тариф" : "Оформить"}
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-2 mt-5 text-[11px] text-muted-foreground">
        <ShieldCheck size={14} className="text-primary flex-shrink-0" />
        Демо-оплата: реальное списание не выполняется. Подписка действует 30 дней.
      </div>
    </div>
  )
}
