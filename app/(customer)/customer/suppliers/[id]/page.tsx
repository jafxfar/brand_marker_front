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
import { getSupplierCategories, isSupplierCompany } from "@/lib/supplier-directory"
import { SupplierProfileHeader } from "@/components/cabinet/suppliers/supplier-profile-header"
import { SupplierCatalogGrid } from "@/components/cabinet/suppliers/supplier-catalog-grid"
import { SupplierReviewsList } from "@/components/cabinet/suppliers/supplier-reviews-list"
import { InviteRfqDialog } from "@/components/cabinet/suppliers/invite-rfq-dialog"

type PageProps = {
  params: Promise<{ id: string }>
}

export default function SupplierProfilePage({ params }: PageProps) {
  const { id } = use(params)
  const companyId = Number(id)
  const hydrated = useHydrated()
  const actorId = getActorId(useAuthStore((s) => s.user))
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const getItemsBySupplier = useItemsStore((s) => s.getItemsBySupplier)
  const inviteSupplierToRfq = useRfqsStore((s) => s.inviteSupplierToRfq)
  const getInvitableRfqsForBuyer = useRfqsStore((s) => s.getInvitableRfqsForBuyer)
  const notify = useNotificationsStore((s) => s.add)
  const [inviteOpen, setInviteOpen] = useState(false)

  const company = hydrated ? getCompany(companyId) : undefined
  const catalogItems = hydrated
    ? getItemsBySupplier(companyId).filter((i) => i.status === "active")
    : []
  const categories = getSupplierCategories(catalogItems)
  const invitableRfqs = hydrated ? getInvitableRfqsForBuyer(actorId) : []

  if (!hydrated) {
    return (
      <div className="max-w-[1000px] mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-secondary rounded-xl w-1/4" />
        <div className="h-48 bg-secondary rounded-2xl" />
      </div>
    )
  }

  if (!company || !isSupplierCompany(company)) {
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
      body: `Поставщик «${company.title}» получит уведомление о вашем интересе.`,
      href: `/customer/suppliers/${company.id}`,
    })
  }

  const handleInviteExisting = (rfqId: string) => {
    inviteSupplierToRfq(rfqId, companyId)
    notify({
      type: "order",
      title: "Приглашение отправлено",
      body: `Поставщик «${company.title}» приглашён к участию в RFQ.`,
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
        company={company}
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

      <SupplierReviewsList reviews={company.reviews} />

      <InviteRfqDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        supplierId={companyId}
        supplierName={company.title}
        invitableRfqs={invitableRfqs}
        onInviteExisting={handleInviteExisting}
      />
    </div>
  )
}
