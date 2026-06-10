"use client"

import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PricingType } from "@/types"
import { pricingTypeMeta } from "@/lib/item-display"

export type PricingTierRow = {
  min_qty: number
  price: number
}

export type PricingFieldValues = {
  pricing_type: PricingType
  currency: string
  fixed_price: string
  hourly_rate: string
  monthly_rate: string
  tiers: PricingTierRow[]
}

type PricingFieldsProps = {
  values: PricingFieldValues
  onChange: (values: PricingFieldValues) => void
  errors?: Record<string, string>
}

const pricingTypes = Object.entries(pricingTypeMeta) as [PricingType, string][]

export const PricingFields = ({ values, onChange, errors }: PricingFieldsProps) => {
  const inputClass = (field: string) =>
    cn(
      "w-full h-10 px-3 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20",
      errors?.[field] ? "border-destructive" : "border-input focus:border-primary",
    )

  const handleTierUpdate = (index: number, patch: Partial<PricingTierRow>) => {
    onChange({
      ...values,
      tiers: values.tiers.map((tier, i) =>
        i === index ? { ...tier, ...patch } : tier,
      ),
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {pricingTypes.map(([type, label]) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange({ ...values, pricing_type: type })}
            className={cn(
              "h-10 px-3 rounded-xl border text-xs font-semibold transition-colors",
              values.pricing_type === type
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="max-w-xs">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Валюта
        </label>
        <select
          value={values.currency}
          onChange={(e) => onChange({ ...values, currency: e.target.value })}
          className={inputClass("currency")}
        >
          <option value="RUB">RUB</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>

      {values.pricing_type === "fixed" && (
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Цена
          </label>
          <input
            type="number"
            min={0}
            value={values.fixed_price}
            onChange={(e) => onChange({ ...values, fixed_price: e.target.value })}
            className={inputClass("fixed_price")}
          />
          {errors?.fixed_price && (
            <p className="text-xs text-destructive mt-1">{errors.fixed_price}</p>
          )}
        </div>
      )}

      {values.pricing_type === "hourly" && (
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Ставка в час
          </label>
          <input
            type="number"
            min={0}
            value={values.hourly_rate}
            onChange={(e) => onChange({ ...values, hourly_rate: e.target.value })}
            className={inputClass("hourly_rate")}
          />
          {errors?.hourly_rate && (
            <p className="text-xs text-destructive mt-1">{errors.hourly_rate}</p>
          )}
        </div>
      )}

      {values.pricing_type === "monthly" && (
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Ставка в месяц
          </label>
          <input
            type="number"
            min={0}
            value={values.monthly_rate}
            onChange={(e) => onChange({ ...values, monthly_rate: e.target.value })}
            className={inputClass("monthly_rate")}
          />
          {errors?.monthly_rate && (
            <p className="text-xs text-destructive mt-1">{errors.monthly_rate}</p>
          )}
        </div>
      )}

      {values.pricing_type === "tiered" && (
        <div className="space-y-3">
          {values.tiers.map((tier, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={tier.min_qty}
                onChange={(e) =>
                  handleTierUpdate(index, { min_qty: Number(e.target.value) })
                }
                placeholder="От кол-ва"
                className={cn(inputClass(`tier-qty-${index}`), "max-w-[120px]")}
              />
              <input
                type="number"
                min={0}
                value={tier.price}
                onChange={(e) =>
                  handleTierUpdate(index, { price: Number(e.target.value) })
                }
                placeholder="Цена"
                className={cn(inputClass(`tier-price-${index}`), "flex-1")}
              />
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...values,
                    tiers: values.tiers.filter((_, i) => i !== index),
                  })
                }
                className="h-10 w-10 rounded-xl border border-border text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center flex-shrink-0"
                aria-label="Удалить ступень"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange({
                ...values,
                tiers: [...values.tiers, { min_qty: 1, price: 0 }],
              })
            }
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-dashed border-border text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus size={15} /> Добавить ступень
          </button>
          {errors?.tiers && (
            <p className="text-xs text-destructive">{errors.tiers}</p>
          )}
        </div>
      )}
    </div>
  )
}
