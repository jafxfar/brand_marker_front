"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
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
import { useAdminContractsQuery } from "@/hooks/api/use-admin-contracts-query"
import type { AdminContractView } from "@/lib/api/admin"
import { contractStatusMeta } from "@/lib/contract-display"
import { cn } from "@/lib/utils"
import type { ContractStatus } from "@/types"

const PAGE_SIZE = 20
const viewFilters: Array<{ value: AdminContractView; label: string }> = [
  { value: "active", label: "Активные" },
  { value: "completed", label: "Завершённые" },
  { value: "cancelled", label: "Отменённые" },
  { value: "disputed", label: "Споры" },
]

const isViewFilter = (value: string | null): value is AdminContractView =>
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

const ContractsSkeleton = () => (
  <div className="mx-auto max-w-350 animate-pulse space-y-6" aria-label="Загрузка контрактов">
    <div className="h-16 w-80 max-w-full rounded-xl bg-muted" />
    <div className="h-28 rounded-xl bg-muted" />
    <div className="h-96 rounded-xl bg-muted" />
  </div>
)

const AdminContractsContent = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const view = isViewFilter(searchParams.get("view"))
    ? (searchParams.get("view") as AdminContractView)
    : "active"
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const query = searchParams.get("query") ?? ""
  const [searchInput, setSearchInput] = useState(query)
  const contractsQuery = useAdminContractsQuery({
    page,
    pageSize: PAGE_SIZE,
    view,
    query,
  })

  const replaceSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const nextParams = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || (key === "view" && value === "active")) {
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
    if (!contractsQuery.data || page <= contractsQuery.data.pages) return
    replaceSearchParams({ page: String(contractsQuery.data.pages) })
  }, [page, replaceSearchParams, contractsQuery.data])

  if (contractsQuery.isLoading) return <ContractsSkeleton />

  if (contractsQuery.isError || !contractsQuery.data) {
    return (
      <div className="flex min-h-[55dvh] items-center justify-center">
        <div className="w-full max-w-lg rounded-xl border border-destructive/20 bg-card p-8 text-center">
          <BookOpen className="mx-auto text-destructive" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold">Не удалось загрузить контракты</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Проверьте подключение к API и повторите запрос.
          </p>
          <Button type="button" className="mt-5" onClick={() => contractsQuery.refetch()}>
            <RefreshCcw aria-hidden="true" />
            Повторить
          </Button>
        </div>
      </div>
    )
  }

  const { items, pages, total, view_counts: viewCounts } = contractsQuery.data
  const hasFilters = view !== "active" || Boolean(query)
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
            <BookOpen size={21} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Контракты</h1>
            <p className="text-sm text-muted-foreground">
              Управление контрактами, escrow и спорами
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
              placeholder="Название, RFQ или ID"
              className="h-11 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="Поиск по контрактам"
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

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        {items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <BookOpen className="mx-auto text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-bold">Контракты не найдены</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {hasFilters
                ? "Измените фильтр или поисковый запрос."
                : "Активных контрактов пока нет."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Контракт</TableHead>
                <TableHead>Стороны</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Escrow</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((contract) => {
                const statusMeta = contractStatusMeta[contract.status as ContractStatus] || {
                  label: contract.status,
                  className: "bg-muted text-muted-foreground",
                }
                const buyerName =
                  contract.buyer?.company_title ||
                  contract.buyer?.name ||
                  contract.buyer?.display_name ||
                  "—"
                const supplierName =
                  contract.supplier?.company_title ||
                  contract.supplier?.name ||
                  contract.supplier?.display_name ||
                  "—"
                return (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <Link
                        href={`/admin/contracts/${contract.id}`}
                        className="font-semibold text-foreground hover:text-primary"
                      >
                        {contract.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        #{contract.id} · RFQ {contract.rfq_id.slice(0, 8)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{buyerName}</p>
                      <p className="text-xs text-muted-foreground">{supplierName}</p>
                    </TableCell>
                    <TableCell>
                      {formatMoney(contract.agreed_amount, contract.currency)}
                    </TableCell>
                    <TableCell>
                      {formatMoney(contract.escrow_held, contract.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusMeta.className}>
                        {statusMeta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(contract.created_at)}
                    </TableCell>
                  </TableRow>
                )
              })}
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

export default function AdminContractsPage() {
  return (
    <Suspense fallback={<ContractsSkeleton />}>
      <AdminContractsContent />
    </Suspense>
  )
}
