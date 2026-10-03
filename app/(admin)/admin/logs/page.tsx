"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, RefreshCcw, ScrollText, Search } from "lucide-react"
import { formatLogDateTime, LogDetailsSheet } from "@/components/admin/logs/log-details-sheet"
import {
  PageEmptyState,
  PageFrame,
  PageHeader,
  PageSurface,
  SegmentedControl,
} from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAdminLogsQuery } from "@/hooks/api/use-admin-logs-query"
import {
  getLogUserRoleLabel,
  LOG_AUDIENCE_LABELS,
  LOG_KIND_LABELS,
  LOG_PERIOD_LABELS,
  LOG_SECTION_LABELS,
  LOG_STATUS_META,
} from "@/lib/admin-log-labels"
import type {
  AdminLogAudience,
  AdminLogItem,
  AdminLogKind,
  AdminLogPeriod,
  AdminLogSection,
  AdminLogStatus,
} from "@/lib/api/admin"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 25
const ALL_VALUE = "all"
const DEFAULT_PERIOD: AdminLogPeriod = "7d"
const SEARCH_DEBOUNCE_MS = 350

const AUDIENCES = Object.keys(LOG_AUDIENCE_LABELS) as AdminLogAudience[]
const KINDS = Object.keys(LOG_KIND_LABELS) as AdminLogKind[]
const SECTIONS = Object.keys(LOG_SECTION_LABELS) as AdminLogSection[]
const STATUSES = Object.keys(LOG_STATUS_META) as AdminLogStatus[]
const PERIODS = Object.keys(LOG_PERIOD_LABELS) as AdminLogPeriod[]

const pickOption = <T extends string>(value: string | null, options: readonly T[]): T | null =>
  value && (options as readonly string[]).includes(value) ? (value as T) : null

const LogsSkeleton = () => (
  <PageFrame className="animate-pulse" aria-label="Загрузка журнала">
    <div className="h-16 w-80 max-w-full rounded-xl bg-muted" />
    <div className="h-28 rounded-xl bg-muted" />
    <div className="h-96 rounded-xl bg-muted" />
  </PageFrame>
)

const LogStatusBadge = ({ status }: { status: AdminLogStatus }) => (
  <Badge
    variant="outline"
    className={LOG_STATUS_META[status].className}
    title={LOG_STATUS_META[status].hint}
  >
    {LOG_STATUS_META[status].label}
  </Badge>
)

const LogActor = ({ log }: { log: AdminLogItem }) => {
  if (!log.user) {
    return (
      <div className="min-w-0">
        <p className="font-semibold text-foreground">Гость</p>
        {log.guest_email && (
          <p className="max-w-56 truncate text-xs text-muted-foreground">{log.guest_email}</p>
        )}
      </div>
    )
  }
  return (
    <div className="min-w-0">
      <p className="max-w-56 truncate font-semibold text-foreground">{log.user.name}</p>
      <p className="max-w-56 truncate text-xs text-muted-foreground">
        {log.user.email} · {getLogUserRoleLabel(log.user.role)}
      </p>
    </div>
  )
}

type FilterSelectProps<T extends string> = {
  id: string
  label: string
  value: T | null
  options: readonly T[]
  labels: Record<T, string>
  allLabel?: string
  onChange: (value: T | null) => void
}

const FilterSelect = <T extends string>({
  id,
  label,
  value,
  options,
  labels,
  allLabel,
  onChange,
}: FilterSelectProps<T>) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
      {label}
    </label>
    <Select
      value={value ?? ALL_VALUE}
      onValueChange={(next) => onChange(next === ALL_VALUE ? null : (next as T))}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allLabel && <SelectItem value={ALL_VALUE}>{allLabel}</SelectItem>}
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {labels[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

const STATUS_LABELS = Object.fromEntries(
  STATUSES.map((status) => [status, LOG_STATUS_META[status].label]),
) as Record<AdminLogStatus, string>

const AdminLogsContent = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const audience = pickOption(searchParams.get("audience"), AUDIENCES) ?? "users"
  const kind = pickOption(searchParams.get("kind"), KINDS)
  const section = pickOption(searchParams.get("section"), SECTIONS)
  const status = pickOption(searchParams.get("status"), STATUSES)
  const period = pickOption(searchParams.get("period"), PERIODS) ?? DEFAULT_PERIOD
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const query = searchParams.get("query") ?? ""

  const [searchInput, setSearchInput] = useState(query)
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null)

  const logsQuery = useAdminLogsQuery({
    page,
    pageSize: PAGE_SIZE,
    audience,
    kind,
    section,
    status,
    period,
    query,
  })

  const replaceSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const nextParams = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          nextParams.set(key, value)
          return
        }
        nextParams.delete(key)
      })
      const nextQuery = nextParams.toString()
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname)
    },
    [pathname, router, searchParams],
  )

  useEffect(() => {
    if (searchInput === query) return
    const timeout = window.setTimeout(() => {
      replaceSearchParams({ query: searchInput.trim() || null, page: null })
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timeout)
  }, [query, replaceSearchParams, searchInput])

  useEffect(() => {
    setSearchInput(query)
  }, [query])

  useEffect(() => {
    if (!logsQuery.data || page <= logsQuery.data.pages) return
    replaceSearchParams({ page: String(logsQuery.data.pages) })
  }, [logsQuery.data, page, replaceSearchParams])

  const handleFilterChange = (key: string) => (value: string | null) => {
    replaceSearchParams({ [key]: value, page: null })
  }

  const handlePeriodChange = (value: AdminLogPeriod | null) => {
    replaceSearchParams({
      period: !value || value === DEFAULT_PERIOD ? null : value,
      page: null,
    })
  }

  const handleAudienceChange = (value: AdminLogAudience) => {
    replaceSearchParams({ audience: value === "users" ? null : value, page: null })
  }

  const handleReset = () => {
    setSearchInput("")
    replaceSearchParams({
      kind: null,
      section: null,
      status: null,
      period: null,
      query: null,
      page: null,
    })
  }

  const handlePageChange = (targetPage: number) => {
    replaceSearchParams({ page: targetPage <= 1 ? null : String(targetPage) })
  }

  if (logsQuery.isLoading) return <LogsSkeleton />

  if (logsQuery.isError || !logsQuery.data) {
    return (
      <div className="flex min-h-[55dvh] items-center justify-center">
        <div className="w-full max-w-lg rounded-xl border border-destructive/20 bg-card p-8 text-center">
          <ScrollText className="mx-auto text-destructive" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold">Не удалось загрузить журнал</h1>
          <Button type="button" className="mt-5" onClick={() => logsQuery.refetch()}>
            <RefreshCcw aria-hidden="true" />
            Повторить
          </Button>
        </div>
      </div>
    )
  }

  const { items, total, pages, audience_counts: audienceCounts } = logsQuery.data
  const hasFilters = Boolean(kind || section || status || query || period !== DEFAULT_PERIOD)

  return (
    <PageFrame>
      <PageHeader
        title="Журнал действий"
        description="Что делали пользователи и сотрудники на платформе и чем это закончилось"
        actions={
          <p className="text-sm text-muted-foreground">
            Найдено <strong className="ml-1 text-foreground">{total}</strong>
          </p>
        }
      />

      <PageSurface aria-label="Фильтры журнала">
        <div className="border-b border-border p-3">
          <SegmentedControl
            value={audience}
            options={AUDIENCES.map((value) => ({
              value,
              label: LOG_AUDIENCE_LABELS[value],
              count: audienceCounts[value],
            }))}
            onChange={handleAudienceChange}
            ariaLabel="Чьи действия показывать"
            className="w-full max-w-full border-0 bg-transparent p-0"
          />
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            id="log-kind"
            label="Действие"
            value={kind}
            options={KINDS}
            labels={LOG_KIND_LABELS}
            allLabel="Все действия"
            onChange={handleFilterChange("kind")}
          />
          <FilterSelect
            id="log-section"
            label="Раздел"
            value={section}
            options={SECTIONS}
            labels={LOG_SECTION_LABELS}
            allLabel="Все разделы"
            onChange={handleFilterChange("section")}
          />
          <FilterSelect
            id="log-status"
            label="Результат"
            value={status}
            options={STATUSES}
            labels={STATUS_LABELS}
            allLabel="Любой результат"
            onChange={handleFilterChange("status")}
          />
          <FilterSelect
            id="log-period"
            label="Период"
            value={period}
            options={PERIODS}
            labels={LOG_PERIOD_LABELS}
            onChange={handlePeriodChange}
          />
        </div>
        <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Имя или email"
              maxLength={255}
              className="pl-11"
              aria-label="Поиск по имени или email"
            />
          </div>
          {hasFilters && (
            <Button type="button" variant="outline" onClick={handleReset}>
              Сбросить фильтры
            </Button>
          )}
        </div>
      </PageSurface>

      {items.length === 0 ? (
        <PageSurface>
          <PageEmptyState
            icon={<ScrollText aria-hidden="true" />}
            title="Записей не найдено"
            description={
              hasFilters
                ? "Измените фильтры или выберите больший период."
                : "Здесь появятся действия, как только они будут совершены."
            }
          />
        </PageSurface>
      ) : (
        <PageSurface
          className={cn(logsQuery.isFetching && "opacity-70")}
          aria-busy={logsQuery.isFetching}
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/35 hover:bg-muted/35">
                  <TableHead className="px-5">Время</TableHead>
                  <TableHead>Кто</TableHead>
                  <TableHead>Действие</TableHead>
                  <TableHead>Объект</TableHead>
                  <TableHead className="px-5">Результат</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((log) => (
                  <TableRow
                    key={log.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`Подробности: ${LOG_KIND_LABELS[log.kind]}, ${LOG_SECTION_LABELS[log.section]}`}
                    className="cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                    onClick={() => setSelectedLogId(log.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        setSelectedLogId(log.id)
                      }
                    }}
                  >
                    <TableCell className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                      {formatLogDateTime(log.created_at)}
                    </TableCell>
                    <TableCell>
                      <LogActor log={log} />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{LOG_KIND_LABELS[log.kind]}</p>
                      <p className="text-xs text-muted-foreground">
                        {LOG_SECTION_LABELS[log.section]}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.object_id ? `№ ${log.object_id}` : "—"}
                    </TableCell>
                    <TableCell className="px-5">
                      <LogStatusBadge status={log.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </PageSurface>
      )}

      {items.length > 0 && pages > 1 && (
        <nav className="flex items-center justify-between gap-3" aria-label="Страницы журнала">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          >
            <ChevronLeft aria-hidden="true" />
            Назад
          </Button>
          <span className="text-sm text-muted-foreground">
            Страница {page} из {pages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= pages}
            onClick={() => handlePageChange(page + 1)}
          >
            Далее
            <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      )}

      <LogDetailsSheet logId={selectedLogId} onClose={() => setSelectedLogId(null)} />
    </PageFrame>
  )
}

export default function AdminLogsPage() {
  return (
    <Suspense fallback={<LogsSkeleton />}>
      <AdminLogsContent />
    </Suspense>
  )
}
