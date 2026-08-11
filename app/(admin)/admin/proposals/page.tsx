"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  FileInput,
  RefreshCcw,
  Search,
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
import { useAdminProposalsQuery } from "@/hooks/api/use-admin-proposals-query"
import type { AdminProposalView } from "@/lib/api/admin"
import { proposalStatusMeta } from "@/lib/proposal-display"
import { cn } from "@/lib/utils"
import type { ProposalStatus } from "@/types"

const PAGE_SIZE = 20
const viewFilters: Array<{ value: AdminProposalView; label: string }> = [
  { value: "all", label: "Все" },
  { value: "pending", label: "Ожидают" },
  { value: "accepted", label: "Принятые" },
  { value: "rejected", label: "Отклонённые" },
  { value: "reported", label: "Жалобы" },
]

const isViewFilter = (value: string | null): value is AdminProposalView =>
  viewFilters.some((filter) => filter.value === value)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))

const formatMoney = (value: number, currency: string) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency || "RUB",
    maximumFractionDigits: 0,
  }).format(value)

const ProposalsSkeleton = () => (
  <div className="mx-auto max-w-350 animate-pulse space-y-6" aria-label="Загрузка предложений">
    <div className="h-16 w-80 max-w-full rounded-xl bg-muted" />
    <div className="h-28 rounded-xl bg-muted" />
    <div className="h-96 rounded-xl bg-muted" />
  </div>
)

const AdminProposalsContent = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const view = isViewFilter(searchParams.get("view"))
    ? (searchParams.get("view") as AdminProposalView)
    : "all"
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const query = searchParams.get("query") ?? ""
  const [searchInput, setSearchInput] = useState(query)
  const proposalsQuery = useAdminProposalsQuery({
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
    if (!proposalsQuery.data || page <= proposalsQuery.data.pages) return
    replaceSearchParams({ page: String(proposalsQuery.data.pages) })
  }, [page, proposalsQuery.data, replaceSearchParams])

  if (proposalsQuery.isLoading) return <ProposalsSkeleton />

  if (proposalsQuery.isError || !proposalsQuery.data) {
    return (
      <div className="flex min-h-[55dvh] items-center justify-center">
        <div className="w-full max-w-lg rounded-xl border border-destructive/20 bg-card p-8 text-center">
          <FileInput className="mx-auto text-destructive" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold">Не удалось загрузить предложения</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Проверьте подключение к API и повторите запрос.
          </p>
          <Button type="button" className="mt-5" onClick={() => proposalsQuery.refetch()}>
            <RefreshCcw aria-hidden="true" />
            Повторить
          </Button>
        </div>
      </div>
    )
  }

  const { items, pages, total, view_counts: viewCounts } = proposalsQuery.data
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
            <FileInput size={21} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Предложения</h1>
            <p className="text-sm text-muted-foreground">
              Модерация ответов поставщиков на RFQ
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
              placeholder="ID предложения, RFQ или текст"
              className="h-11 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="Поиск по предложениям"
            />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto p-3" role="tablist">
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

      {items.length === 0 ? (
        <section className="rounded-xl border border-border bg-card px-6 py-16 text-center">
          <Search className="mx-auto text-muted-foreground/40" aria-hidden="true" />
          <h2 className="mt-4 font-bold">
            {hasFilters ? "Предложения не найдены" : "Предложений пока нет"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilters
              ? "Измените поисковый запрос или выбранный фильтр."
              : "Новые предложения появятся после откликов поставщиков."}
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Предложение</TableHead>
                <TableHead>Поставщик</TableHead>
                <TableHead>Покупатель</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Создано</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const statusMeta = proposalStatusMeta[item.status as ProposalStatus] || {
                  label: item.status,
                  className: "bg-muted text-muted-foreground",
                }
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`/admin/proposals/${item.id}`}
                        className="block min-w-0 hover:text-primary"
                      >
                        <p className="truncate font-bold">
                          #{item.id} · {item.rfq_title || item.rfq_id.slice(0, 8)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.has_contract ? "Есть контракт" : "Без контракта"}
                          {item.open_reports_count > 0
                            ? ` · жалоб: ${item.open_reports_count}`
                            : ""}
                        </p>
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.supplier?.company_title || item.supplier?.name || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.buyer?.company_title || item.buyer?.name || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatMoney(item.price, item.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusMeta.className}>
                        {statusMeta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(item.created_at)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Страница {page} из {pages}
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" disabled={page <= 1}>
                  <Link
                    href={getPageHref(page - 1)}
                    aria-disabled={page <= 1}
                    tabIndex={page <= 1 ? -1 : 0}
                    className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
                  >
                    <ChevronLeft aria-hidden="true" />
                    Назад
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" disabled={page >= pages}>
                  <Link
                    href={getPageHref(page + 1)}
                    aria-disabled={page >= pages}
                    tabIndex={page >= pages ? -1 : 0}
                    className={page >= pages ? "pointer-events-none opacity-50" : undefined}
                  >
                    Далее
                    <ChevronRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default function AdminProposalsPage() {
  return (
    <Suspense fallback={<ProposalsSkeleton />}>
      <AdminProposalsContent />
    </Suspense>
  )
}
