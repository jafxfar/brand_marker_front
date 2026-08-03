"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useAdminCatalogActionMutation } from "@/hooks/api/use-admin-catalog-query"
import { getApiErrorMessage } from "@/lib/api/client"
import type { AdminCatalogAction } from "@/lib/api/admin"

const actionMetadata: Record<
  AdminCatalogAction,
  { title: string; description: string; success: string; destructive?: boolean }
> = {
  approve: {
    title: "Одобрить позицию?",
    description: "Позиция станет активной и появится в публичном каталоге.",
    success: "Позиция одобрена",
  },
  hide: {
    title: "Скрыть позицию?",
    description: "Позиция исчезнет из публичного каталога до повторного одобрения.",
    success: "Позиция скрыта",
    destructive: true,
  },
  request_changes: {
    title: "Запросить изменения?",
    description: "Владелец получит уведомление с указанной причиной.",
    success: "Запрос изменений отправлен",
  },
  delete: {
    title: "Удалить позицию?",
    description: "Позиция будет мягко удалена и скрыта из всех очередей.",
    success: "Позиция удалена",
    destructive: true,
  },
}

const actionsRequiringReason = new Set<AdminCatalogAction>([
  "hide",
  "request_changes",
  "delete",
])

type CatalogActionDialogProps = {
  itemId: number
  itemTitle: string
  action: AdminCatalogAction | null
  onOpenChange: (open: boolean) => void
}

export const CatalogActionDialog = ({
  itemId,
  itemTitle,
  action,
  onOpenChange,
}: CatalogActionDialogProps) => {
  const [reason, setReason] = useState("")
  const actionMutation = useAdminCatalogActionMutation()
  const metadata = action ? actionMetadata[action] : null
  const reasonRequired = action ? actionsRequiringReason.has(action) : false

  useEffect(() => {
    if (!action) setReason("")
  }, [action])

  const handleSubmit = async () => {
    if (!action || !metadata) return
    if (reasonRequired && !reason.trim()) {
      toast.error("Укажите причину действия")
      return
    }

    try {
      await actionMutation.mutateAsync({
        itemId,
        action,
        reason: reason.trim() || undefined,
      })
      toast.success(metadata.success)
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось изменить статус позиции"))
    }
  }

  return (
    <Dialog open={Boolean(action)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{metadata?.title}</DialogTitle>
          <DialogDescription>
            {itemTitle}. {metadata?.description}
          </DialogDescription>
        </DialogHeader>
        {reasonRequired && (
          <div className="space-y-2">
            <label htmlFor="catalog-action-reason" className="text-sm font-semibold">
              Причина <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="catalog-action-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Опишите причину для владельца и журнала аудита"
              rows={5}
              maxLength={2000}
            />
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={actionMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant={metadata?.destructive ? "destructive" : "default"}
            disabled={actionMutation.isPending || (reasonRequired && !reason.trim())}
            onClick={handleSubmit}
          >
            {actionMutation.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
            Подтвердить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
