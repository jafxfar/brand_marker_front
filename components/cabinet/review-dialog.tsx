"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export type ReviewAxisRatings = {
  rating: number
  service_rating: number
  delivery_rating: number
  quality_rating: number
  tags: string[]
  comment: string
}

/** about_supplier: buyer rates performer; about_buyer: supplier rates customer */
export type ReviewDialogVariant = "about_supplier" | "about_buyer"

const VARIANT_CONFIG: Record<
  ReviewDialogVariant,
  {
    axes: Array<{ key: "service_rating" | "delivery_rating" | "quality_rating"; label: string }>
    tags: string[]
    defaultLabel: string
  }
> = {
  about_supplier: {
    axes: [
      { key: "service_rating", label: "Сервис" },
      { key: "delivery_rating", label: "Сроки" },
      { key: "quality_rating", label: "Качество" },
    ],
    tags: ["Надёжный", "Вежливый", "Быстро", "Качественно", "Рекомендую", "Дорого"],
    defaultLabel: "исполнителем",
  },
  about_buyer: {
    axes: [
      { key: "service_rating", label: "Коммуникация" },
      { key: "delivery_rating", label: "Оплата" },
      { key: "quality_rating", label: "ТЗ и ясность" },
    ],
    tags: [
      "Пунктуальный",
      "Понятное ТЗ",
      "Быстрая оплата",
      "Вежливый",
      "Рекомендую",
      "Сложный клиент",
    ],
    defaultLabel: "заказчиком",
  },
}

interface ReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  counterpartName: string
  counterpartLabel?: string
  variant?: ReviewDialogVariant
  onConfirm: (payload: ReviewAxisRatings) => void
}

const AxisStars = ({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (n: number) => void
  label: string
}) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm font-medium text-foreground">{label}</span>
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${label}: ${n}`}
          className="p-0.5"
        >
          <Star
            size={20}
            className={cn(
              n <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  </div>
)

export default function ReviewDialog({
  open,
  onOpenChange,
  counterpartName,
  counterpartLabel,
  variant = "about_supplier",
  onConfirm,
}: ReviewDialogProps) {
  const config = VARIANT_CONFIG[variant]
  const [service, setService] = useState(5)
  const [delivery, setDelivery] = useState(5)
  const [quality, setQuality] = useState(5)
  const [tags, setTags] = useState<string[]>([])
  const [text, setText] = useState("")

  const average = Math.round((service + delivery + quality) / 3)
  const label = counterpartLabel ?? config.defaultLabel

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  const handleConfirm = () => {
    onConfirm({
      rating: average,
      service_rating: service,
      delivery_rating: delivery,
      quality_rating: quality,
      tags,
      comment: text.trim(),
    })
    setText("")
    setService(5)
    setDelivery(5)
    setQuality(5)
    setTags([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Оставить отзыв</DialogTitle>
          <DialogDescription>
            Поделитесь опытом работы с {label} «{counterpartName}»
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {config.axes.map((axis) => (
            <AxisStars
              key={axis.key}
              label={axis.label}
              value={
                axis.key === "service_rating"
                  ? service
                  : axis.key === "delivery_rating"
                    ? delivery
                    : quality
              }
              onChange={
                axis.key === "service_rating"
                  ? setService
                  : axis.key === "delivery_rating"
                    ? setDelivery
                    : setQuality
              }
            />
          ))}
          <p className="text-center text-sm text-muted-foreground">
            Средняя оценка: <b className="text-foreground">{average}</b> из 5
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {config.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                tags.includes(tag)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-secondary",
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Что понравилось, что можно улучшить"
          className="w-full px-4 py-3 rounded-xl border border-input bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
        />

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors"
          >
            Отправить отзыв
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
