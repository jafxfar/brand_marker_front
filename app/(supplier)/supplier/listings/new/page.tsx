"use client"

import { useRouter } from "next/navigation"
import ListingForm from "@/components/supplier/listing-form"
import { useAuthStore } from "@/lib/store/auth-store"
import { useListingsStore } from "@/lib/store/listings-store"
import { useNotificationsStore } from "@/lib/store/notifications-store"
import type { ListingInput } from "@/lib/store/listings-store"

export default function NewListingPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const add = useListingsStore((s) => s.add)
  const notify = useNotificationsStore((s) => s.add)

  const handleSubmit = (input: ListingInput) => {
    if (!user) return
    add(user.id, input)
    notify({
      type: "system",
      title: "Позиция добавлена",
      body: `«${input.title}» опубликована в вашем каталоге.`,
      href: "/supplier/listings",
    })
    router.push("/supplier/listings")
  }

  return <ListingForm onSubmit={handleSubmit} submitLabel="Создать позицию" />
}
