"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierName: string
  onConfirm: (rating: number, text: string) => void
}

export default function ReviewDialog({
  open, onOpenChange, supplierName, onConfirm,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState("")

  const handleConfirm = () => {
    onConfirm(rating, text.trim())
    setText("")
    setRating(5)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Оставить отзыв</DialogTitle>
          <DialogDescription>
            Поделитесь опытом работы с поставщиком «{supplierName}»
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`Оценка ${n}`}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={cn(
                  "transition-colors",
                  n <= (hover || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/40",
                )}
              />
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
