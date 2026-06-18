"use client"

import { useCallback, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/format"
import { PaymentTermsBuilder } from "@/components/cabinet/rfq/payment-terms-builder"
import type { Currency, ProposalAcceptInput } from "@/types"

type AcceptProposalDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierName: string
  price: number
  currency: Currency
  onConfirm: (terms: ProposalAcceptInput) => void
}

export const AcceptProposalDialog = ({
  open,
  onOpenChange,
  supplierName,
  price,
  currency,
  onConfirm,
}: AcceptProposalDialogProps) => {
  const [terms, setTerms] = useState<ProposalAcceptInput>({
    payment_type: "split_payment",
  })
  const [isValid, setIsValid] = useState(true)

  const handleTermsChange = useCallback(
    (value: ProposalAcceptInput, valid: boolean) => {
      setTerms(value)
      setIsValid(valid)
    },
    [],
  )

  const handleConfirm = () => {
    if (!isValid) return
    onConfirm(terms)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Принять предложение?</DialogTitle>
          <DialogDescription>
            Вы выбираете поставщика {supplierName} на сумму{" "}
            {formatCurrency(price, currency)}. Выберите тип оплаты — будет создан контракт,
            остальные предложения отклонены.
          </DialogDescription>
        </DialogHeader>

        <div className="py-1">
          <PaymentTermsBuilder
            price={price}
            currency={currency}
            onChange={handleTermsChange}
          />
        </div>

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
            onClick={handleConfirm}
            disabled={!isValid}
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Принять и создать контракт
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
