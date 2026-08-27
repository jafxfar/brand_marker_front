import Link from "next/link"
import { Building2, MapPin, ShieldCheck, User } from "lucide-react"
import type { PublicSupplier } from "@/types"
import { BuyerRating } from "@/components/supplier/rfq/buyer-rating"

type SupplierProposalInfoProps = {
  supplier: PublicSupplier | undefined
  supplierId: number
  supplierName: string
}

const verificationLabel = {
  verified: "Верифицирован",
  pending: "На проверке",
  rejected: "Отклонён",
} as const

export const SupplierProposalInfo = ({
  supplier,
  supplierId,
  supplierName,
}: SupplierProposalInfoProps) => {
  const profileHref = `/customer/suppliers/${supplierId}`
  const isIndividual = supplier?.kind === "individual"
  const Icon = isIndividual ? User : Building2

  return (
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
        <Icon size={22} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={profileHref}
          className="text-sm font-bold text-foreground hover:text-primary transition-colors"
        >
          {supplierName}
        </Link>
        {supplier ? (
          <>
            <p className="text-xs text-muted-foreground mt-0.5">
              Профиль, портфолио и прошлые работы
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
              <BuyerRating rating={supplier.rating} compact />
              <span className="text-xs text-muted-foreground">
                {supplier.reviews_count} отзывов
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
              {(supplier.city || supplier.country) && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="flex-shrink-0" />
                  {[supplier.city, supplier.country].filter(Boolean).join(", ")}
                </span>
              )}
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="flex-shrink-0" />
                {verificationLabel[supplier.verification_status]}
              </span>
            </div>
            {supplier.active_catalog_count > 0 && (
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {supplier.active_catalog_count} позиций в каталоге
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground mt-0.5">
            Открыть профиль исполнителя
          </p>
        )}
      </div>
    </div>
  )
}
