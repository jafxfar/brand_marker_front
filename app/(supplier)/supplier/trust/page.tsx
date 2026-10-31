"use client"

import Link from "next/link"
import { useMemo } from "react"
import {
  ReputationBadge,
  SurfaceCard,
  TrustLevelsGrid,
  TrustShieldIcon,
} from "@/components/bm"
import { Button } from "@/components/ui/button"
import { isApiEnabled } from "@/lib/api/config"
import { useSupplierCompaniesQuery } from "@/hooks/api/use-supplier-companies-query"
import { useAuthStore } from "@/lib/store/auth-store"
import { useHydrated } from "@/hooks/use-hydrated"
import {
  resolveReputationTier,
  TRUST_LEVELS,
  type ReputationTier,
  type TrustLevelMeta,
} from "@/lib/trust-levels"
import { cn } from "@/lib/utils"

type CondItem = {
  key: string
  label: string
  value: string
  ok: boolean
  pct: number
}

function conditionsFor(
  target: TrustLevelMeta,
  stats: {
    verified: boolean
    completed: number
    rating: number
    onTime: number | null
  },
): CondItem[] {
  return [
    {
      key: "verified",
      label: "Компания проверена по документам",
      value: stats.verified ? "проверена" : "на проверке",
      ok: stats.verified,
      pct: stats.verified ? 1 : 0,
    },
    {
      key: "deals",
      label: `Не меньше ${target.minCompleted} успешных сделок`,
      value:
        stats.completed >= target.minCompleted
          ? `${stats.completed} сделок`
          : `${stats.completed} из ${target.minCompleted}`,
      ok: stats.completed >= target.minCompleted,
      pct: Math.min(1, stats.completed / Math.max(1, target.minCompleted)),
    },
    {
      key: "rating",
      label: `Рейтинг от ${target.minRating.toFixed(1)}`,
      value: stats.rating > 0 ? stats.rating.toFixed(1) : "нет оценок",
      ok: stats.rating >= target.minRating,
      pct: Math.min(1, stats.rating / Math.max(0.1, target.minRating)),
    },
    ...(target.minOnTime != null
      ? [
          {
            key: "onTime",
            label: `Поставки в срок от ${target.minOnTime}%`,
            value:
              stats.onTime == null ? "нет данных" : `${Math.round(stats.onTime)}%`,
            ok: stats.onTime != null && stats.onTime >= target.minOnTime,
            pct:
              stats.onTime == null
                ? 0
                : Math.min(1, stats.onTime / target.minOnTime),
          } satisfies CondItem,
        ]
      : []),
  ]
}

export default function SupplierTrustPage() {
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const user = useAuthStore((s) => s.user)
  const { data: companies } = useSupplierCompaniesQuery(hydrated && useApi)
  const myCompany =
    companies?.items?.find((c) => c.id === user?.activeCompanyId) ??
    companies?.items?.[0]

  const stats = useMemo(() => {
    const verified = myCompany?.verification_status === "verified"
    const completed = Number(myCompany?.stats?.completed_contracts ?? 0)
    const disputes = Number(myCompany?.stats?.disputes_count ?? 0)
    const rating = Number(
      myCompany?.stats?.average_rating ?? myCompany?.rating ?? 0,
    )
    const denom = completed + disputes
    const onTime = denom > 0 ? (completed / denom) * 100 : null
    return { verified, completed, rating, onTime }
  }, [myCompany])

  const tier: ReputationTier = resolveReputationTier({
    verification_status: myCompany?.verification_status,
    completed_contracts: stats.completed,
    rating: stats.rating,
    success_rate: stats.onTime,
  })

  const currentMeta = TRUST_LEVELS.find((t) => t.id === tier)
  const nextMeta =
    TRUST_LEVELS.find(
      (t) =>
        TRUST_LEVELS.findIndex((x) => x.id === t.id) >
        TRUST_LEVELS.findIndex((x) => x.id === tier),
    ) ?? null

  const nextConditions = nextMeta
    ? conditionsFor(nextMeta, stats)
    : tier === "none"
      ? conditionsFor(TRUST_LEVELS[0]!, stats)
      : []
  const nextPassed = nextConditions.filter((c) => c.ok).length

  return (
    <div className="grid gap-5">
      <SurfaceCard className="grid items-center gap-6 lg:grid-cols-2">
        <div className="flex items-center gap-5">
          {tier !== "none" ? (
            <TrustShieldIcon tier={tier} size={96} />
          ) : (
            <TrustShieldIcon tier="none" size={96} />
          )}
          <div>
            <span className="text-[13px] text-mute">Ваш уровень</span>
            <h2 className="flex flex-wrap items-center gap-2 text-[26px] font-extrabold leading-tight text-ink">
              {currentMeta ? `${currentMeta.name} щит` : "Пока без щита"}
              {tier !== "none" ? <ReputationBadge tier={tier} size={15} /> : null}
            </h2>
            <p className="mt-0.5 text-[14.5px] text-mute">
              {currentMeta
                ? "Проверяется автоматически — уровень сохранится, пока условия выполняются"
                : `Выполнено ${nextPassed} из ${nextConditions.length} условий для первого уровня`}
            </p>
          </div>
        </div>

        {nextMeta || tier === "none" ? (
          <div className="grid gap-3 rounded-xl bg-canvas p-4">
            <div className="flex items-center gap-3">
              <TrustShieldIcon
                tier={nextMeta?.id ?? "silver"}
                size={36}
              />
              <b className="flex-1 text-[15px] text-ink">
                {nextMeta
                  ? `До уровня «${nextMeta.name}»`
                  : "До уровня «Серебряный»"}
              </b>
              <span className="text-[13.5px] text-mute">
                {nextPassed} из {nextConditions.length}
              </span>
            </div>
            {nextConditions
              .filter((c) => !c.ok)
              .map((c) => (
                <div key={c.key} className="grid gap-1">
                  <span className="flex justify-between text-[14px]">
                    <span>{c.label}</span>
                    <b className="tnum">{c.value}</b>
                  </span>
                  {c.key !== "verified" ? (
                    <span className="h-1.5 overflow-hidden rounded-full bg-[#E3E6EB]">
                      <span
                        className={cn("block h-full rounded-full bg-brand-600")}
                        style={{ width: `${Math.round(c.pct * 100)}%` }}
                      />
                    </span>
                  ) : null}
                </div>
              ))}
            {nextConditions.every((c) => c.ok) ? (
              <p className="text-[14px] text-mute">
                Условия выполнены — уровень обновится после пересчёта.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl bg-canvas p-4 text-[14.5px] text-ink">
            У вас высший уровень щита. Так держать.
          </div>
        )}
      </SurfaceCard>

      <section className="grid gap-3">
        <h2 className="text-[18px] font-bold text-ink">Уровни щита</h2>
        <TrustLevelsGrid currentTier={tier === "none" ? null : tier} />
      </section>

      <SurfaceCard className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <p className="text-[14.5px] text-mute">
          Щит нельзя купить. Подписка отдельно повышает видимость в каталоге.
        </p>
        <Button asChild variant="outline">
          <Link href="/supplier/subscription">К тарифам подписки</Link>
        </Button>
      </SurfaceCard>
    </div>
  )
}
