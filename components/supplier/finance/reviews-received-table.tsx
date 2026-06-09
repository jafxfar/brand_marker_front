"use client"

import Link from "next/link"
import { Star } from "lucide-react"
import type { Review } from "@/types"

type ReviewsReceivedTableProps = {
  reviews: Review[]
  getReviewerName: (reviewerActorId: number) => string
  getContractTitle: (contractId: number) => string
}

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5" aria-label={`Оценка ${rating} из 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={14}
        className={
          n <= rating
            ? "text-amber-500 fill-amber-500"
            : "text-muted-foreground/30"
        }
      />
    ))}
  </div>
)

export const ReviewsReceivedTable = ({
  reviews,
  getReviewerName,
  getContractTitle,
}: ReviewsReceivedTableProps) => {
  const sorted = [...reviews].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Отзывов пока нет
      </p>
    )
  }

  return (
    <>
      <div className="hidden md:block overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Заказчик</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Оценка</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Комментарий</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Контракт</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((review) => (
              <tr key={review.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                  {getReviewerName(review.reviewer_actor_id)}
                </td>
                <td className="px-4 py-3">
                  <RatingStars rating={review.rating} />
                </td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs">
                  {review.comment ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/supplier/contracts/${review.contract_id}`}
                    className="font-medium text-primary hover:underline line-clamp-2"
                  >
                    {getContractTitle(review.contract_id)}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {sorted.map((review) => (
          <div key={review.id} className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-foreground">
                {getReviewerName(review.reviewer_actor_id)}
              </p>
              <RatingStars rating={review.rating} />
            </div>
            {review.comment && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {review.comment}
              </p>
            )}
            <Link
              href={`/supplier/contracts/${review.contract_id}`}
              className="text-xs font-semibold text-primary hover:underline mt-3 inline-block"
            >
              {getContractTitle(review.contract_id)}
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}
