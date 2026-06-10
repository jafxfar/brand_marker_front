import Link from "next/link"
import { Building2, MapPin, ShieldCheck } from "lucide-react"
import type { CompanyWithRelations } from "@/types"
import { BuyerRating } from "@/components/supplier/rfq/buyer-rating"

type SupplierDirectoryCardProps = {
  company: CompanyWithRelations
  summary: string
  activeItemsCount: number
  categoryNames: string[]
}

const verificationLabel = {
  verified: "Верифицирован",
  pending: "На проверке",
  rejected: "Отклонён",
} as const

export const SupplierDirectoryCard = ({
  company,
  summary,
  activeItemsCount,
  categoryNames,
}: SupplierDirectoryCardProps) => (
  <Link
    href={`/customer/suppliers/${company.id}`}
    className="bg-white border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg transition-all group block"
  >
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
        <Building2 size={22} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
            {company.title}
          </span>
          {company.verification_status === "verified" && (
            <ShieldCheck size={14} className="text-primary flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <BuyerRating rating={company.rating} compact />
          <span className="text-xs text-muted-foreground">
            ({company.reviews.length})
          </span>
        </div>
        {company.city && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
            <MapPin size={11} /> {company.city}
          </div>
        )}
      </div>
    </div>

    <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{summary}</p>

    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
      {activeItemsCount > 0 && (
        <span className="text-[10px] bg-secondary text-foreground px-2.5 py-1 rounded-lg font-semibold">
          {activeItemsCount} в каталоге
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
        {verificationLabel[company.verification_status]}
      </span>
    </div>
  </Link>
)
