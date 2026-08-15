"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { CatalogItemForm } from "@/components/supplier/catalog/catalog-item-form"
import { PageFrame, PageHeader } from "@/components/layout"
import { useItemsStore } from "@/lib/store/items-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import {
  useArchiveCatalogItemMutation,
  useSupplierCatalogItemQuery,
  useUpdateCatalogItemMutation,
} from "@/hooks/api/use-supplier-catalog-query"
import type { CatalogItemInput } from "@/types"

type PageProps = {
  params: Promise<{ id: string }>
}

export default function EditCatalogItemPage({ params }: PageProps) {
  const { id } = use(params)
  const itemId = Number(id)
  const router = useRouter()
  const hydrated = useHydrated()
  const getItem = useItemsStore((s) => s.getItem)
  const updateItem = useItemsStore((s) => s.updateItem)
  const archiveItem = useItemsStore((s) => s.archiveItem)
  const useApi = isApiEnabled()

  const { data: apiItem, isLoading } = useSupplierCatalogItemQuery(itemId, hydrated && useApi)
  const updateMutation = useUpdateCatalogItemMutation()
  const archiveMutation = useArchiveCatalogItemMutation()

  const localItem = hydrated ? getItem(itemId) : undefined
  const item = useApi ? apiItem : localItem

  if (!hydrated || (useApi && isLoading)) {
    return (
      <PageFrame className="animate-pulse">
        <div className="h-8 w-1/3 rounded-xl bg-secondary" />
        <div className="h-48 rounded-xl bg-secondary" />
      </PageFrame>
    )
  }

  if (!item) {
    return (
      <PageFrame>
        <PageHeader title="Позиция не найдена" backHref="/supplier/catalog" backLabel="Вернуться к каталогу" />
      </PageFrame>
    )
  }

  const handleSubmit = async (
    input: CatalogItemInput,
    status: "draft" | "pending_review",
  ) => {
    const payload = { ...input, status }
    if (useApi) {
      await updateMutation.mutateAsync({ id: itemId, data: payload })
      router.push("/supplier/catalog")
      return
    }
    updateItem(itemId, payload)
    router.push("/supplier/catalog")
  }

  const handleArchive = async () => {
    if (useApi) {
      await archiveMutation.mutateAsync(itemId)
      router.push("/supplier/catalog")
      return
    }
    archiveItem(itemId)
    router.push("/supplier/catalog")
  }

  return (
    <>
      {item.status !== "archived" ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleArchive}
            className="text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive"
          >
            Переместить в архив
          </button>
        </div>
      ) : null}
      <CatalogItemForm initial={item} onSubmit={handleSubmit} />
    </>
  )
}
