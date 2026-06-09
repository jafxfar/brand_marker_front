import { Star } from "lucide-react"
import { formatRating } from "@/lib/format"

type BuyerRatingProps = {
  rating: number
  compact?: boolean
}

export const BuyerRating = ({ rating, compact }: BuyerRatingProps) => (
  <div className="flex items-center gap-1.5">
    <Star size={compact ? 12 : 14} className="text-amber-500 fill-amber-500 flex-shrink-0" />
    <span className={`font-semibold text-foreground ${compact ? "text-xs" : "text-sm"}`}>
      {formatRating(rating)}
    </span>
  </div>
)
