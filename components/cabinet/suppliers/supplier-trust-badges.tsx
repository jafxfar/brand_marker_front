import { ShieldCheck } from "lucide-react"
import type { PublicSupplier } from "@/types"
import { cn } from "@/lib/utils"
import { formatCount } from "@/lib/format"
import { BuyerRating } from "@/components/supplier/rfq/buyer-rating"

type SupplierTrustProps = {
  supplier: Pick<PublicSupplier, "verification_status" | "kind" | "rating" | "reviews_count">
  compact?: boolean
  className?: string
}

/** Shown only for verified suppliers; other verification states are internal. */
export const SupplierVerifiedBadge = ({ supplier, className }: SupplierTrustProps) => {
  if (supplier.verification_status !== "verified") return null
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700",
        className,
      )}
    >
      <ShieldCheck size={12} aria-hidden="true" />
      {supplier.kind === "individual" ? "Проверенный исполнитель" : "Проверенная компания"}
    </span>
  )
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
