"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/format"
import type { Currency } from "@/types"

type AcceptProposalDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierName: string
  price: number
  currency: Currency
  onConfirm: () => void
}

export const AcceptProposalDialog = ({
  open,
  onOpenChange,
  supplierName,
  price,
  currency,
  onConfirm,
}: AcceptProposalDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md rounded-2xl">
      <DialogHeader>
        <DialogTitle>Принять предложение?</DialogTitle>
        <DialogDescription>
          Вы выбираете поставщика {supplierName} на сумму{" "}
          {formatCurrency(price, currency)}. Будет создан контракт, остальные предложения отклонены.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2 sm:gap-0">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm()
            onOpenChange(false)
          }}
          className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-dark transition-colors"
        >
          Принять и создать контракт
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
