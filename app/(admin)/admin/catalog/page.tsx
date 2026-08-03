"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Package,
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
import { useAdminCatalogQuery } from "@/hooks/api/use-admin-catalog-query"
import type { AdminCatalogItem, AdminCatalogView } from "@/lib/api/admin"
import { catalogItemTypeLabel, itemStatusMeta } from "@/lib/item-display"
import { cn } from "@/lib/utils"
import type { ItemStatus } from "@/types"

const PAGE_SIZE = 20
const viewFilters: Array<{ value: AdminCatalogView; label: string }> = [
  { value: "all", label: "Все" },
  { value: "products", label: "Товары" },
  { value: "services", label: "Услуги" },
  { value: "draft", label: "Черновики" },
  { value: "reported", label: "Жалобы" },
  { value: "hidden", label: "Скрытые" },
]

const isViewFilter = (value: string | null): value is AdminCatalogView =>
  viewFilters.some((filter) => filter.value === value)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))

const ItemPreview = ({ item }: { item: AdminCatalogItem }) => (
  <div className="flex min-w-0 items-center gap-3">
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary text-primary">
      {item.preview_url && item.preview_url !== "#" ? (
        <Image
          src={item.preview_url}
          alt=""
          fill
          unoptimized
          className="object-cover"
          sizes="40px"
        />
      ) : (
        <Package size={16} aria-hidden="true" />
      )}
    </div>
    <div className="min-w-0">
      <p className="truncate font-bold text-foreground">{item.title}</p>
      <p className="truncate text-xs text-muted-foreground">
        {catalogItemTypeLabel[item.type]} · ID {item.id}
      </p>
    </div>
  </div>
)

const CatalogSkeleton = () => (
  <div className="mx-auto max-w-350 animate-pulse space-y-6" aria-label="Загрузка каталога">
    <div className="h-16 w-80 max-w-full rounded-xl bg-muted" />
    <div className="h-28 rounded-2xl bg-muted" />
    <div className="h-96 rounded-2xl bg-muted" />
  </div>
)

const AdminCatalogContent = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const view = isViewFilter(searchParams.get("view"))
    ? (searchParams.get("view") as AdminCatalogView)
    : "all"
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const query = searchParams.get("query") ?? ""
  const [searchInput, setSearchInput] = useState(query)
  const catalogQuery = useAdminCatalogQuery({
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
    if (!catalogQuery.data || page <= catalogQuery.data.pages) return
    replaceSearchParams({ page: String(catalogQuery.data.pages) })
  }, [catalogQuery.data, page, replaceSearchParams])

  if (catalogQuery.isLoading) return <CatalogSkeleton />

  if (catalogQuery.isError || !catalogQuery.data) {
    return (
      <div className="flex min-h-[55dvh] items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-destructive/20 bg-white p-8 text-center">
          <Boxes className="mx-auto text-destructive" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-black">Не удалось загрузить каталог</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Проверьте подключение к API и повторите запрос.
          </p>
          <Button type="button" className="mt-5" onClick={() => catalogQuery.refetch()}>
            <RefreshCcw aria-hidden="true" />
            Повторить
          </Button>
        </div>
      </div>
    )
  }

  const { items, pages, total, view_counts: viewCounts } = catalogQuery.data
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
            <Boxes size={21} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Каталог</h1>
            <p className="text-sm text-muted-foreground">
              Модерация товаров и услуг платформы
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Найдено <strong className="ml-1 text-foreground">{total}</strong>
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-border bg-white">
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
              placeholder="Название, описание или ID"
              className="h-11 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="Поиск по каталогу"
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
                  view === filter.value ? "bg-white/20" : "bg-muted",
                )}
              >
                {viewCounts[filter.value]}
              </span>
            </button>
          ))}
        </div>
      </section>

      {items.length === 0 ? (
        <section className="rounded-2xl border border-border bg-white px-6 py-16 text-center">
          <Search className="mx-auto text-muted-foreground/40" aria-hidden="true" />
          <h2 className="mt-4 font-black">
            {hasFilters ? "Позиции не найдены" : "Каталог пуст"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilters
              ? "Измените поисковый запрос или выбранный фильтр."
              : "Новые позиции появятся после отправки на модерацию."}
          </p>
        </section>
      ) : (
        <>
          <div className="relative hidden overflow-hidden rounded-2xl border border-border bg-white lg:block">
            {catalogQuery.isFetching && (
              <div className="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-primary" />
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Позиция</TableHead>
                  <TableHead>Владелец</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Жалобы</TableHead>
                  <TableHead>Создана</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const statusMeta = itemStatusMeta[item.status as ItemStatus] || {
                    label: item.status,
                    className: "bg-muted text-muted-foreground",
                  }
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Link
                          href={`/admin/catalog/${item.id}`}
                          className="block hover:opacity-75"
                        >
                          <ItemPreview item={item} />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          {item.owner?.company_title || item.owner?.name || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.owner?.email || "Без email"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusMeta.className}>
                          {statusMeta.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.open_reports_count}</TableCell>
                      <TableCell>{formatDate(item.created_at)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {items.map((item) => {
              const statusMeta = itemStatusMeta[item.status as ItemStatus] || {
                label: item.status,
                className: "bg-muted text-muted-foreground",
              }
              return (
                <Link
                  key={item.id}
                  href={`/admin/catalog/${item.id}`}
                  className="rounded-2xl border border-border bg-white p-4 transition-colors hover:border-primary/30"
                >
                  <ItemPreview item={item} />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className={statusMeta.className}>
                      {statusMeta.label}
                    </Badge>
                    {item.open_reports_count > 0 && (
                      <Badge variant="outline">Жалоб: {item.open_reports_count}</Badge>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.owner?.company_title || item.owner?.name || "Без владельца"} ·{" "}
                    {formatDate(item.created_at)}
                  </p>
                </Link>
              )
            })}
          </div>
        </>
      )}

      {pages > 1 && (
        <nav className="flex items-center justify-between gap-3" aria-label="Пагинация каталога">
          <Button asChild variant="outline" size="sm" disabled={page <= 1}>
            <Link href={getPageHref(Math.max(1, page - 1))} aria-disabled={page <= 1}>
              <ChevronLeft aria-hidden="true" />
              Назад
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            Страница <strong className="text-foreground">{page}</strong> из {pages}
          </span>
          <Button asChild variant="outline" size="sm" disabled={page >= pages}>
            <Link href={getPageHref(Math.min(pages, page + 1))} aria-disabled={page >= pages}>
              Вперёд
              <ChevronRight aria-hidden="true" />
            </Link>
          </Button>
        </nav>
      )}
    </div>
  )
}

export default function AdminCatalogPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <AdminCatalogContent />
    </Suspense>
  )
}
