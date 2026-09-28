"use client"

import { useMemo, useState } from "react"
import { FolderTree, Loader2, Pencil, Plus, RefreshCcw, Search, Trash2 } from "lucide-react"
import {
  CategoryDialog,
  type CategoryDialogState,
} from "@/components/admin/categories/category-dialog"
import { PageEmptyState, PageFrame, PageHeader, PageSurface } from "@/components/layout"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  useAdminCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/hooks/api/use-admin-categories-query"
import type { AdminCategory } from "@/lib/api/admin"
import { cn } from "@/lib/utils"

type CategoryNode = AdminCategory & { depth: number }

const DEPTH_INDENT = ["pl-0", "pl-6", "pl-12", "pl-18", "pl-24"]

const buildTreeRows = (categories: AdminCategory[]): CategoryNode[] => {
  const byParent = new Map<number | null, AdminCategory[]>()
  categories.forEach((category) => {
    const siblings = byParent.get(category.parent_id) ?? []
    siblings.push(category)
    byParent.set(category.parent_id, siblings)
  })
  const knownIds = new Set(categories.map((category) => category.id))
  const rows: CategoryNode[] = []
  const visit = (parentId: number | null, depth: number) => {
    const children = [...(byParent.get(parentId) ?? [])].sort((a, b) => a.name.localeCompare(b.name, "ru"))
    children.forEach((category) => {
      rows.push({ ...category, depth })
      visit(category.id, depth + 1)
    })
  }
  visit(null, 0)
  categories
    .filter((category) => category.parent_id != null && !knownIds.has(category.parent_id))
    .forEach((category) => rows.push({ ...category, depth: 0 }))
  return rows
}

const matchesQuery = (category: AdminCategory, query: string) =>
  category.name.toLowerCase().includes(query) || category.slug.includes(query)

const isCategoryInUse = (category: AdminCategory) =>
  category.children_count > 0 || category.catalog_items_count > 0 || category.companies_count > 0

const usageLabel = (category: AdminCategory) =>
  [
    category.children_count ? `подкатегорий: ${category.children_count}` : null,
    category.catalog_items_count ? `позиций: ${category.catalog_items_count}` : null,
    category.companies_count ? `компаний: ${category.companies_count}` : null,
  ]
    .filter(Boolean)
    .join(", ")

const CategoriesSkeleton = () => (
  <PageFrame className="animate-pulse" aria-label="Загрузка категорий">
    <div className="h-16 w-80 max-w-full rounded-xl bg-muted" />
    <div className="h-96 rounded-xl bg-muted" />
  </PageFrame>
)

const CountPill = ({ label, value }: { label: string; value: number }) => (
  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
    {label}: <strong className="text-foreground">{value}</strong>
  </span>
)

const CategoryRow = ({
  category,
  onAddChild,
  onEdit,
  onDelete,
}: {
  category: CategoryNode
  onAddChild: (category: AdminCategory) => void
  onEdit: (category: AdminCategory) => void
  onDelete: (category: AdminCategory) => void
}) => {
  const inUse = isCategoryInUse(category)

  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className={cn("min-w-0", DEPTH_INDENT[Math.min(category.depth, DEPTH_INDENT.length - 1)])}>
        <p className={cn("truncate text-foreground", category.depth === 0 ? "font-bold" : "font-medium")}>
          {category.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <code className="text-xs text-muted-foreground">{category.slug}</code>
          <CountPill label="Позиции" value={category.catalog_items_count} />
          <CountPill label="Компании" value={category.companies_count} />
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onAddChild(category)}
          aria-label={`Добавить подкатегорию в «${category.name}»`}
        >
          <Plus aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(category)}
          aria-label={`Редактировать «${category.name}»`}
        >
          <Pencil aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(category)}
          disabled={inUse}
          title={inUse ? `Нельзя удалить: ${usageLabel(category)}` : undefined}
          aria-label={inUse
            ? `Нельзя удалить «${category.name}»: ${usageLabel(category)}`
            : `Удалить «${category.name}»`}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </li>
  )
}

export default function AdminCategoriesPage() {
  const categoriesQuery = useAdminCategoriesQuery()
  const deleteMutation = useDeleteCategoryMutation()
  const [search, setSearch] = useState("")
  const [dialogState, setDialogState] = useState<CategoryDialogState>(null)
  const [deleting, setDeleting] = useState<AdminCategory | null>(null)

  const categories = useMemo(() => categoriesQuery.data?.items ?? [], [categoriesQuery.data])
  const rows = useMemo(() => {
    const tree = buildTreeRows(categories)
    const query = search.trim().toLowerCase()
    return query ? tree.filter((category) => matchesQuery(category, query)) : tree
  }, [categories, search])

  const handleDeleteConfirm = async () => {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      setDeleting(null)
    } catch {
      // error toast via MutationCache
    }
  }

  if (categoriesQuery.isLoading) return <CategoriesSkeleton />

  if (categoriesQuery.isError || !categoriesQuery.data) {
    return (
      <div className="flex min-h-[55dvh] items-center justify-center">
        <div className="w-full max-w-lg rounded-xl border border-destructive/20 bg-card p-8 text-center">
          <FolderTree className="mx-auto text-destructive" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold">Не удалось загрузить категории</h1>
          <Button type="button" className="mt-5" onClick={() => categoriesQuery.refetch()}>
            <RefreshCcw aria-hidden="true" />
            Повторить
          </Button>
        </div>
      </div>
    )
  }

  return (
    <PageFrame>
      <PageHeader
        title="Категории"
        description="Дерево категорий каталога и профилей компаний"
        actions={
          <Button type="button" onClick={() => setDialogState({ mode: "create", parentId: null })}>
            <Plus aria-hidden="true" />
            Добавить категорию
          </Button>
        }
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
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Название или slug"
              className="pl-11"
              aria-label="Поиск категорий"
            />
          </div>
        </div>

        {rows.length ? (
          <ul className="divide-y divide-border" aria-label="Дерево категорий">
            {rows.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onAddChild={(parent) => setDialogState({ mode: "create", parentId: parent.id })}
                onEdit={(target) => setDialogState({ mode: "edit", category: target })}
                onDelete={setDeleting}
              />
            ))}
          </ul>
        ) : (
          <PageEmptyState
            title={search ? "Ничего не найдено" : "Категорий пока нет"}
            description={search ? "Измените запрос." : "Создайте первую категорию."}
          />
        )}
      </PageSurface>

      <CategoryDialog
        state={dialogState}
        categories={categories}
        onClose={() => setDialogState(null)}
      />

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleting(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
            <AlertDialogDescription>
              «{deleting?.name}» будет удалена без возможности восстановления.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Отмена</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Удалить
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageFrame>
  )
}
