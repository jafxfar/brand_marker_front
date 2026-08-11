"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RefreshCcw,
  Search,
} from "lucide-react"
import {
  CompanyOperationalBadge,
  CompanyVerificationBadge,
} from "@/components/admin/companies/company-status-badges"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAdminCompaniesQuery } from "@/hooks/api/use-admin-companies-query"
import type {
  AdminCompany,
  AdminCompanyStatusFilter,
} from "@/lib/api/admin"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20
const statusFilters: Array<{ value: AdminCompanyStatusFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "verified", label: "Верифицированные" },
  { value: "pending", label: "Ожидают" },
  { value: "rejected", label: "Отклонённые" },
  { value: "blocked", label: "Заблокированные" },
]

const isStatusFilter = (value: string | null): value is AdminCompanyStatusFilter =>
  statusFilters.some((filter) => filter.value === value)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))

const CompanyIdentity = ({ company }: { company: AdminCompany }) => {
  const initials = company.title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary text-sm font-bold text-primary">
        {company.logo ? (
          <Image
            src={company.logo}
            alt=""
            fill
            unoptimized
            className="object-cover"
            sizes="40px"
          />
        ) : (
          initials
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-bold text-foreground">{company.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {company.legal_name || `ID ${company.id}`}
        </p>
      </div>
    </div>
  )
}

const CompaniesSkeleton = () => (
  <div className="mx-auto max-w-350 animate-pulse space-y-6" aria-label="Загрузка компаний">
    <div className="h-16 w-80 max-w-full rounded-xl bg-muted" />
    <div className="h-28 rounded-xl bg-muted" />
    <div className="h-96 rounded-xl bg-muted" />
  </div>
)

const AdminCompaniesContent = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const status = isStatusFilter(searchParams.get("status"))
    ? searchParams.get("status") as AdminCompanyStatusFilter
    : "all"
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const query = searchParams.get("query") ?? ""
  const [searchInput, setSearchInput] = useState(query)
  const companiesQuery = useAdminCompaniesQuery({
    page,
    pageSize: PAGE_SIZE,
    status,
    query,
  })

  const replaceSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const nextParams = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || (key === "status" && value === "all")) {
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
    if (!companiesQuery.data || page <= companiesQuery.data.pages) return
    replaceSearchParams({ page: String(companiesQuery.data.pages) })
  }, [companiesQuery.data, page, replaceSearchParams])

  if (companiesQuery.isLoading) return <CompaniesSkeleton />

  if (companiesQuery.isError || !companiesQuery.data) {
    return (
      <div className="flex min-h-[55dvh] items-center justify-center">
        <div className="w-full max-w-lg rounded-xl border border-destructive/20 bg-card p-8 text-center">
          <Building2 className="mx-auto text-destructive" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold">Не удалось загрузить компании</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Проверьте подключение к API и повторите запрос.
          </p>
          <Button type="button" className="mt-5" onClick={() => companiesQuery.refetch()}>
            <RefreshCcw aria-hidden="true" />
            Повторить
          </Button>
        </div>
      </div>
    )
  }

  const { items, pages, total, status_counts: statusCounts } = companiesQuery.data
  const hasFilters = status !== "all" || Boolean(query)
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
            <Building2 size={21} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Компании</h1>
            <p className="text-sm text-muted-foreground">
              Верификация, доступ и данные организаций
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
              placeholder="Название, юр. лицо, ИНН, владелец или ID"
              className="h-11 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="Поиск компаний"
            />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto p-3" role="tablist">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={status === filter.value}
              onClick={() =>
                replaceSearchParams({ status: filter.value, page: null })
              }
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold",
                status === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {filter.label}
              <span className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                status === filter.value ? "bg-card/20" : "bg-muted",
              )}>
                {statusCounts[filter.value]}
              </span>
            </button>
          ))}
        </div>
      </section>

      {items.length === 0 ? (
        <section className="rounded-xl border border-border bg-card px-6 py-16 text-center">
          <Search className="mx-auto text-muted-foreground/40" aria-hidden="true" />
          <h2 className="mt-4 font-bold">
            {hasFilters ? "Компании не найдены" : "Компаний пока нет"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilters
              ? "Измените поисковый запрос или выбранный статус."
              : "Зарегистрированные организации появятся здесь."}
          </p>
          {hasFilters && (
            <Button
              type="button"
              variant="outline"
              className="mt-5"
              onClick={() => {
                setSearchInput("")
                replaceSearchParams({ query: null, status: null, page: null })
              }}
            >
              Сбросить фильтры
            </Button>
          )}
        </section>
      ) : (
        <>
          <div className="relative hidden overflow-hidden rounded-xl border border-border bg-card lg:block">
            {companiesQuery.isFetching && (
              <div className="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-primary" />
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Компания</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Владелец</TableHead>
                  <TableHead>Локация</TableHead>
                  <TableHead>Статусы</TableHead>
                  <TableHead>Регистрация</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <Link href={`/admin/companies/${company.id}`} className="block hover:opacity-75">
                        <CompanyIdentity company={company} />
                      </Link>
                    </TableCell>
                    <TableCell className="capitalize">
                      {company.actor_types.map((type) =>
                        type === "buyer" ? "Заказчик" : "Поставщик",
                      ).join(", ")}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{company.owner.name || "Без имени"}</p>
                      <p className="text-xs text-muted-foreground">{company.owner.email}</p>
                    </TableCell>
                    <TableCell>
                      {[company.city, company.country].filter(Boolean).join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1.5">
                        <CompanyVerificationBadge status={company.verification_status} />
                        <CompanyOperationalBadge status={company.operational_status} />
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(company.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {items.map((company) => (
              <Link
                key={company.id}
                href={`/admin/companies/${company.id}`}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                <CompanyIdentity company={company} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <CompanyVerificationBadge status={company.verification_status} />
                  <CompanyOperationalBadge status={company.operational_status} />
                </div>
                <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <p>{company.owner.name || company.owner.email}</p>
                  <p className="flex items-center gap-1.5">
                    <MapPin size={14} aria-hidden="true" />
                    {[company.city, company.country].filter(Boolean).join(", ") || "Не указано"}
                  </p>
                  <p>{company.actor_type === "buyer" ? "Заказчик" : "Поставщик"}</p>
                  <p>{formatDate(company.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {pages > 1 && (
        <nav className="flex items-center justify-between gap-3" aria-label="Пагинация компаний">
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

export default function AdminCompaniesPage() {
  return (
    <Suspense fallback={<CompaniesSkeleton />}>
      <AdminCompaniesContent />
    </Suspense>
  )
}
