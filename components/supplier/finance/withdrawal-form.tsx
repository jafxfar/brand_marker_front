"use client"

import { useState } from "react"
import { ArrowDownToLine, Building2, Wallet } from "lucide-react"
import type { SupplierBalanceSummary, WithdrawalDestination } from "@/types"
import { destinationTypeLabel } from "@/lib/finance-display"
import { formatCurrency } from "@/lib/format"

type WithdrawalFormProps = {
  destinations: WithdrawalDestination[]
  balances: SupplierBalanceSummary
  onSubmit: (input: { destinationId: number; amount: number }) => RequestWithdrawalResult
}

type RequestWithdrawalResult =
  | { ok: true }
  | { ok: false; error: string }

export const WithdrawalForm = ({
  destinations,
  balances,
  onSubmit,
}: WithdrawalFormProps) => {
  const defaultDestination =
    destinations.find((d) => d.is_default) ?? destinations[0]
  const [destinationId, setDestinationId] = useState(
    defaultDestination?.id ?? 0,
  )
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = () => {
    setError("")
    setSuccess("")
    const parsed = Number(amount.replace(/\s/g, "").replace(",", "."))
    const result = onSubmit({ destinationId, amount: parsed })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setAmount("")
    setSuccess("Заявка на вывод создана")
  }

  if (destinations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Нет привязанных счетов или кошельков</p>
    )
  }

  return (
    <div className="rounded-xl border border-border p-4 space-y-4">
      <div>
        <label htmlFor="withdrawal-destination" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
          Счёт / кошелёк
        </label>
        <div className="mt-2 space-y-2">
          {destinations.map((destination) => {
            const isSelected = destinationId === destination.id
            const Icon = destination.type === "bank" ? Building2 : Wallet
            return (
              <button
                key={destination.id}
                type="button"
                onClick={() => setDestinationId(destination.id)}
                className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-secondary/50"
                }`}
                aria-pressed={isSelected}
              >
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{destination.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {destinationTypeLabel(destination.type)} · {destination.details}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label htmlFor="withdrawal-amount" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
          Сумма
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="withdrawal-amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            aria-label="Сумма вывода"
            className="flex-1 h-11 px-4 rounded-xl border border-input bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setAmount(String(balances.available))}
            className="h-11 px-3 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition-colors whitespace-nowrap"
          >
            Максимум
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          Доступно: {formatCurrency(balances.available, balances.currency)}
        </p>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      {success && <p className="text-xs text-primary font-medium">{success}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={balances.available <= 0}
        className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
      >
        <ArrowDownToLine size={16} />
        Вывести средства
      </button>
    </div>
  )
}
