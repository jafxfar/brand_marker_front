import type { PublicSupplier } from "@/types"
import { cn } from "@/lib/utils"
import { formatCount } from "@/lib/format"
import { BuyerRating } from "@/components/supplier/rfq/buyer-rating"
import { ReputationBadge } from "@/components/bm/reputation-badge"
import { resolveReputationTier } from "@/lib/trust-levels"

type SupplierTrustProps = {
  supplier: Pick<
    PublicSupplier,
    | "verification_status"
    | "kind"
    | "rating"
    | "reviews_count"
    | "reputation_tier"
    | "completed_contracts"
    | "success_rate"
  >
  compact?: boolean
  className?: string
}

/** Shield ladder badge when the supplier has at least «Проверенный». */
export const SupplierVerifiedBadge = ({ supplier, className }: SupplierTrustProps) => {
  const tier =
    (supplier.reputation_tier as ReturnType<typeof resolveReputationTier> | undefined) ??
    resolveReputationTier(supplier)
  if (tier === "none") return null
  return <ReputationBadge tier={tier} className={className} />
}

export const SupplierRatingLine = ({ supplier, compact = false, className }: SupplierTrustProps) => {
  if (!supplier.reviews_count) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        Новый — пока без отзывов
      </span>
    )
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <BuyerRating rating={supplier.rating} compact={compact} />
      <span className="text-xs text-muted-foreground">
        {formatCount(supplier.reviews_count, "отзыв", "отзыва", "отзывов")}
      </span>
    </span>
  )
}
