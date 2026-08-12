"use client"

import { use, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useItemsStore } from "@/lib/store/items-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useNotificationsStore } from "@/lib/store/notifications-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import {
  usePublicSupplierCatalogQuery,
  usePublicSupplierQuery,
  usePublicSupplierReviewsQuery,
} from "@/hooks/api/use-public-query"
import {
  useInviteSuppliersMutation,
  useRfqsQuery,
} from "@/hooks/api/use-rfqs-query"
import {
  getActiveCatalogItemsCount,
  getSupplierCategories,
  isSupplierCompany,
  toPublicSupplierFromCompany,
} from "@/lib/supplier-directory"
import { SupplierProfileHeader } from "@/components/cabinet/suppliers/supplier-profile-header"
import { SupplierCatalogGrid } from "@/components/cabinet/suppliers/supplier-catalog-grid"
import { SupplierReviewsList } from "@/components/cabinet/suppliers/supplier-reviews-list"
import { InviteRfqDialog } from "@/components/cabinet/suppliers/invite-rfq-dialog"
import type { PublicSupplier } from "@/types"

type PageProps = {
  params: Promise<{ id: string }>
}

export default function SupplierProfilePage({ params }: PageProps) {
  const { id } = use(params)
  const supplierActorId = Number(id)
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const actorId = getActorId(useAuthStore((s) => s.user))
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const getItemsBySupplier = useItemsStore((s) => s.getItemsBySupplier)
  const inviteSupplierToRfq = useRfqsStore((s) => s.inviteSupplierToRfq)
  const getInvitableRfqsForBuyer = useRfqsStore((s) => s.getInvitableRfqsForBuyer)
  const notify = useNotificationsStore((s) => s.add)
  const [inviteOpen, setInviteOpen] = useState(false)

  const { data: apiSupplier, isLoading: supplierLoading } = usePublicSupplierQuery(
    supplierActorId,
    hydrated && useApi,
  )
  const { data: apiCatalog = [] } = usePublicSupplierCatalogQuery(
    supplierActorId,
    hydrated && useApi,
  )
  const { data: apiReviews = [] } = usePublicSupplierReviewsQuery(
    supplierActorId,
    hydrated && useApi,
  )
  const { data: apiRfqs = [] } = useRfqsQuery("published", hydrated && useApi)
  const inviteMutation = useInviteSuppliersMutation()

  const localCompany = hydrated ? getCompany(supplierActorId) : undefined
  const localSupplier: PublicSupplier | undefined =
    localCompany && isSupplierCompany(localCompany)
      ? toPublicSupplierFromCompany(
          localCompany,
          getActiveCatalogItemsCount(getItemsBySupplier(localCompany.id)),
        )
      : undefined

  const supplier: PublicSupplier | undefined = useApi ? apiSupplier : localSupplier

  const catalogItems = useApi
    ? apiCatalog.filter((i) => i.status === "active")
    : hydrated && localCompany
      ? getItemsBySupplier(localCompany.id).filter((i) => i.status === "active")
      : []

  const categories = useApi
    ? (supplier?.industries.map((name, i) => ({
        id: i,
        parent_id: null,
        name,
        slug: name,
      })) ?? [])
    : getSupplierCategories(catalogItems)

  const invitableRfqs = useApi
    ? apiRfqs.filter(
        (r) =>
          (r.status === "published" || r.status === "receiving_proposals") &&
          String(r.actor_id) === String(actorId),
      )
    : hydrated
      ? getInvitableRfqsForBuyer(actorId)
      : []

  const reviews = useApi ? apiReviews : (localCompany?.reviews ?? [])

  if (!hydrated || (useApi && supplierLoading)) {
    return (
      <div className="max-w-[1000px] mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-secondary rounded-xl w-1/4" />
        <div className="h-48 bg-secondary rounded-xl" />
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="max-w-[1000px] mx-auto text-center py-16">
        <p className="text-lg font-bold text-foreground">Поставщик не найден</p>
        <Link
          href="/customer/suppliers"
          className="text-primary font-semibold hover:underline mt-2 inline-block"
        >
          К каталогу
        </Link>
      </div>
    )
  }

  const handleContact = () => {
    notify({
      type: "order",
      title: "Запрос отправлен",
      body: `Поставщик «${supplier.display_name}» получит уведомление о вашем интересе.`,
      href: `/customer/suppliers/${supplier.actor_id}`,
    })
  }

  const handleInviteExisting = (rfqId: string) => {
    if (useApi) {
      inviteMutation.mutate({ id: rfqId, supplierIds: [supplier.actor_id] })
      notify({
        type: "order",
        title: "Приглашение отправлено",
        body: `Поставщик «${supplier.display_name}» приглашён к участию в заявке.`,
        href: `/customer/rfqs/${rfqId}`,
      })
      return
    }
    inviteSupplierToRfq(rfqId, supplier.actor_id)
    notify({
      type: "order",
      title: "Приглашение отправлено",
      body: `Поставщик «${supplier.display_name}» приглашён к участию в заявке.`,
      href: `/customer/rfqs/${rfqId}`,
    })
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <Link
        href="/customer/suppliers"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} /> К каталогу
      </Link>

      <SupplierProfileHeader
        supplier={supplier}
        categories={categories}
        onContact={handleContact}
        onInvite={() => setInviteOpen(true)}
      />

      <div>
        <h2 className="text-base font-bold text-foreground mb-3">
          Каталог ({catalogItems.length})
        </h2>
        <SupplierCatalogGrid items={catalogItems} />
      </div>

      <SupplierReviewsList reviews={reviews} />

      <InviteRfqDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        supplierId={supplier.actor_id}
        supplierName={supplier.display_name}
        invitableRfqs={invitableRfqs}
        onInviteExisting={handleInviteExisting}
      />
    </div>
  )
}
