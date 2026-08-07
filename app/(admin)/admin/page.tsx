"use client"

import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  Boxes,
  Building2,
  CircleDollarSign,
  ClipboardList,
  FileCheck2,
  FileInput,
  FileText,
  Gavel,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { useAdminDashboardQuery } from "@/hooks/api/use-admin-dashboard-query"
import type {
  AdminActivityItem,
  AdminActivityType,
  AdminDashboardMetrics,
} from "@/lib/api/admin"

type MetricDefinition = {
  key: keyof AdminDashboardMetrics
  label: string
  Icon: LucideIcon
  currency?: boolean
  href?: string
}

const metricDefinitions: MetricDefinition[] = [
  { key: "total_users", label: "Пользователи", Icon: Users, href: "/admin/users" },
  { key: "total_companies", label: "Компании", Icon: Building2, href: "/admin/companies" },
  { key: "catalog_items", label: "Позиции каталога", Icon: Boxes, href: "/admin/catalog" },
  { key: "active_rfqs", label: "Активные заявки", Icon: FileText, href: "/admin/rfqs" },
  { key: "active_contracts", label: "Активные контракты", Icon: FileCheck2, href: "/admin/contracts" },
  { key: "escrow_balance", label: "Баланс escrow", Icon: WalletCards, currency: true },
  { key: "open_disputes", label: "Открытые споры", Icon: Gavel, href: "/admin/disputes" },
  { key: "monthly_revenue", label: "Выручка за месяц", Icon: TrendingUp, currency: true },
]

const activityIcons: Record<AdminActivityType, LucideIcon> = {
  registration: UserPlus,
  contract: FileCheck2,
  payment: CircleDollarSign,
  dispute: AlertTriangle,
}

const activityLabels: Record<AdminActivityType, string> = {
  registration: "Регистрация",
  contract: "Контракт",
  payment: "Платёж",
  dispute: "Спор",
}

type QuickAction = {
  label: string
  href?: string
}

const quickActions: QuickAction[] = [
  { label: "Проверить компанию", href: "/admin/companies?status=pending" },
  { label: "Разрешить спор", href: "/admin/disputes" },
  { label: "Проверить жалобу", href: "/admin/moderation" },
  { label: "Заявки RFQ", href: "/admin/rfqs" },
  { label: "Предложения", href: "/admin/proposals" },
  { label: "Контракты", href: "/admin/contracts" },
]

const formatNumber = (value: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value)

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value)

const formatMetric = (value: number, currency = false) =>
  currency ? formatCurrency(value) : formatNumber(value)

const DashboardSkeleton = () => (
  <div className="mx-auto max-w-[1400px] animate-pulse space-y-6" aria-label="Загрузка дашборда">
    <div className="space-y-2">
      <div className="h-8 w-52 rounded-lg bg-muted" />
      <div className="h-4 w-80 max-w-full rounded bg-muted" />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="h-32 rounded-2xl border border-border bg-white p-5">
          <div className="h-10 w-10 rounded-xl bg-muted" />
          <div className="mt-4 h-6 w-24 rounded bg-muted" />
        </div>
      ))}
    </div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <div className="h-96 rounded-2xl border border-border bg-white" />
      <div className="h-96 rounded-2xl border border-border bg-white" />
    </div>
  </div>
)

const MetricCard = ({
  definition,
  value,
}: {
  definition: MetricDefinition
  value: number
}) => {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
          <definition.Icon size={19} aria-hidden="true" />
        </div>
        <Activity size={16} className="text-muted-foreground/45" aria-hidden="true" />
      </div>
      <p className="mt-5 text-2xl font-black tracking-tight text-foreground">
        {formatMetric(value, definition.currency)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{definition.label}</p>
    </>
  )

  if (definition.href) {
    return (
      <Link
        href={definition.href}
        className="group block rounded-2xl border border-border bg-white p-5 transition-colors hover:border-primary/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label={`Перейти к разделу: ${definition.label}`}
      >
        {content}
      </Link>
    )
  }

  return (
    <article className="rounded-2xl border border-border bg-white p-5">
      {content}
    </article>
  )
}

const ActivityRow = ({ item }: { item: AdminActivityItem }) => {
  const Icon = activityIcons[item.type]
  const happenedAt = new Date(item.happened_at)
  const hasValidDate = !Number.isNaN(happenedAt.getTime())

  return (
    <li className="flex gap-3 px-5 py-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon size={17} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{item.title}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {item.description}
            </p>
          </div>
          {hasValidDate && (
            <time
              dateTime={item.happened_at}
              className="flex-shrink-0 text-[11px] text-muted-foreground"
            >
              {formatDistanceToNow(happenedAt, { addSuffix: true, locale: ru })}
            </time>
          )}
        </div>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-primary">
          {activityLabels[item.type]}
        </p>
      </div>
    </li>
  )
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError, isFetching, refetch } = useAdminDashboardQuery()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError || !data) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-xl items-center justify-center">
        <div className="w-full rounded-2xl border border-destructive/20 bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-destructive">
            <AlertTriangle size={22} aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-xl font-black text-foreground">Не удалось загрузить данные</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Проверьте подключение к API и повторите запрос.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <RefreshCcw size={16} aria-hidden="true" />
            Повторить
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Дашборд
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ключевые показатели и последние события платформы
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:bg-secondary disabled:cursor-wait disabled:opacity-60 sm:self-auto"
          aria-label="Обновить данные дашборда"
        >
          <RefreshCcw
            size={15}
            className={isFetching ? "animate-spin" : undefined}
            aria-hidden="true"
          />
          Обновить
        </button>
      </div>

      <section aria-labelledby="metrics-title">
        <h2 id="metrics-title" className="sr-only">
          Показатели платформы
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricDefinitions.map((definition) => (
            <MetricCard
              key={definition.key}
              definition={definition}
              value={data.metrics[definition.key]}
            />
          ))}
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <section
          className="overflow-hidden rounded-2xl border border-border bg-white"
          aria-labelledby="activity-title"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 id="activity-title" className="font-black text-foreground">
                Последняя активность
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Регистрации, контракты, платежи и споры
              </p>
            </div>
            <Activity size={19} className="text-primary" aria-hidden="true" />
          </div>
          {data.recent_activity.length > 0 ? (
            <ul className="divide-y divide-border">
              {data.recent_activity.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </ul>
          ) : (
            <div className="px-5 py-14 text-center">
              <Activity size={24} className="mx-auto text-muted-foreground/40" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-foreground">Событий пока нет</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Новая активность появится здесь автоматически
              </p>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section
            className="rounded-2xl border border-border bg-white p-5"
            aria-labelledby="attention-title"
          >
            <div className="flex items-center justify-between">
              <h2 id="attention-title" className="font-black text-foreground">
                Требует внимания
              </h2>
              <ShieldCheck size={19} className="text-primary" aria-hidden="true" />
            </div>
            <div className="mt-4 space-y-3">
              <Link
                href="/admin/companies?status=pending"
                className="flex items-center gap-3 rounded-xl bg-secondary p-3.5 transition-colors hover:bg-secondary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label="Открыть компании на верификации"
              >
                <FileCheck2 size={18} className="text-primary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Верификация компаний</p>
                  <p className="text-lg font-black text-foreground">
                    {formatNumber(data.metrics.pending_verifications)}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-3 rounded-xl bg-secondary p-3.5">
                <Gavel size={18} className="text-primary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Открытые споры</p>
                  <p className="text-lg font-black text-foreground">
                    {formatNumber(data.metrics.open_disputes)}
                  </p>
                </div>
              </div>
              <Link
                href="/admin/rfqs?view=reported"
                className="flex items-center gap-3 rounded-xl bg-secondary p-3.5 transition-colors hover:bg-secondary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label="Открыть заявки с жалобами"
              >
                <ClipboardList size={18} className="text-primary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Заявки RFQ</p>
                  <p className="text-sm font-bold text-foreground">Перейти к модерации</p>
                </div>
              </Link>
              <Link
                href="/admin/proposals?view=reported"
                className="flex items-center gap-3 rounded-xl bg-secondary p-3.5 transition-colors hover:bg-secondary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label="Открыть предложения с жалобами"
              >
                <FileInput size={18} className="text-primary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Предложения</p>
                  <p className="text-sm font-bold text-foreground">Перейти к модерации</p>
                </div>
              </Link>
            </div>
          </section>

          <section
            className="rounded-2xl border border-border bg-white p-5"
            aria-labelledby="actions-title"
          >
            <h2 id="actions-title" className="font-black text-foreground">
              Быстрые действия
            </h2>
            <div className="mt-4 space-y-3">
              {quickActions.map((action) =>
                action.href ? (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center justify-between rounded-xl border border-border px-3.5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span>{action.label}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Открыть
                    </span>
                  </Link>
                ) : (
                  <div
                    key={action.label}
                    className="flex items-center justify-between rounded-xl border border-dashed border-border px-3.5 py-3 text-sm text-muted-foreground"
                  >
                    <span>{action.label}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider">Скоро</span>
                  </div>
                ),
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
