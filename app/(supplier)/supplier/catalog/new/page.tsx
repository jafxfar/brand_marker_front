"use client"

import { useRouter } from "next/navigation"
import { CatalogItemForm } from "@/components/supplier/catalog/catalog-item-form"
import { useAuthStore } from "@/lib/store/auth-store"
import { useItemsStore } from "@/lib/store/items-store"
import { getActorId } from "@/lib/auth-display"
import type { CatalogItemInput } from "@/types"

export default function NewCatalogItemPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const createItem = useItemsStore((s) => s.createItem)

  const handleSubmit = (input: CatalogItemInput, _status: "draft" | "active") => {
    createItem(actorId, input)
    router.push("/supplier/catalog")
  }

  return <CatalogItemForm onSubmit={handleSubmit} />
}
