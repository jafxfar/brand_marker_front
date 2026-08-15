"use client"

import { Crown, Check, ShieldCheck } from "lucide-react"
import { PageFrame, PageHeader } from "@/components/layout"
import { cn } from "@/lib/utils"
import { useSubscriptionStore } from "@/lib/store/subscription-store"
import { useNotificationsStore } from "@/lib/store/notifications-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import {
  useActivateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useSupplierSubscriptionQuery,
} from "@/hooks/api/use-supplier-subscription-query"
import { formatPrice } from "@/lib/format"
import { plans, planName } from "@/lib/subscription"
import type { SubscriptionPlan } from "@/lib/store/subscription-store"

export default function SubscriptionPage() {
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const localPlan = useSubscriptionStore((s) => s.plan)
  const activeUntil = useSubscriptionStore((s) => s.activeUntil)
  const activate = useSubscriptionStore((s) => s.activate)
  const cancel = useSubscriptionStore((s) => s.cancel)
  const isActive = useSubscriptionStore((s) => s.isActive)
  const notify = useNotificationsStore((s) => s.add)

  const { data: apiSub } = useSupplierSubscriptionQuery(hydrated && useApi)
  const activateMutation = useActivateSubscriptionMutation()
  const cancelMutation = useCancelSubscriptionMutation()

  const plan = (useApi ? (apiSub?.plan ?? "none") : localPlan) as SubscriptionPlan
  const active = useApi ? Boolean(apiSub?.is_active) : hydrated && isActive()
  const until = useApi ? apiSub?.active_until : activeUntil

  const handleActivate = async (planId: (typeof plans)[number]["id"], name: string) => {
    if (useApi) {
      await activateMutation.mutateAsync(planId)
    } else {
      activate(planId)
    }
    notify({
      type: "payment",
      title: "Подписка оформлена",
      body: `Тариф «${name}» активирован на 30 дней. Ваши отклики продвигаются.`,
      href: "/supplier/subscription",
    })
  }

  const handleCancel = async () => {
    if (useApi) {
      await cancelMutation.mutateAsync()
      return
    }
    cancel()
  }

  return (
    <PageFrame>
      <PageHeader
        title="Подписка для продвижения"
        description="Поднимайте отклики и профиль в топ"
      />

      <div
        className="rounded-xl p-5 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: "linear-gradient(135deg, oklch(0.20 0.06 155) 0%, oklch(0.32 0.09 150) 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-card/15 flex items-center justify-center">
            <Crown size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold">
              {active ? `Активен тариф «${planName(plan)}»` : "Подписка не активна"}
            </p>
            <p className="text-xs text-white/70 mt-0.5">
              {active && until
                ? `Действует до ${new Date(until).toLocaleDateString("ru-RU")}`
                : "Оформите тариф, чтобы продвигать предложения"}
            </p>
          </div>
        </div>
        {active && (
          <button
            type="button"
            onClick={handleCancel}
            className="h-10 px-4 rounded-xl bg-card/15 hover:bg-card/25 text-white text-sm font-semibold transition-colors self-start sm:self-auto"
          >
            Отменить подписку
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => {
          const current = hydrated && active && plan === p.id
          return (
            <div
              key={p.id}
              className={cn(
                "bg-card border rounded-xl p-6 flex flex-col relative",
                p.highlighted ? "border-primary shadow-lg" : "border-border",
              )}
            >
              {p.highlighted && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                  Популярный
                </span>
              )}
              <h2 className="text-lg font-bold text-foreground">{p.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{p.tagline}</p>
              <div className="mt-4 mb-5">
                <span className="text-3xl font-bold text-foreground">{formatPrice(p.price)}</span>
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
                type="button"
                onClick={() => handleActivate(p.id, p.name)}
                disabled={current}
                className={cn(
                  "mt-6 h-11 rounded-xl text-sm font-bold transition-colors",
                  current
                    ? "bg-secondary text-primary cursor-default"
                    : p.highlighted
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
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
    </PageFrame>
  )
}
