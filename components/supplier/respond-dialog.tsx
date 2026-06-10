"use client"

import { useState } from "react"
import { Send, Crown } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/format"

export interface RespondValues {
  price: number
  daysToComplete: number
  message: string
}

interface RespondDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget: number
  promoted: boolean
  onConfirm: (values: RespondValues) => void
}

export default function RespondDialog({
  open, onOpenChange, budget, promoted, onConfirm,
}: RespondDialogProps) {
  const [price, setPrice] = useState(String(budget))
  const [days, setDays] = useState("7")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleConfirm = () => {
    const e: Record<string, string> = {}
    const priceNum = Number(price)
    const daysNum = Number(days)
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) e.price = "Укажите цену"
    if (!days || Number.isNaN(daysNum) || daysNum < 1) e.days = "Срок от 1 дня"
    if (message.trim().length < 10) e.message = "Сообщение от 10 символов"
    setErrors(e)
    if (Object.keys(e).length > 0) return

    onConfirm({ price: priceNum, daysToComplete: daysNum, message: message.trim() })
    onOpenChange(false)
  }

  const inputClass = (field: string) =>
    cn(
      "w-full h-11 px-4 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20",
      errors[field] ? "border-destructive" : "border-input focus:border-primary",
    )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Откликнуться на заказ</DialogTitle>
          <DialogDescription>
            Бюджет заказчика: {formatPrice(budget)}. Предложите свои условия.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-1">
          <div>
            <label htmlFor="r-price" className="block text-sm font-medium text-foreground mb-1.5">Ваша цена, TJS</label>
            <input id="r-price" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass("price")} />
            {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
          </div>
          <div>
            <label htmlFor="r-days" className="block text-sm font-medium text-foreground mb-1.5">Срок, дней</label>
            <input id="r-days" type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} className={inputClass("days")} />
            {errors.days && <p className="text-xs text-destructive mt-1">{errors.days}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="r-message" className="block text-sm font-medium text-foreground mb-1.5">Сообщение заказчику</label>
          <textarea
            id="r-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Расскажите, почему стоит выбрать вас"
            className={cn("w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 resize-none", errors.message ? "border-destructive" : "border-input focus:border-primary")}
          />
          {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
        </div>

        {promoted && (
          <div className="flex items-center gap-2 text-[11px] text-primary bg-secondary rounded-xl p-2.5">
            <Crown size={14} className="flex-shrink-0" />
            Подписка активна — ваш отклик будет помечен как «Продвигается».
          </div>
        )}

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
            className="h-10 px-5 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-bold transition-colors flex items-center gap-2"
          >
            <Send size={15} /> Отправить отклик
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
