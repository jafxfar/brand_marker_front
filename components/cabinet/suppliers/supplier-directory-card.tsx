import Link from "next/link"
import { Building2, MapPin, User } from "lucide-react"
import type { PublicSupplier } from "@/types"
import { formatCount } from "@/lib/format"
import { SupplierRatingLine, SupplierVerifiedBadge } from "@/components/cabinet/suppliers/supplier-trust-badges"

type SupplierDirectoryCardProps = {
  supplier: PublicSupplier
  summary: string
  categoryNames: string[]
}

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
      className="bg-card border border-border rounded-2xl p-5 hover:border-primary transition-colors group block"
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
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <SupplierRatingLine supplier={supplier} compact />
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
              {isIndividual ? "Физлицо" : "Компания"}
            </span>
          </div>
          <SupplierVerifiedBadge supplier={supplier} className="mt-1.5" />
          {supplier.city && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
              <MapPin size={11} /> {supplier.city}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{summary}</p>

      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
        {supplier.completed_contracts != null && supplier.completed_contracts > 0 && (
          <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-semibold">
            {formatCount(supplier.completed_contracts, "сделка", "сделки", "сделок")} завершено
          </span>
        )}
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
      </div>
    </Link>
  )
}
