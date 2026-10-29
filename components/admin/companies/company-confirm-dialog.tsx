"use client"

import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type CompanyConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel?: string
  destructive?: boolean
  pending?: boolean
  confirmDisabled?: boolean
  onConfirm: () => void
  children?: ReactNode
}

export const CompanyConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Подтвердить",
  destructive = false,
  pending = false,
  confirmDisabled = false,
  onConfirm,
  children,
}: CompanyConfirmDialogProps) => (
  <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {children}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => onOpenChange(false)}
        >
          Отмена
        </Button>
        <Button
          type="button"
          variant={destructive ? "destructive" : "default"}
          disabled={pending || confirmDisabled}
          onClick={onConfirm}
        >
          {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
