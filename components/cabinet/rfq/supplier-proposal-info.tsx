import Link from "next/link"
import { Building2, MapPin, ShieldCheck } from "lucide-react"
import type { CompanyWithRelations } from "@/types"
import { BuyerRating } from "@/components/supplier/rfq/buyer-rating"

type SupplierProposalInfoProps = {
  supplier: CompanyWithRelations | undefined
  supplierId: number
}

const verificationLabel = {
  verified: "Верифицирован",
  pending: "На проверке",
  rejected: "Отклонён",
} as const

export const SupplierProposalInfo = ({
  supplier,
  supplierId,
}: SupplierProposalInfoProps) => {
  if (!supplier) {
    return (
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
          <Building2 size={22} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Поставщик #{supplierId}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Профиль недоступен</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
        <Building2 size={22} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={`/customer/suppliers/${supplier.id}`}
          className="text-sm font-bold text-foreground hover:text-primary transition-colors"
        >
          {supplier.title}
        </Link>
        {supplier.legal_name && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{supplier.legal_name}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          <BuyerRating rating={supplier.rating} compact />
          <span className="text-xs text-muted-foreground">
            {supplier.reviews.length} отзывов
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
        {supplier.stats && (
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {supplier.stats.completed_contracts} завершённых контрактов
          </p>
        )}
      </div>
    </div>
  )
}
