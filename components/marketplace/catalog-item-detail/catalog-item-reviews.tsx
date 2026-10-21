import { Star } from "lucide-react"
import type { Review } from "@/types"
import { formatRelativeIso } from "@/lib/format"

type CatalogItemReviewsProps = {
  reviews: Review[]
  isLoading?: boolean
}

export const CatalogItemReviews = ({
  reviews,
  isLoading = false,
}: CatalogItemReviewsProps) => {
  if (isLoading) {
    return (
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-4 text-base font-bold text-foreground">Отзывы о поставщике</h2>
        <div className="space-y-3 animate-pulse">
          <div className="h-16 rounded-lg bg-secondary" />
          <div className="h-16 rounded-lg bg-secondary" />
        </div>
      </section>
    )
  }

  if (reviews.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-2 text-base font-bold text-foreground">Отзывы о поставщике</h2>
        <p className="text-sm text-muted-foreground">Отзывов пока нет</p>
      </section>
    )
  }

  const sorted = [...reviews].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-4 text-base font-bold text-foreground">
        Отзывы о поставщике ({reviews.length})
      </h2>
      <div className="space-y-4">
        {sorted.slice(0, 8).map((review) => (
          <div
            key={review.id}
            className="border-b border-border pb-4 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={
                      i < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {formatRelativeIso(review.created_at)}
              </span>
            </div>
            {review.comment && (
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
