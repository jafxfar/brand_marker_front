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
import { resolveFileUrl } from "@/lib/file-url"
import { PageEmptyState, PageFrame, PageHeader, PageSurface, SegmentedControl } from "@/components/layout"
import { Input } from "@/components/ui/input"

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
            src={resolveFileUrl(company.logo)}
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
  <PageFrame className="animate-pulse" aria-label="Загрузка компаний">
    <div className="h-16 w-80 max-w-full rounded-xl bg-muted" />
    <div className="h-28 rounded-xl bg-muted" />
    <div className="h-96 rounded-xl bg-muted" />
  </PageFrame>
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
    <PageFrame>
      <PageHeader
        title="Компании"
        description="Верификация, доступ и данные организаций"
        actions={<p className="text-sm text-muted-foreground">
          Найдено <strong className="ml-1 text-foreground">{total}</strong>
        </p>}
      />

      <PageSurface>
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Название, юр. лицо, ИНН, владелец или ID"
              className="pl-11"
              aria-label="Поиск компаний"
            />
          </div>
        </div>
        <div className="p-3">
          <SegmentedControl
            value={status}
            options={statusFilters.map((filter) => ({
              ...filter,
              count: statusCounts[filter.value],
            }))}
            onChange={(next) => replaceSearchParams({ status: next, page: null })}
            className="w-full max-w-full border-0 bg-transparent p-0"
          />
        </div>
      </PageSurface>

      {items.length === 0 ? (
        <PageSurface>
          <PageEmptyState
            title={hasFilters ? "Компании не найдены" : "Компаний пока нет"}
            description={hasFilters
              ? "Измените поисковый запрос или выбранный статус."
              : "Зарегистрированные организации появятся здесь."}
          />
          {hasFilters && (
            <div className="flex justify-center pb-10">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchInput("")
                  replaceSearchParams({ query: null, status: null, page: null })
                }}
              >
                Сбросить фильтры
              </Button>
            </div>
          )}
        </PageSurface>
      ) : (
        <>
          <PageSurface className="relative hidden lg:block">
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
          </PageSurface>

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
    </PageFrame>
  )
}

export default function AdminCompaniesPage() {
  return (
    <Suspense fallback={<CompaniesSkeleton />}>
      <AdminCompaniesContent />
    </Suspense>
  )
}
