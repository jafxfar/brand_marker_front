"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { WithdrawalDestinationType } from "@/types"

type PayoutDestinationInput = {
  type: WithdrawalDestinationType
  label: string
  details: string
}

type AddPayoutDestinationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  busy?: boolean
  onSubmit: (input: PayoutDestinationInput) => Promise<void> | void
}

const TYPE_OPTIONS: { value: WithdrawalDestinationType; label: string; detailsLabel: string; placeholder: string }[] = [
  { value: "bank", label: "Банковский счёт", detailsLabel: "Номер счёта или IBAN", placeholder: "TJ00 0000 0000 0000 0000" },
  { value: "wallet", label: "Карта или кошелёк", detailsLabel: "Номер карты или кошелька", placeholder: "0000 0000 0000 0000" },
]

const LABEL_MAX = 60
const DETAILS_MAX = 64

export const AddPayoutDestinationDialog = ({
  open,
  onOpenChange,
  busy = false,
  onSubmit,
}: AddPayoutDestinationDialogProps) => {
  const [type, setType] = useState<WithdrawalDestinationType>("bank")
  const [label, setLabel] = useState("")
  const [details, setDetails] = useState("")
  const [error, setError] = useState<string | null>(null)

  const option = TYPE_OPTIONS.find((o) => o.value === type) ?? TYPE_OPTIONS[0]

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setLabel("")
      setDetails("")
      setError(null)
    }
    onOpenChange(next)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmedLabel = label.trim()
    const trimmedDetails = details.trim()
    if (!trimmedLabel || !trimmedDetails) {
      setError("Заполните название и реквизиты")
      return
    }
    setError(null)
    try {
      await onSubmit({ type, label: trimmedLabel, details: trimmedDetails })
      handleOpenChange(false)
    } catch {
      // error toast comes from the mutation meta
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Счёт для выплат</DialogTitle>
            <DialogDescription>
              Сюда вы будете выводить деньги за принятые работы. Реквизиты видите только вы и
              администраторы площадки.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Тип счёта">
            {TYPE_OPTIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setType(item.value)}
                aria-pressed={type === item.value}
                className={cn(
                  "h-10 rounded-xl border text-sm font-semibold transition-colors",
                  type === item.value
                    ? "border-primary bg-secondary text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="payout-label">Название</Label>
            <Input
              id="payout-label"
              value={label}
              maxLength={LABEL_MAX}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Например: Основной счёт в Амонатбанке"
              autoComplete="off"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="payout-details">{option.detailsLabel}</Label>
            <Input
              id="payout-details"
              value={details}
              maxLength={DETAILS_MAX}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={option.placeholder}
              autoComplete="off"
              inputMode="text"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={busy} aria-busy={busy}>
              Сохранить счёт
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
