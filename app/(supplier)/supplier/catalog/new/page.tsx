"use client"

import { useRouter } from "next/navigation"
import { CatalogItemForm } from "@/components/supplier/catalog/catalog-item-form"
import { useAuthStore } from "@/lib/store/auth-store"
import { useItemsStore } from "@/lib/store/items-store"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import { useCreateCatalogItemMutation } from "@/hooks/api/use-supplier-catalog-query"
import type { CatalogItemInput } from "@/types"

export default function NewCatalogItemPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const createItem = useItemsStore((s) => s.createItem)
  const useApi = isApiEnabled()
  const createMutation = useCreateCatalogItemMutation()

  const handleSubmit = async (
    input: CatalogItemInput,
    status: "draft" | "pending_review",
  ) => {
    const payload = { ...input, status }
    if (useApi) {
      await createMutation.mutateAsync(payload)
      router.push("/supplier/catalog")
      return
    }
    createItem(actorId, payload)
    router.push("/supplier/catalog")
  }

  return <CatalogItemForm onSubmit={handleSubmit} />
}
