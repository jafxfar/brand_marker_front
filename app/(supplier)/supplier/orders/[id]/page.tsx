"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft, ShoppingCart, FileText, Truck, Wallet, ShieldCheck,
  Package, Hash, Palette, Send, CheckCircle2, Clock, Star, User,
  AlertTriangle, Crown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/auth-store"
import { useOrdersStore } from "@/lib/store/orders-store"
import { useNotificationsStore } from "@/lib/store/notifications-store"
import { useSubscriptionStore } from "@/lib/store/subscription-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { formatPrice, formatRelativeTime } from "@/lib/format"
import { orderStatusMeta, escrowMeta, paymentSchemeMeta } from "@/lib/order-display"
import { currentSupplier } from "@/lib/supplier"
import RespondDialog, { type RespondValues } from "@/components/supplier/respond-dialog"

export default function SupplierOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === params.id))
  const addOffer = useOrdersStore((s) => s.addOffer)
  const notify = useNotificationsStore((s) => s.add)
  const isSubActive = useSubscriptionStore((s) => s.isActive)
  const [respondOpen, setRespondOpen] = useState(false)

  if (!hydrated) return null

  if (!order || !user) {
    return (
      <div className="max-w-[900px] mx-auto text-center py-16">
        <p className="text-lg font-bold text-foreground">Заказ не найден</p>
        <Link href="/supplier/orders" className="text-primary font-semibold hover:underline mt-2 inline-block">
          ← К заказам
        </Link>
      </div>
    )
  }

  const myOffer = order.offers.find((of) => of.supplierId === user.id)
  const isAccepted = !!order.acceptedOfferId && order.acceptedOfferId === myOffer?.id
  const lostToOther = !!order.acceptedOfferId && order.acceptedOfferId !== myOffer?.id
  const statusMeta = orderStatusMeta[order.status]
  const escrow = order.payment?.escrow ?? "none"
  const KindIcon = order.kind === "product" ? ShoppingCart : FileText

  const handleRespond = (values: RespondValues) => {
    const me = currentSupplier(user)
    const promoted = isSubActive()
    addOffer(order.id, {
      supplierId: me.id,
      supplierName: me.name,
      supplierInitials: me.initials,
      supplierColor: me.color,
      rating: me.rating,
      reviews: me.reviews,
      price: values.price,
      message: values.message,
      daysToComplete: values.daysToComplete,
      verified: me.verified,
      promoted,
    })
    notify({
      type: "offer",
      title: "Отклик отправлен",
      body: `Вы откликнулись на «${order.title}» за ${formatPrice(values.price)}.`,
      href: `/supplier/orders/${order.id}`,
    })
  }

  return (
    <div className="max-w-[1000px] mx-auto">
      <Link
        href="/supplier/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft size={16} /> К заказам
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <KindIcon size={22} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black text-foreground">{order.title}</h1>
                  <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full", statusMeta.className)}>
                    {statusMeta.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {order.category} · {order.kind === "product" ? "Товар" : "Услуга"} · {formatRelativeTime(order.createdAt)}
                </p>
              </div>
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed mt-4">{order.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              <Attribute Icon={Wallet} label="Бюджет" value={formatPrice(order.budget)} />
              <Attribute Icon={Package} label="Количество" value={String(order.qty)} />
              {order.color && <Attribute Icon={Palette} label="Цвет" value={order.color} />}
              {order.sku && <Attribute Icon={Hash} label="Артикул" value={order.sku} />}
              <Attribute Icon={Truck} label="Доставка" value={order.needsDelivery ? "Требуется" : "Не требуется"} />
              {order.preferredScheme && (
                <Attribute Icon={ShieldCheck} label="Оплата" value={paymentSchemeMeta[order.preferredScheme].label} />
              )}
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h2 className="text-sm font-bold text-foreground mb-3">Заказчик</h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{order.customerName ?? "Заказчик"}</p>
                <p className="text-xs text-muted-foreground">{order.customerCity ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* My offer */}
          {myOffer && (
            <div className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-bold text-foreground">Ваш отклик</h2>
                {myOffer.promoted && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-primary">
                    <Crown size={11} /> Продвигается
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm">
                  <Wallet size={14} className="text-primary" />
                  <span className="font-bold text-foreground">{formatPrice(myOffer.price)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock size={14} /> {myOffer.daysToComplete} дн
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{myOffer.message}</p>
            </div>
          )}
        </div>

        {/* Sidebar action */}
        <div className="space-y-4">
          <div className="bg-white border border-border rounded-2xl p-5 lg:sticky lg:top-[84px]">
            <h2 className="text-sm font-bold text-foreground mb-3">Статус</h2>

            {isAccepted ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-bold">Ваш отклик принят</span>
                </div>
                {order.payment && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Эскроу</span>
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", escrowMeta[escrow].className)}>
                      {escrowMeta[escrow].label}
                    </span>
                  </div>
                )}
                {order.status === "completed" && (
                  <p className="text-xs text-emerald-700 font-semibold">Сделка завершена, оплата выплачена.</p>
                )}
                {order.dispute && (
                  <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 rounded-xl p-2.5">
                    <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                    Заказчик открыл спор: {order.dispute.reason}
                  </div>
                )}
              </div>
            ) : lostToOther ? (
              <p className="text-sm text-muted-foreground">
                Заказчик выбрал другого исполнителя по этому заказу.
              </p>
            ) : myOffer ? (
              <p className="text-sm text-muted-foreground">
                Отклик отправлен. Ожидайте решения заказчика.
              </p>
            ) : order.status === "published" ? (
              <>
                <p className="text-xs text-muted-foreground mb-4">
                  Откликнитесь на заказ, предложив цену и сроки.
                </p>
                <button
                  onClick={() => setRespondOpen(true)}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-[oklch(0.58_0.22_38)] text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Откликнуться
                </button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Заказ больше не принимает отклики.</p>
            )}

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border text-sm">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="text-muted-foreground">Откликов всего:</span>
              <span className="font-bold text-foreground ml-auto">{order.offers.length}</span>
            </div>
          </div>
        </div>
      </div>

      <RespondDialog
        open={respondOpen}
        onOpenChange={setRespondOpen}
        budget={order.budget}
        promoted={isSubActive()}
        onConfirm={handleRespond}
      />
    </div>
  )
}

function Attribute({
  Icon, label, value,
}: {
  Icon: typeof Wallet; label: string; value: string
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        <Icon size={13} />
        <span className="text-[11px]">{label}</span>
      </div>
      <div className="text-sm font-bold text-foreground truncate">{value}</div>
    </div>
  )
}
