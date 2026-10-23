"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ProposalForm,
  type ProposalFormValues,
} from "@/components/supplier/proposal-form"
import { formatRfqBudget } from "@/lib/format"
import type { BudgetType, Currency } from "@/types"

export type { ProposalFormValues }

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
}: ProposalDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="rounded-2xl sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Предложить цену</DialogTitle>
        <DialogDescription>
          Заявка: {rfqTitle}. Бюджет:{" "}
          {formatRfqBudget(budgetType, budgetFrom, budgetTo, currency)}.
        </DialogDescription>
      </DialogHeader>
      <ProposalForm
        active={open}
        variant="dialog"
        currency={currency}
        budgetType={budgetType}
        budgetFrom={budgetFrom}
        budgetTo={budgetTo}
        defaultPrice={defaultPrice}
        submitLabel="Отправить предложение"
        onCancel={() => onOpenChange(false)}
        onSubmit={(values) => {
          onSubmit(values)
          onOpenChange(false)
        }}
      />
    </DialogContent>
  </Dialog>
)
