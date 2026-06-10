"use client"

import { useEffect, useState } from "react"
import { Send } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { formatRfqBudget } from "@/lib/format"
import type { Currency } from "@/types"
import type { BudgetType } from "@/types"

export type ProposalFormValues = {
  price: number
  delivery_time: string
  message: string
}

type ProposalDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  rfqTitle: string
  budgetType: BudgetType
  budgetFrom: number | null
  budgetTo: number | null
  currency: Currency | string
  defaultPrice?: number | null
  onSubmit: (values: ProposalFormValues) => void
}

export const ProposalDialog = ({
  open,
  onOpenChange,
  rfqTitle,
  budgetType,
  budgetFrom,
  budgetTo,
  currency,
  defaultPrice,
  onSubmit,
}: ProposalDialogProps) => {
  const [price, setPrice] = useState("")
  const [deliveryTime, setDeliveryTime] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    const initialPrice = defaultPrice ?? budgetFrom ?? budgetTo ?? 0
    setPrice(initialPrice > 0 ? String(initialPrice) : "")
    setDeliveryTime("")
    setMessage("")
    setErrors({})
  }, [open, defaultPrice, budgetFrom, budgetTo])

  const handleConfirm = () => {
    const e: Record<string, string> = {}
    const priceNum = Number(price)
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      e.price = "Укажите цену"
    }
    if (!deliveryTime.trim()) {
      e.delivery_time = "Укажите срок выполнения"
    }
    if (message.trim().length < 10) {
      e.message = "Сообщение от 10 символов"
    }
    setErrors(e)
    if (Object.keys(e).length > 0) return

    onSubmit({
      price: priceNum,
      delivery_time: deliveryTime.trim(),
      message: message.trim(),
    })
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
          <DialogTitle>Отправить предложение</DialogTitle>
          <DialogDescription>
            RFQ: {rfqTitle}. Бюджет:{" "}
            {formatRfqBudget(budgetType, budgetFrom, budgetTo, currency)}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-1">
          <div>
            <label htmlFor="p-price" className="block text-sm font-medium text-foreground mb-1.5">
              Ваша цена, {currency}
            </label>
            <input
              id="p-price"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass("price")}
            />
            {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
          </div>
          <div>
            <label htmlFor="p-currency" className="block text-sm font-medium text-foreground mb-1.5">
              Валюта
            </label>
            <input
              id="p-currency"
              type="text"
              value={currency}
              readOnly
              className="w-full h-11 px-4 rounded-xl border border-input bg-secondary text-sm text-muted-foreground"
            />
          </div>
        </div>

        <div>
          <label htmlFor="p-delivery" className="block text-sm font-medium text-foreground mb-1.5">
            Срок выполнения
          </label>
          <input
            id="p-delivery"
            type="text"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            placeholder="Например: 14 рабочих дней"
            className={inputClass("delivery_time")}
          />
          {errors.delivery_time && (
            <p className="text-xs text-destructive mt-1">{errors.delivery_time}</p>
          )}
        </div>

        <div>
          <label htmlFor="p-message" className="block text-sm font-medium text-foreground mb-1.5">
            Сообщение заказчику
          </label>
          <textarea
            id="p-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Расскажите, почему стоит выбрать вас"
            className={cn(
              "w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 resize-none",
              errors.message ? "border-destructive" : "border-input focus:border-primary",
            )}
          />
          {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
        </div>

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
            <Send size={15} /> Отправить предложение
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
