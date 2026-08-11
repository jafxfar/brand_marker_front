"use client"

import { use, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  EyeOff,
  FilePenLine,
  Package,
  RefreshCcw,
  Trash2,
} from "lucide-react"
import { CatalogActionDialog } from "@/components/admin/catalog/catalog-action-dialog"
import { AdminCatalogDetailSections } from "@/components/admin/catalog/catalog-detail-sections"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAdminCatalogItemQuery } from "@/hooks/api/use-admin-catalog-query"
import type { AdminCatalogAction } from "@/lib/api/admin"
import { catalogItemTypeLabel, itemStatusMeta } from "@/lib/item-display"
import { useAuthStore } from "@/lib/store/auth-store"
import type { ItemStatus } from "@/types"

const sections = [
  ["images", "Изображения"],
  ["description", "Описание"],
  ["attributes", "Атрибуты"],
  ["owner", "Владелец"],
  ["reports", "Жалобы"],
  ["history", "История"],
] as const

const DetailSkeleton = () => (
  <div className="mx-auto max-w-350 animate-pulse space-y-5">
    <div className="h-5 w-36 rounded bg-muted" />
    <div className="h-56 rounded-xl bg-muted" />
    <div className="h-14 rounded-xl bg-muted" />
    <div className="h-80 rounded-xl bg-muted" />
  </div>
)

type PageProps = {
  params: Promise<{ id: string }>
}

export default function AdminCatalogDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const itemId = Number(id)
  const itemQuery = useAdminCatalogItemQuery(itemId)
  const currentUser = useAuthStore((state) => state.user)
  const [selectedAction, setSelectedAction] = useState<AdminCatalogAction | null>(null)

  if (!Number.isInteger(itemId) || itemId <= 0) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-8 text-center">
        <h1 className="text-xl font-bold">Некорректный ID позиции</h1>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/admin/catalog">Вернуться к каталогу</Link>
        </Button>
      </div>
    )
  }

  if (itemQuery.isLoading) return <DetailSkeleton />

  if (itemQuery.isError || !itemQuery.data) {
    return (
      <div className="mx-auto flex min-h-[55dvh] max-w-lg items-center justify-center">
        <div className="w-full rounded-xl border border-border bg-card p-8 text-center">
          <Boxes className="mx-auto text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold">Позиция не найдена</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Запись удалена, недоступна или API временно не отвечает.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/catalog">К списку</Link>
            </Button>
            <Button type="button" onClick={() => itemQuery.refetch()}>
              <RefreshCcw aria-hidden="true" />
              Повторить
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const item = itemQuery.data
  const isModerator = currentUser?.platformRole === "moderator"
  const statusMeta = itemStatusMeta[item.status as ItemStatus] || {
    label: item.status,
    className: "bg-muted text-muted-foreground",
  }

  return (
    <div className="mx-auto max-w-350 space-y-5">
      <Link
        href="/admin/catalog"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Весь каталог
      </Link>

      <header className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary text-primary">
              {item.preview_url && item.preview_url !== "#" ? (
                <Image
                  src={item.preview_url}
                  alt=""
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <Package size={24} aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {catalogItemTypeLabel[item.type]} #{item.id}
              </p>
              <h1 className="mt-1 truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {item.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.owner?.company_title || item.owner?.name || "Без владельца"}
                {item.category_name ? ` · ${item.category_name}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className={statusMeta.className}>
                  {statusMeta.label}
                </Badge>
                {item.open_reports_count > 0 && (
                  <Badge variant="outline">Жалоб: {item.open_reports_count}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 xl:max-w-xl xl:justify-end">
            {item.status !== "active" && (
              <Button type="button" size="sm" onClick={() => setSelectedAction("approve")}>
                <CheckCircle2 aria-hidden="true" />
                Одобрить
              </Button>
            )}
            {item.status !== "hidden" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedAction("hide")}
              >
                <EyeOff aria-hidden="true" />
                Скрыть
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSelectedAction("request_changes")}
            >
              <FilePenLine aria-hidden="true" />
              Запросить правки
            </Button>
            {!isModerator && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setSelectedAction("delete")}
              >
                <Trash2 aria-hidden="true" />
                Удалить
              </Button>
            )}
          </div>
        </div>
      </header>

      <nav
        className="sticky top-17 z-20 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card/95 p-2 backdrop-blur"
        aria-label="Разделы карточки позиции"
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

      <AdminCatalogDetailSections item={item} />

      <CatalogActionDialog
        itemId={item.id}
        itemTitle={item.title}
        action={selectedAction}
        onOpenChange={(open) => {
          if (!open) setSelectedAction(null)
        }}
      />
    </div>
  )
}
