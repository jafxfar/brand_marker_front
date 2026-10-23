import { Star } from "lucide-react"
import type { Review } from "@/types"
import { formatRelativeIso } from "@/lib/format"

type CatalogItemReviewsProps = {
  reviews: Review[]
  isLoading?: boolean
  /** Render without outer card/heading (for tabs). */
  bare?: boolean
}

export const CatalogItemReviews = ({
  reviews,
  isLoading = false,
  bare = false,
}: CatalogItemReviewsProps) => {
  if (isLoading) {
    const body = (
      <div className="animate-pulse space-y-3">
        <div className="h-16 rounded-lg bg-secondary" />
        <div className="h-16 rounded-lg bg-secondary" />
      </div>
    )
    if (bare) return body
    return (
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-4 text-base font-bold text-foreground">Отзывы о поставщике</h2>
        {body}
      </section>
    )
  }

  if (reviews.length === 0) {
    const empty = (
      <p className="text-[15px] text-mute">
        Отзывов пока нет. Отзыв можно оставить только после завершённой сделки —
        поэтому им можно доверять.
      </p>
    )
    if (bare) return empty
    return (
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-2 text-base font-bold text-foreground">Отзывы о поставщике</h2>
        {empty}
      </section>
    )
  }

  const sorted = [...reviews].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  const list = (
    <div className="grid gap-5">
      {sorted.slice(0, 8).map((review) => (
        <article
          key={review.id}
          className="grid gap-1.5 border-t border-line pt-4 first:border-t-0 first:pt-0"
        >
          <div className="flex justify-between gap-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-line"
                  }
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-[13px] text-mute">
              {formatRelativeIso(review.created_at)}
            </span>
          </div>
          {review.comment && (
            <p className="text-[15px] leading-relaxed text-ink">{review.comment}</p>
          )}
        </article>
      ))}
    </div>
  )

  if (bare) return list

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-4 text-base font-bold text-foreground">
        Отзывы о поставщике ({reviews.length})
      </h2>
      {list}
    </section>
  )
}
