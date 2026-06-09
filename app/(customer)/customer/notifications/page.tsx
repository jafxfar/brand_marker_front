"use client"

import Link from "next/link"
import {
  Bell, FileText, Users, Wallet, Info, CheckCheck, Trash2, type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useNotificationsStore } from "@/lib/store/notifications-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { formatRelativeTime } from "@/lib/format"
import type { Notification } from "@/types"

const typeIcon: Record<Notification["type"], LucideIcon> = {
  order: FileText,
  offer: Users,
  payment: Wallet,
  system: Info,
}

export default function NotificationsPage() {
  const hydrated = useHydrated()
  const items = useNotificationsStore((s) => s.items)
  const markRead = useNotificationsStore((s) => s.markRead)
  const markAllRead = useNotificationsStore((s) => s.markAllRead)
  const remove = useNotificationsStore((s) => s.remove)

  const hasUnread = items.some((i) => !i.read)

  return (
    <div className="max-w-[800px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Bell size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Уведомления</h1>
            <p className="text-sm text-muted-foreground">События по вашим заказам и платежам</p>
          </div>
        </div>
        {hydrated && hasUnread && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <CheckCheck size={15} /> Прочитать все
          </button>
        )}
      </div>

      {!hydrated ? null : items.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Bell size={26} className="text-primary" />
          </div>
          <p className="text-base font-bold text-foreground">Уведомлений нет</p>
          <p className="text-sm text-muted-foreground mt-1">
            Здесь появятся события: новые отклики, статусы оплаты и споров
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((n) => {
            const Icon = typeIcon[n.type]
            const content = (
              <div
                className={cn(
                  "flex items-start gap-3 p-4 rounded-2xl border transition-colors",
                  n.read ? "bg-white border-border" : "bg-secondary/50 border-primary/20",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    n.read ? "bg-secondary text-muted-foreground" : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">{formatRelativeTime(n.createdAt)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    remove(n.id)
                  }}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 flex-shrink-0"
                  aria-label="Удалить"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )

            return n.href ? (
              <Link key={n.id} href={n.href} onClick={() => markRead(n.id)} className="block">
                {content}
              </Link>
            ) : (
              <button key={n.id} onClick={() => markRead(n.id)} className="block w-full text-left">
                {content}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
