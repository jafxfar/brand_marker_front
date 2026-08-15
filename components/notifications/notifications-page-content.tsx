"use client"

import Link from "next/link"
import {
  Bell, FileText, Users, Wallet, Info, CheckCheck, Trash2,
  FileCheck, ScrollText, type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useHydrated } from "@/hooks/use-hydrated"
import { formatRelativeTime } from "@/lib/format"
import type { NotificationRole } from "@/lib/api/notifications"
import type { NotificationType } from "@/types/notification"
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/hooks/api/use-notifications-query"
import { useNotificationItems } from "@/hooks/use-notifications"
import { useNotificationsStore } from "@/lib/store/notifications-store"
import { Button } from "@/components/ui/button"
import { PageEmptyState, PageFrame, PageHeader, PageSurface } from "@/components/layout"

const typeIcon: Record<NotificationType, LucideIcon> = {
  order: FileText,
  offer: Users,
  payment: Wallet,
  system: Info,
  rfq: ScrollText,
  contract: FileCheck,
  proposal: Users,
}

type NotificationsPageContentProps = {
  role: NotificationRole
}

export const NotificationsPageContent = ({ role }: NotificationsPageContentProps) => {
  const hydrated = useHydrated()
  const { items, isLoading, useApi } = useNotificationItems(role)
  const markReadLocal = useNotificationsStore((s) => s.markRead)
  const markAllReadLocal = useNotificationsStore((s) => s.markAllRead)
  const removeLocal = useNotificationsStore((s) => s.remove)
  const markReadMutation = useMarkNotificationReadMutation(role)
  const markAllReadMutation = useMarkAllNotificationsReadMutation(role)

  const hasUnread = items.some((n) => !n.read)
  const notificationsHref = role === "supplier" ? "/supplier/notifications" : "/customer/notifications"

  const handleMarkRead = (id: string, apiId?: number) => {
    if (useApi && apiId) {
      markReadMutation.mutate(apiId)
      return
    }
    markReadLocal(id)
  }

  const handleMarkAllRead = () => {
    if (useApi) {
      markAllReadMutation.mutate()
      return
    }
    markAllReadLocal()
  }

  return (
    <PageFrame>
      <PageHeader
        title="Уведомления"
        description="События по вашим заказам и платежам"
        actions={
          hydrated && hasUnread ? (
            <Button type="button" variant="ghost" size="lg" onClick={handleMarkAllRead}>
              <CheckCheck size={15} /> Прочитать все
            </Button>
          ) : undefined
        }
      />

      {!hydrated || isLoading ? (
        <PageSurface>
          <PageEmptyState title="Загрузка уведомлений..." />
        </PageSurface>
      ) : items.length === 0 ? (
        <PageSurface>
          <PageEmptyState
            icon={<Bell size={26} />}
            title="Уведомлений нет"
            description="Здесь появятся события: новые отклики, статусы оплаты и споров"
          />
        </PageSurface>
      ) : (
        <div className="space-y-2.5">
          {items.map((n) => {
            const Icon = typeIcon[n.type] ?? Info
            const content = (
              <div
                className={cn(
                  "flex items-start gap-3 p-4 rounded-2xl border transition-colors",
                  n.read ? "bg-white border-border" : "bg-secondary/50 border-primary/20",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    n.read ? "bg-secondary text-muted-foreground" : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </div>
                {!useApi && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      removeLocal(n.id)
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
                    aria-label="Удалить"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            )

            const href = n.href ?? notificationsHref
            return (
              <Link
                key={n.id}
                href={href}
                onClick={() => handleMarkRead(n.id, n.apiId)}
                className="block"
              >
                {content}
              </Link>
            )
          })}
        </div>
      )}
    </PageFrame>
  )
}
