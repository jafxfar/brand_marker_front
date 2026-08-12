import Link from "next/link"
import { Building2, MapPin, ShieldCheck, User } from "lucide-react"
import type { PublicSupplier } from "@/types"
import { BuyerRating } from "@/components/supplier/rfq/buyer-rating"

type SupplierDirectoryCardProps = {
  supplier: PublicSupplier
  summary: string
  categoryNames: string[]
}

const verificationLabel = {
  verified: "Верифицирован",
  pending: "На проверке",
  rejected: "Отклонён",
} as const

export const SupplierDirectoryCard = ({
  supplier,
  summary,
  categoryNames,
}: SupplierDirectoryCardProps) => {
  const isIndividual = supplier.kind === "individual"
  const Icon = isIndividual ? User : Building2

  return (
    <Link
      href={`/customer/suppliers/${supplier.actor_id}`}
      className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-lg transition-all group block"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
          <Icon size={22} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {supplier.display_name}
            </span>
            {supplier.verification_status === "verified" && (
              <ShieldCheck size={14} className="text-primary flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <BuyerRating rating={supplier.rating} compact />
            <span className="text-xs text-muted-foreground">
              ({supplier.reviews_count})
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
              {isIndividual ? "Физлицо" : "Компания"}
            </span>
          </div>
          {supplier.city && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
              <MapPin size={11} /> {supplier.city}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{summary}</p>

      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
        {supplier.active_catalog_count > 0 && (
          <span className="text-[10px] bg-secondary text-foreground px-2.5 py-1 rounded-lg font-semibold">
            {supplier.active_catalog_count} в каталоге
          </span>
        )}
        {categoryNames.slice(0, 3).map((name) => (
          <span
            key={name}
            className="text-[10px] bg-muted text-muted-foreground px-2.5 py-1 rounded-lg font-medium"
          >
            {name}
          </span>
        ))}
        <span className="text-[10px] text-muted-foreground px-1 py-1">
          {verificationLabel[supplier.verification_status]}
        </span>
      </div>
    </Link>
  )
}
