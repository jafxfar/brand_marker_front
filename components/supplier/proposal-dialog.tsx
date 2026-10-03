"use client"

import { useEffect, useState } from "react"
import { Send } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { InlineHint } from "@/components/process"
import { usePlatformSettingsQuery } from "@/hooks/api/use-public-query"
import { calculateCommission, exceedsContractLimit } from "@/lib/commission"
import { cn } from "@/lib/utils"
import { formatCurrency, formatRfqBudget } from "@/lib/format"
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
  const { data: platformSettings } = usePlatformSettingsQuery(open)
  const priceValue = Number(price)
  const hasValidPrice = Boolean(price) && Number.isFinite(priceValue) && priceValue > 0
  const commission = platformSettings && hasValidPrice
    ? calculateCommission(priceValue, currency, platformSettings)
    : null

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
    const daysNum = Number(deliveryTime)
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      e.price = "Укажите цену"
    } else if (priceNum > 1_000_000_000_000) {
      e.price = "Цена не больше 1 трлн"
    } else if (platformSettings && exceedsContractLimit(priceNum, currency, platformSettings)) {
      e.price = `Сумма сделки не может превышать ${formatCurrency(platformSettings.max_contract_amount ?? 0, currency)}`
    }
    if (!deliveryTime.trim() || Number.isNaN(daysNum) || daysNum <= 0) {
      e.delivery_time = "Срок должен быть больше 0"
    } else if (!Number.isInteger(daysNum) || daysNum > 3650) {
      e.delivery_time = "Срок от 1 до 3650 дней"
    }
    if (message.trim().length < 10) {
      e.message = "Сообщение от 10 символов"
    }
    setErrors(e)
    if (Object.keys(e).length > 0) return

    onSubmit({
      price: priceNum,
      delivery_time: String(daysNum),
      message: message.trim(),
    })
    onOpenChange(false)
  }

  const inputClass = (field: string) =>
    cn(
      "w-full h-11 px-4 rounded-xl border bg-card text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20",
      errors[field] ? "border-destructive" : "border-input focus:border-primary",
    )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Предложить цену</DialogTitle>
          <DialogDescription>
            Заявка: {rfqTitle}. Бюджет:{" "}
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
              max={1_000_000_000_000}
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
          {commission !== null && platformSettings && (
            <div
              className="col-span-2 flex items-baseline justify-between gap-3 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-900"
              aria-live="polite"
            >
              <span>
                Вы получите
                <span className="block text-xs text-brand-700">
                  комиссия площадки {platformSettings.commission_percent}% ·{" "}
                  {formatCurrency(commission, currency)}
                </span>
              </span>
              <strong className="text-lg tnum">
                {formatCurrency(priceValue - commission, currency)}
              </strong>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="p-delivery" className="block text-sm font-medium text-foreground mb-1.5">
            Срок выполнения, дней
          </label>
          <input
            id="p-delivery"
            type="number"
            min={1}
            max={3650}
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            placeholder="14"
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
            placeholder="Как будете выполнять, что входит в цену, похожий опыт"
            className={cn(
              "w-full px-4 py-3 rounded-xl border bg-card text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 resize-none",
              errors.message ? "border-destructive" : "border-input focus:border-primary",
            )}
          />
          {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
        </div>

        <InlineHint variant="warning" className="p-3 text-xs">
          Не указывайте телефоны и ссылки на мессенджеры. Детали обсудите в чате сделки — так
          оплата остаётся под гарантией площадки.
        </InlineHint>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleConfirm}>
            <Send /> Отправить предложение
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
