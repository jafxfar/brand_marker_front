"use client"

import { Star, BadgeCheck, Clock, Check, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/format"
import type { Offer } from "@/types"

interface OfferCardProps {
  offer: Offer
  accepted: boolean
  /** Another offer is already accepted for this order. */
  locked: boolean
  onAccept: () => void
}

export default function OfferCard({ offer, accepted, locked, onAccept }: OfferCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all bg-card",
        accepted ? "border-primary ring-2 ring-primary/15" : offer.promoted ? "border-primary/40" : "border-border",
      )}
    >
      {offer.promoted && (
        <div className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-primary mb-2.5">
          <Crown size={11} /> Продвигается
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0", offer.supplierColor)}>
          {offer.supplierInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-foreground truncate">{offer.supplierName}</span>
            {offer.verified && <BadgeCheck size={14} className="text-primary flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-0.5">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold">{offer.rating}</span>
              <span className="text-xs text-muted-foreground">({offer.reviews})</span>
            </div>
            <span className="text-muted-foreground/40 text-xs">•</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={10} /> {offer.daysToComplete} дн
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm font-semibold text-primary">{formatPrice(offer.price)}</div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{offer.message}</p>

      <div className="mt-3.5">
        {accepted ? (
          <div className="flex items-center justify-center gap-2 h-9 rounded-xl bg-secondary text-primary text-sm font-bold">
            <Check size={15} /> Исполнитель выбран
          </div>
        ) : (
          <button
            type="button"
            onClick={onAccept}
            disabled={locked}
            className={cn(
              "w-full h-9 rounded-xl text-sm font-bold transition-colors",
              locked
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 text-primary-foreground",
            )}
          >
            {locked ? "Недоступно" : "Выбрать исполнителя"}
          </button>
        )}
      </div>
    </div>
  )
}
