"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CatalogItemForm } from "@/components/supplier/catalog/catalog-item-form"
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
      <div className="max-w-[900px] mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-secondary rounded-xl w-1/3" />
        <div className="h-48 bg-secondary rounded-xl" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-[900px] mx-auto text-center py-16">
        <p className="text-sm font-semibold text-foreground">Позиция не найдена</p>
        <Link href="/supplier/catalog" className="text-sm text-primary hover:underline mt-2 inline-block">
          Вернуться к каталогу
        </Link>
      </div>
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
    <div>
      {item.status !== "archived" && (
        <div className="max-w-[900px] mx-auto mb-4 flex justify-end">
          <button
            type="button"
            onClick={handleArchive}
            className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
          >
            Переместить в архив
          </button>
        </div>
      )}
      <CatalogItemForm initial={item} onSubmit={handleSubmit} />
    </div>
  )
}
