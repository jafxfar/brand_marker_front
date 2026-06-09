"use client"

import Link from "next/link"
import { Star } from "lucide-react"
import { formatRating } from "@/lib/format"

type RatingSummaryCardProps = {
  rating: number
  reviewCount: number
  completedContracts: number
  hydrated: boolean
}

export const RatingSummaryCard = ({
  rating,
  reviewCount,
  completedContracts,
  hydrated,
}: RatingSummaryCardProps) => (
  <div className="bg-white border border-border rounded-2xl p-5">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
        <Star size={18} />
      </div>
      <h2 className="text-base font-bold text-foreground">Рейтинг</h2>
    </div>

    <div className="flex items-end gap-2">
      <span className="text-3xl font-black text-foreground leading-none">
        {hydrated ? formatRating(rating) : "—"}
      </span>
      <div className="flex gap-0.5 mb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={
              hydrated && i < Math.round(rating)
                ? "text-amber-500 fill-amber-500"
                : "text-muted-foreground/30"
            }
          />
        ))}
      </div>
    </div>

    <p className="text-xs text-muted-foreground mt-2">
      {hydrated
        ? `${reviewCount} отзывов · ${completedContracts} завершённых контрактов`
        : "Загрузка..."}
    </p>

    <Link
      href="/supplier/profile"
      className="inline-block text-xs font-semibold text-primary hover:underline mt-3"
    >
      Перейти в профиль
    </Link>
  </div>
)
