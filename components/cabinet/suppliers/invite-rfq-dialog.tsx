"use client"

import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { RfqWithRelations } from "@/types"
import { RfqStatusBadge } from "@/components/rfq/rfq-status-badge"

type InviteRfqDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierId: number
  supplierName: string
  invitableRfqs: RfqWithRelations[]
  onInviteExisting: (rfqId: string) => void
}

export const InviteRfqDialog = ({
  open,
  onOpenChange,
  supplierId,
  supplierName,
  invitableRfqs,
  onInviteExisting,
}: InviteRfqDialogProps) => {
  const router = useRouter()

  const handleNewRfq = () => {
    onOpenChange(false)
    router.push(`/customer/rfqs/new?supplierId=${supplierId}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Пригласить к заявке</DialogTitle>
          <DialogDescription>
            Выберите существующую заявку или создайте новую для {supplierName}
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={handleNewRfq}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-dark transition-colors"
        >
          Создать новую заявку
        </button>

        {invitableRfqs.length > 0 ? (
          <div className="space-y-2 mt-2">
            <p className="text-xs font-semibold text-muted-foreground">Существующие заявки</p>
            {invitableRfqs.map((rfq) => {
              const alreadyInvited = rfq.invited_supplier_ids?.includes(supplierId)
              return (
                <button
                  key={rfq.id}
                  type="button"
                  disabled={alreadyInvited}
                  onClick={() => {
                    onInviteExisting(rfq.id)
                    onOpenChange(false)
                  }}
                  className="w-full text-left rounded-xl border border-border p-3 hover:border-primary/30 hover:bg-secondary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <p className="text-sm font-semibold text-foreground truncate">{rfq.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <RfqStatusBadge status={rfq.status} />
                    {alreadyInvited && (
                      <span className="text-[10px] text-muted-foreground">Уже приглашён</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">
            Нет активных заявок для приглашения
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
