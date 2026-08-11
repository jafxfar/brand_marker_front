"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Search,
  ShieldCheck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAdminReportsQuery } from "@/hooks/api/use-admin-reports-query"
import type { AdminReportView } from "@/lib/api/admin"
import {
  adminLabel,
  adminReportReasonLabels,
  adminReportTargetLabels,
} from "@/lib/admin-display"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20
const viewFilters: Array<{ value: AdminReportView; label: string }> = [
  { value: "all", label: "Все" },
  { value: "spam", label: "Spam" },
  { value: "fraud", label: "Fraud" },
  { value: "counterfeit", label: "Counterfeit" },
  { value: "abuse", label: "Abuse" },
  { value: "other", label: "Other" },
]

const isViewFilter = (value: string | null): value is AdminReportView =>
  viewFilters.some((filter) => filter.value === value)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))

const ReportsSkeleton = () => (
  <div className="mx-auto max-w-350 animate-pulse space-y-6" aria-label="Загрузка жалоб">
    <div className="h-16 w-80 max-w-full rounded-xl bg-muted" />
    <div className="h-28 rounded-xl bg-muted" />
    <div className="h-96 rounded-xl bg-muted" />
  </div>
)

const AdminReportsContent = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const view = isViewFilter(searchParams.get("view"))
    ? (searchParams.get("view") as AdminReportView)
    : "all"
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const query = searchParams.get("query") ?? ""
  const [searchInput, setSearchInput] = useState(query)
  const reportsQuery = useAdminReportsQuery({
    page,
    pageSize: PAGE_SIZE,
    view,
    query,
  })

  const replaceSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const nextParams = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || (key === "view" && value === "all")) {
          nextParams.delete(key)
        } else {
          nextParams.set(key, value)
        }
      })
      const nextQuery = nextParams.toString()
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname)
    },
    [pathname, router, searchParams],
  )

  useEffect(() => {
    setSearchInput(query)
  }, [query])

  useEffect(() => {
    if (searchInput === query) return
    const timeout = window.setTimeout(() => {
      replaceSearchParams({ query: searchInput.trim() || null, page: null })
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [query, replaceSearchParams, searchInput])

  useEffect(() => {
    if (!reportsQuery.data || page <= reportsQuery.data.pages) return
    replaceSearchParams({ page: String(reportsQuery.data.pages) })
  }, [page, replaceSearchParams, reportsQuery.data])

  if (reportsQuery.isLoading) return <ReportsSkeleton />

  if (reportsQuery.isError || !reportsQuery.data) {
    return (
      <div className="flex min-h-[55dvh] items-center justify-center">
        <div className="w-full max-w-lg rounded-xl border border-destructive/20 bg-card p-8 text-center">
          <ShieldCheck className="mx-auto text-destructive" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold">Не удалось загрузить жалобы</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Проверьте подключение к API и повторите запрос.
          </p>
          <Button type="button" className="mt-5" onClick={() => reportsQuery.refetch()}>
            <RefreshCcw aria-hidden="true" />
            Повторить
          </Button>
        </div>
      </div>
    )
  }

  const { items, pages, total, view_counts: viewCounts } = reportsQuery.data
  const hasFilters = view !== "all" || Boolean(query)
  const getPageHref = (targetPage: number) => {
    const nextParams = new URLSearchParams(searchParams.toString())
    if (targetPage <= 1) nextParams.delete("page")
    else nextParams.set("page", String(targetPage))
    const nextQuery = nextParams.toString()
    return nextQuery ? `${pathname}?${nextQuery}` : pathname
  }

  return (
    <div className="mx-auto max-w-350 space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
            <ShieldCheck size={21} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reports</h1>
            <p className="text-sm text-muted-foreground">
              Единый inbox жалоб на каталог, RFQ и предложения
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Найдено <strong className="ml-1 text-foreground">{total}</strong>
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Объект, email, детали жалобы"
              className="h-11 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="Поиск по жалобам"
            />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto p-3" role="tablist" aria-label="Типы жалоб">
          {viewFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={view === filter.value}
              onClick={() => replaceSearchParams({ view: filter.value, page: null })}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold",
                view === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {filter.label}
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                  view === filter.value ? "bg-card/20" : "bg-muted",
                )}
              >
                {viewCounts[filter.value]}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        {items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ShieldCheck className="mx-auto text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-bold">Жалобы не найдены</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {hasFilters
                ? "Измените тип или поисковый запрос."
                : "Открытых жалоб пока нет."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Объект</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Причина</TableHead>
                <TableHead>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((report) => (
                <TableRow key={`${report.target_type}-${report.id}`}>
                  <TableCell>
                    <Link
                      href={`/admin/moderation/${report.target_type}/${report.id}`}
                      className="font-semibold text-foreground hover:text-primary"
                    >
                      {report.reported_object.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {adminLabel(adminReportTargetLabels, report.target_type)} · #
                      {report.id}
                    </p>
                    {report.details_preview && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {report.details_preview}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {adminLabel(adminReportTargetLabels, report.target_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{report.reporter.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.reporter.email}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {adminLabel(adminReportReasonLabels, report.reason)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(report.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Страница {page} из {pages}
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" disabled={page <= 1}>
                <Link
                  href={getPageHref(page - 1)}
                  aria-label="Предыдущая страница"
                  tabIndex={page <= 1 ? -1 : 0}
                >
                  <ChevronLeft aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" disabled={page >= pages}>
                <Link
                  href={getPageHref(page + 1)}
                  aria-label="Следующая страница"
                  tabIndex={page >= pages ? -1 : 0}
                >
                  <ChevronRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default function AdminModerationPage() {
  return (
    <Suspense fallback={<ReportsSkeleton />}>
      <AdminReportsContent />
    </Suspense>
  )
}
