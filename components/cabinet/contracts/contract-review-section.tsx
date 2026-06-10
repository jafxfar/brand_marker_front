"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import ReviewDialog from "@/components/cabinet/review-dialog"

type ContractReviewSectionProps = {
  supplierName: string
  canReview: boolean
  hasReview: boolean
  onSubmit: (rating: number, comment: string) => void
}

export const ContractReviewSection = ({
  supplierName,
  canReview,
  hasReview,
  onSubmit,
}: ContractReviewSectionProps) => {
  const [open, setOpen] = useState(false)

  if (!canReview && !hasReview) return null

  return (
    <section className="bg-white border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Star size={16} className="text-amber-500" />
        <h2 className="text-base font-bold text-foreground">Отзыв</h2>
      </div>

      {hasReview ? (
        <p className="text-sm text-muted-foreground">
          Вы уже оставили отзыв по этому контракту. Посмотреть его можно в разделе «Мои отзывы».
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Контракт завершён — поделитесь опытом работы с поставщиком.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full h-10 px-4 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-bold transition-colors"
          >
            Оставить отзыв
          </button>
        </>
      )}

      <ReviewDialog
        open={open}
        onOpenChange={setOpen}
        supplierName={supplierName}
        onConfirm={onSubmit}
      />
    </section>
  )
}
