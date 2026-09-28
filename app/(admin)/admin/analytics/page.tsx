"use client"

import { Suspense, useMemo } from "react"
import { BarChart3, RefreshCcw, TrendingDown, TrendingUp } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { PageFrame, PageHeader, PageSurface, SegmentedControl } from "@/components/layout"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useAdminAnalyticsQuery } from "@/hooks/api/use-admin-analytics-query"
import { useUrlTab } from "@/hooks/use-url-tab"
import type {
  AdminAnalyticsMetrics,
  AdminAnalyticsPeriod,
  AdminAnalyticsResponse,
} from "@/lib/api/admin"
import { formatCompactCurrency, formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const PERIOD_VALUES = ["30d", "90d", "12m"] as const satisfies readonly AdminAnalyticsPeriod[]

const periodOptions: Array<{ value: AdminAnalyticsPeriod; label: string }> = [
  { value: "30d", label: "30 дней" },
  { value: "90d", label: "90 дней" },
  { value: "12m", label: "12 месяцев" },
]

type MetricKey = keyof AdminAnalyticsMetrics

const totalCards: Array<{ key: MetricKey; label: string; money?: boolean }> = [
  { key: "commission", label: "Комиссия платформы", money: true },
  { key: "contract_volume", label: "Объём новых договоров", money: true },
  { key: "released", label: "Выплачено исполнителям", money: true },
  { key: "contracts", label: "Новые договоры" },
  { key: "rfqs", label: "Новые заявки" },
  { key: "users", label: "Регистрации" },
  { key: "companies", label: "Новые компании" },
]

const moneyChartConfig = {
  contract_volume: { label: "Объём договоров", color: "var(--chart-1)" },
  released: { label: "Выплачено", color: "var(--chart-2)" },
} satisfies ChartConfig

const commissionChartConfig = {
  commission: { label: "Комиссия", color: "var(--chart-1)" },
} satisfies ChartConfig

const activityChartConfig = {
  users: { label: "Регистрации", color: "var(--chart-1)" },
  companies: { label: "Компании", color: "var(--chart-2)" },
  rfqs: { label: "Заявки", color: "var(--chart-3)" },
  contracts: { label: "Договоры", color: "var(--chart-4)" },
} satisfies ChartConfig

const numberFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 })

const formatBucket = (value: string, bucket: AdminAnalyticsResponse["bucket"]) => {
  const date = new Date(value)
  if (bucket === "month") {
    return new Intl.DateTimeFormat("ru-RU", { month: "short", year: "2-digit" }).format(date)
  }
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(date)
}

const getDelta = (current: number, previous: number): number | null => {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}

const AnalyticsSkeleton = () => (
  <PageFrame className="animate-pulse" aria-label="Загрузка аналитики">
    <div className="h-16 w-80 max-w-full rounded-xl bg-muted" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {totalCards.slice(0, 4).map((card) => (
        <div key={card.key} className="h-28 rounded-xl bg-muted" />
      ))}
    </div>
    <div className="h-80 rounded-xl bg-muted" />
  </PageFrame>
)

const DeltaBadge = ({ delta }: { delta: number | null }) => {
  if (delta === null) {
    return <span className="text-xs font-medium text-muted-foreground">новое</span>
  }
  const positive = delta >= 0
  const Icon = positive ? TrendingUp : TrendingDown
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold",
        positive && "text-primary",
        !positive && "text-destructive",
      )}
    >
      <Icon size={14} aria-hidden="true" />
      {positive ? "+" : ""}
      {delta.toFixed(0)}%
      <span className="sr-only">к предыдущему периоду</span>
    </span>
  )
}

const TotalsGrid = ({ data }: { data: AdminAnalyticsResponse }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {totalCards.map((card) => {
      const value = data.totals[card.key]
      return (
        <PageSurface key={card.key} className="p-5">
          <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {card.money ? formatCurrency(value, data.currency) : numberFormatter.format(value)}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <DeltaBadge delta={getDelta(value, data.previous_totals[card.key])} />
            <span className="text-xs text-muted-foreground">к прошлому периоду</span>
          </div>
        </PageSurface>
      )
    })}
  </div>
)

const ChartCard = ({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) => (
  <PageSurface className="p-5">
    <h2 className="text-base font-bold text-foreground">{title}</h2>
    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    <div className="mt-4">{children}</div>
  </PageSurface>
)

const AdminAnalyticsContent = () => {
  const [period, setPeriod] = useUrlTab<AdminAnalyticsPeriod>("period", PERIOD_VALUES, "30d")
  const analyticsQuery = useAdminAnalyticsQuery(period)
  const data = analyticsQuery.data

  const chartData = useMemo(
    () => data?.series.map((point) => ({ ...point, label: formatBucket(point.bucket, data.bucket) })) ?? [],
    [data],
  )

  if (analyticsQuery.isLoading) return <AnalyticsSkeleton />

  if (analyticsQuery.isError || !data) {
    return (
      <div className="flex min-h-[55dvh] items-center justify-center">
        <div className="w-full max-w-lg rounded-xl border border-destructive/20 bg-card p-8 text-center">
          <BarChart3 className="mx-auto text-destructive" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold">Не удалось загрузить аналитику</h1>
          <Button type="button" className="mt-5" onClick={() => analyticsQuery.refetch()}>
            <RefreshCcw aria-hidden="true" />
            Повторить
          </Button>
        </div>
      </div>
    )
  }

  const moneyTick = (value: number) => formatCompactCurrency(value, data.currency)
  const moneyTooltip = (value: unknown) => formatCurrency(Number(value), data.currency)

  return (
    <PageFrame>
      <PageHeader
        title="Аналитика"
        description={`Динамика платформы. Денежные показатели — в ${data.currency}`}
        actions={
          <SegmentedControl
            value={period}
            options={periodOptions}
            onChange={setPeriod}
            ariaLabel="Период аналитики"
          />
        }
      />

      <div className={cn("space-y-6 transition-opacity", analyticsQuery.isFetching && "opacity-60")}>
        <TotalsGrid data={data} />

        <ChartCard title="Оборот" description="Сумма новых договоров и выплат исполнителям">
          <ChartContainer config={moneyChartConfig} className="aspect-auto h-72 w-full">
            <AreaChart data={chartData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis tickLine={false} axisLine={false} width={72} tickFormatter={moneyTick} />
              <ChartTooltip content={<ChartTooltipContent formatter={moneyTooltip} />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                dataKey="contract_volume"
                type="monotone"
                stroke="var(--color-contract_volume)"
                fill="var(--color-contract_volume)"
                fillOpacity={0.15}
              />
              <Area
                dataKey="released"
                type="monotone"
                stroke="var(--color-released)"
                fill="var(--color-released)"
                fillOpacity={0.15}
              />
            </AreaChart>
          </ChartContainer>
        </ChartCard>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Комиссия платформы" description="Удержано при выплатах этапов">
            <ChartContainer config={commissionChartConfig} className="aspect-auto h-64 w-full">
              <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis tickLine={false} axisLine={false} width={72} tickFormatter={moneyTick} />
                <ChartTooltip content={<ChartTooltipContent formatter={moneyTooltip} />} />
                <Bar dataKey="commission" fill="var(--color-commission)" radius={4} />
              </BarChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Активность" description="Регистрации, компании, заявки и договоры">
            <ChartContainer config={activityChartConfig} className="aspect-auto h-64 w-full">
              <LineChart data={chartData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis tickLine={false} axisLine={false} width={40} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {(Object.keys(activityChartConfig) as Array<keyof typeof activityChartConfig>).map((key) => (
                  <Line
                    key={key}
                    dataKey={key}
                    type="monotone"
                    stroke={`var(--color-${key})`}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </ChartCard>
        </div>
      </div>
    </PageFrame>
  )
}

export default function AdminAnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AdminAnalyticsContent />
    </Suspense>
  )
}
