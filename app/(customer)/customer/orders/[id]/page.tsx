"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft, ShoppingCart, FileText, Truck, Wallet, ShieldCheck,
  CheckCircle2, AlertTriangle, Star, Users, Package, Hash, Palette,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useOrdersStore } from "@/lib/store/orders-store"
import { useNotificationsStore } from "@/lib/store/notifications-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { formatPrice, formatRelativeTime } from "@/lib/format"
import { orderStatusMeta, escrowMeta, paymentSchemeMeta } from "@/lib/order-display"
import OfferCard from "@/components/cabinet/offer-card"
import PaymentDialog from "@/components/cabinet/payment-dialog"
import DisputeDialog from "@/components/cabinet/dispute-dialog"
import ReviewDialog from "@/components/cabinet/review-dialog"

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const hydrated = useHydrated()

  const order = useOrdersStore((s) => s.orders.find((o) => o.id === params.id))
  const acceptOffer = useOrdersStore((s) => s.acceptOffer)
  const pay = useOrdersStore((s) => s.pay)
  const releasePayment = useOrdersStore((s) => s.releasePayment)
  const openDispute = useOrdersStore((s) => s.openDispute)
  const resolveDispute = useOrdersStore((s) => s.resolveDispute)
  const leaveReview = useOrdersStore((s) => s.leaveReview)
  const notify = useNotificationsStore((s) => s.add)

  const [payOpen, setPayOpen] = useState(false)
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  if (!hydrated) return null

  if (!order) {
    return (
      <div className="max-w-[900px] mx-auto text-center py-16">
        <p className="text-lg font-bold text-foreground">Заказ не найден</p>
        <Link href="/customer/orders" className="text-primary font-semibold hover:underline mt-2 inline-block">
          ← К списку заказов
        </Link>
      </div>
    )
  }

  const acceptedOffer = order.offers.find((o) => o.id === order.acceptedOfferId)
  const amount = acceptedOffer?.price ?? order.budget
  const statusMeta = orderStatusMeta[order.status]
  const escrow = order.payment?.escrow ?? "none"

  const handleAccept = (offerId: string) => {
    acceptOffer(order.id, offerId)
    const offer = order.offers.find((o) => o.id === offerId)
    notify({
      type: "offer",
      title: "Исполнитель выбран",
      body: `Вы выбрали «${offer?.supplierName}» для заказа «${order.title}». Перейдите к оплате.`,
      href: `/customer/orders/${order.id}`,
    })
  }

  const handlePay = (scheme: typeof order.preferredScheme) => {
    if (!scheme) return
    pay(order.id, scheme, amount)
    notify({
      type: "payment",
      title: "Оплата в эскроу",
      body: `Средства по заказу «${order.title}» удержаны в эскроу до приёмки работы.`,
      href: `/customer/orders/${order.id}`,
    })
  }

  const handleRelease = () => {
    releasePayment(order.id)
    notify({
      type: "payment",
      title: "Работа принята",
      body: `Средства по заказу «${order.title}» переведены поставщику.`,
      href: `/customer/orders/${order.id}`,
    })
  }

  const handleDispute = (reason: string) => {
    openDispute(order.id, reason)
    notify({
      type: "system",
      title: "Спор открыт",
      body: `По заказу «${order.title}» открыт спор. Средства заморожены.`,
      href: `/customer/orders/${order.id}`,
    })
  }

  const handleReview = (rating: number, text: string) => {
    leaveReview(order.id, rating, text)
    notify({
      type: "system",
      title: "Отзыв отправлен",
      body: `Спасибо за отзыв о заказе «${order.title}».`,
    })
  }

  const KindIcon = order.kind === "product" ? ShoppingCart : FileText

  return (
    <div className="max-w-[1000px] mx-auto">
      <Link
        href="/customer/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft size={16} /> К списку заказов
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
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

            {/* Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              <Attribute Icon={Wallet} label="Бюджет" value={formatPrice(order.budget)} />
              <Attribute Icon={Package} label="Количество" value={String(order.qty)} />
              {order.color && <Attribute Icon={Palette} label="Цвет" value={order.color} />}
              {order.sku && <Attribute Icon={Hash} label="Артикул" value={order.sku} />}
              <Attribute
                Icon={Truck}
                label="Доставка"
                value={order.needsDelivery ? "Требуется" : "Не требуется"}
              />
              {order.preferredScheme && (
                <Attribute
                  Icon={ShieldCheck}
                  label="Схема оплаты"
                  value={paymentSchemeMeta[order.preferredScheme].label}
                />
              )}
            </div>
          </div>

          {/* Dispute panel */}
          {order.dispute && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-red-600" />
                <h2 className="text-sm font-bold text-red-700">Открыт спор</h2>
              </div>
              <p className="text-sm text-red-700/80">{order.dispute.reason}</p>
              <p className="text-[11px] text-red-600/70 mt-1">{formatRelativeTime(order.dispute.createdAt)}</p>
              {order.status === "disputed" && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => resolveDispute(order.id, true)}
                    className="h-9 px-4 rounded-xl border border-red-300 text-red-700 text-sm font-semibold hover:bg-red-100 transition-colors"
                  >
                    Вернуть средства
                  </button>
                  <button
                    onClick={() => resolveDispute(order.id, false)}
                    className="h-9 px-4 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Разрешить в пользу поставщика
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Review display */}
          {order.review && (
            <div className="bg-white border border-border rounded-2xl p-5">
              <h2 className="text-sm font-bold text-foreground mb-2">Ваш отзыв</h2>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={16}
                    className={n <= order.review!.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}
                  />
                ))}
              </div>
              {order.review.text && <p className="text-sm text-foreground/80">{order.review.text}</p>}
            </div>
          )}

          {/* Offers */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Отклики поставщиков ({order.offers.length})
              </h2>
            </div>
            {order.offers.length === 0 ? (
              <div className="bg-white border border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
                Откликов пока нет. Поставщики категории уведомлены.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {order.offers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    accepted={order.acceptedOfferId === offer.id}
                    locked={!!order.acceptedOfferId && order.acceptedOfferId !== offer.id}
                    onAccept={() => handleAccept(offer.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: escrow & actions */}
        <div className="space-y-4">
          <div className="bg-white border border-border rounded-2xl p-5 lg:sticky lg:top-[84px]">
            <h2 className="text-sm font-bold text-foreground mb-3">Оплата и эскроу</h2>

            {acceptedOffer ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary mb-4">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold", acceptedOffer.supplierColor)}>
                  {acceptedOffer.supplierInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{acceptedOffer.supplierName}</p>
                  <p className="text-[11px] text-muted-foreground">Выбранный исполнитель</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-4">
                Выберите исполнителя из откликов, чтобы перейти к оплате.
              </p>
            )}

            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Сумма</span>
              <span className="font-bold text-foreground">{formatPrice(amount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-muted-foreground">Статус</span>
              <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", escrowMeta[escrow].className)}>
                {escrowMeta[escrow].label}
              </span>
            </div>

            {order.payment && order.payment.releasedAmount > 0 && order.payment.escrow === "held" && (
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 -mt-2">
                <span>Выплачено авансом</span>
                <span>{formatPrice(order.payment.releasedAmount)}</span>
              </div>
            )}

            {/* Action buttons by state */}
            <div className="space-y-2">
              {acceptedOffer && !order.payment && (
                <button
                  onClick={() => setPayOpen(true)}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-[oklch(0.58_0.22_38)] text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Wallet size={16} /> Оплатить через эскроу
                </button>
              )}

              {escrow === "held" && (
                <>
                  <button
                    onClick={handleRelease}
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:opacity-90 text-white text-sm font-bold transition-opacity flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Принять работу
                  </button>
                  <button
                    onClick={() => setDisputeOpen(true)}
                    className="w-full h-11 rounded-xl border border-destructive/40 text-destructive text-sm font-bold hover:bg-destructive/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertTriangle size={16} /> Оспорить
                  </button>
                </>
              )}

              {order.status === "completed" && !order.review && (
                <button
                  onClick={() => setReviewOpen(true)}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-[oklch(0.58_0.22_38)] text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Star size={16} /> Оставить отзыв
                </button>
              )}

              {order.status === "completed" && order.review && (
                <div className="flex items-center justify-center gap-2 h-11 rounded-xl bg-secondary text-emerald-700 text-sm font-bold">
                  <CheckCircle2 size={16} /> Заказ завершён
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 mt-4 text-[11px] text-muted-foreground">
              <ShieldCheck size={14} className="text-primary flex-shrink-0 mt-0.5" />
              Деньги переводятся поставщику только после того, как вы примете работу.
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <PaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        kind={order.kind}
        amount={amount}
        defaultScheme={order.preferredScheme}
        onConfirm={handlePay}
      />
      <DisputeDialog open={disputeOpen} onOpenChange={setDisputeOpen} onConfirm={handleDispute} />
      <ReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        supplierName={acceptedOffer?.supplierName ?? "поставщик"}
        onConfirm={handleReview}
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
