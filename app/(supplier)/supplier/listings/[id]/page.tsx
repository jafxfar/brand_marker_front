"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import ListingForm from "@/components/supplier/listing-form"
import { useListingsStore } from "@/lib/store/listings-store"
import { useHydrated } from "@/hooks/use-hydrated"
import type { ListingInput } from "@/lib/store/listings-store"

export default function EditListingPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const hydrated = useHydrated()
  const listing = useListingsStore((s) => s.items.find((l) => l.id === params.id))
  const update = useListingsStore((s) => s.update)

  if (!hydrated) return null

  if (!listing) {
    return (
      <div className="max-w-[820px] mx-auto text-center py-16">
        <p className="text-lg font-bold text-foreground">Позиция не найдена</p>
        <Link href="/supplier/listings" className="text-primary font-semibold hover:underline mt-2 inline-block">
          ← К списку позиций
        </Link>
      </div>
    )
  }

  const handleSubmit = (input: ListingInput) => {
    update(listing.id, input)
    router.push("/supplier/listings")
  }

  return <ListingForm initial={listing} onSubmit={handleSubmit} submitLabel="Сохранить изменения" />
}
