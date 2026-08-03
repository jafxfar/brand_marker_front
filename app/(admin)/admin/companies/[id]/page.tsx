"use client"

import { use, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Ban,
  Building2,
  CheckCircle2,
  FileQuestion,
  PauseCircle,
  RefreshCcw,
  RotateCcw,
  Star,
  XCircle,
} from "lucide-react"
import { CompanyActionDialog } from "@/components/admin/companies/company-action-dialog"
import { AdminCompanyDetailSections } from "@/components/admin/companies/company-detail-sections"
import {
  CompanyOperationalBadge,
  CompanyVerificationBadge,
} from "@/components/admin/companies/company-status-badges"
import { Button } from "@/components/ui/button"
import { useAdminCompanyQuery } from "@/hooks/api/use-admin-companies-query"
import type { AdminCompanyAction } from "@/lib/api/admin"
import { useAuthStore } from "@/lib/store/auth-store"

const sections = [
  ["overview", "Обзор"],
  ["legal", "Юр. информация"],
  ["documents", "Документы"],
  ["certificates", "Сертификаты"],
  ["members", "Участники"],
  ["products", "Товары"],
  ["services", "Услуги"],
  ["contracts", "Контракты"],
  ["reviews", "Отзывы"],
] as const

const DetailSkeleton = () => (
  <div className="mx-auto max-w-350 animate-pulse space-y-5">
    <div className="h-5 w-36 rounded bg-muted" />
    <div className="h-56 rounded-2xl bg-muted" />
    <div className="h-14 rounded-2xl bg-muted" />
    <div className="h-80 rounded-2xl bg-muted" />
  </div>
)

type PageProps = {
  params: Promise<{ id: string }>
}

export default function AdminCompanyDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const companyId = Number(id)
  const companyQuery = useAdminCompanyQuery(companyId)
  const currentUser = useAuthStore((state) => state.user)
  const [selectedAction, setSelectedAction] = useState<AdminCompanyAction | null>(null)

  if (!Number.isInteger(companyId) || companyId <= 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-white p-8 text-center">
        <h1 className="text-xl font-black">Некорректный ID компании</h1>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/admin/companies">Вернуться к списку</Link>
        </Button>
      </div>
    )
  }

  if (companyQuery.isLoading) return <DetailSkeleton />

  if (companyQuery.isError || !companyQuery.data) {
    return (
      <div className="mx-auto flex min-h-[55dvh] max-w-lg items-center justify-center">
        <div className="w-full rounded-2xl border border-border bg-white p-8 text-center">
          <Building2 className="mx-auto text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-black">Компания не найдена</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Запись удалена, недоступна или API временно не отвечает.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/companies">К списку</Link>
            </Button>
            <Button type="button" onClick={() => companyQuery.refetch()}>
              <RefreshCcw aria-hidden="true" />
              Повторить
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const company = companyQuery.data
  const isModerator = currentUser?.platformRole === "moderator"
  const initials = company.title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
  const stats = [
    { label: "Рейтинг", value: company.rating.toFixed(1), Icon: Star },
    {
      label: "Завершено контрактов",
      value: company.stats?.completed_contracts ?? 0,
      Icon: CheckCircle2,
    },
    {
      label: "Активные контракты",
      value: company.stats?.active_contracts ?? 0,
      Icon: RefreshCcw,
    },
    {
      label: "Споры",
      value: company.stats?.disputes_count ?? 0,
      Icon: FileQuestion,
    },
  ]

  return (
    <div className="mx-auto max-w-350 space-y-5">
      <Link
        href="/admin/companies"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Все компании
      </Link>

      <header className="rounded-2xl border border-border bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-secondary text-xl font-black text-primary">
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt=""
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Компания #{company.id}
              </p>
              <h1 className="mt-1 truncate text-2xl font-black tracking-tight sm:text-3xl">
                {company.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {company.owner.name || company.owner.email} ·{" "}
                {company.actor_types
                  .map((type) => type === "buyer" ? "Заказчик" : "Поставщик")
                  .join(", ")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <CompanyVerificationBadge status={company.verification_status} />
                <CompanyOperationalBadge status={company.operational_status} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 xl:max-w-xl xl:justify-end">
            {company.verification_status !== "verified" && (
              <Button type="button" size="sm" onClick={() => setSelectedAction("approve")}>
                <CheckCircle2 aria-hidden="true" />
                Одобрить
              </Button>
            )}
            {company.verification_status !== "rejected" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setSelectedAction("reject")}
              >
                <XCircle aria-hidden="true" />
                Отклонить
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSelectedAction("request_documents")}
            >
              <FileQuestion aria-hidden="true" />
              Запросить документы
            </Button>
            {!isModerator && company.operational_status === "active" && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setSelectedAction("block")}
                >
                  <Ban aria-hidden="true" />
                  Заблокировать
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedAction("deactivate")}
                >
                  <PauseCircle aria-hidden="true" />
                  Деактивировать
                </Button>
              </>
            )}
            {!isModerator && company.operational_status !== "active" && (
              <Button
                type="button"
                size="sm"
                onClick={() => setSelectedAction("reactivate")}
              >
                <RotateCcw aria-hidden="true" />
                Активировать
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, Icon }) => (
            <div key={label} className="rounded-xl bg-secondary/70 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Icon size={15} aria-hidden="true" />
                {label}
              </div>
              <p className="mt-2 text-2xl font-black">{value}</p>
            </div>
          ))}
        </div>
      </header>

      <nav
        className="sticky top-17 z-20 flex gap-1 overflow-x-auto rounded-2xl border border-border bg-white/95 p-2 backdrop-blur"
        aria-label="Разделы карточки компании"
      >
        {sections.map(([sectionId, label]) => (
          <a
            key={sectionId}
            href={`#${sectionId}`}
            className="shrink-0 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {label}
          </a>
        ))}
      </nav>

      <AdminCompanyDetailSections company={company} />

      <CompanyActionDialog
        companyId={company.id}
        companyTitle={company.title}
        action={selectedAction}
        onOpenChange={(open) => {
          if (!open) setSelectedAction(null)
        }}
      />
    </div>
  )
}
