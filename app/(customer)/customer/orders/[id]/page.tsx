"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, ShoppingCart, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import { useOrdersStore } from "@/lib/store/orders-store"
import {
  useBuyerOrderQuery,
  useAcceptBuyerOfferMutation,
  useCancelBuyerOrderMutation,
} from "@/hooks/api/use-buyer-orders-query"
import { formatPrice, formatRelativeIso } from "@/lib/format"
import { orderStatusMeta } from "@/lib/order-display"
import { apiOrderToLocal, type Order } from "@/types"

type PageProps = {
  params: Promise<{ id: string }>
}

export default function BuyerOrderDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const getOrderLocal = useOrdersStore((s) => s.getOrder)
  const acceptOfferLocal = useOrdersStore((s) => s.acceptOffer)
  const cancelOrderLocal = useOrdersStore((s) => s.cancelOrder)

  const { data: apiOrder, isLoading } = useBuyerOrderQuery(id, hydrated && useApi)
  const acceptMutation = useAcceptBuyerOfferMutation()
  const cancelMutation = useCancelBuyerOrderMutation()

  const localOrder = hydrated ? getOrderLocal(id) : undefined
  const order: Order | undefined = useApi
    ? (apiOrder ? apiOrderToLocal(apiOrder) : undefined)
    : localOrder

  if (!hydrated || (useApi && isLoading)) {
    return (
      <div className="max-w-[900px] mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-secondary rounded-xl w-1/3" />
        <div className="h-48 bg-secondary rounded-2xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-[900px] mx-auto text-center py-16">
        <p className="text-lg font-bold text-foreground">Заказ не найден</p>
        <Link href="/customer/orders" className="text-primary font-semibold hover:underline mt-2 inline-block">
          ← К заказам
        </Link>
      </div>
    )
  }

  const meta = orderStatusMeta[order.status]
  const KindIcon = order.kind === "product" ? ShoppingCart : FileText
  const createdAt =
    typeof order.createdAt === "string"
      ? formatRelativeIso(order.createdAt)
      : formatRelativeIso(new Date(order.createdAt).toISOString())

  const handleAcceptOffer = (offerId: string) => {
    if (useApi) {
      acceptMutation.mutate({ orderId: order.id, offerId })
      return
    }
    acceptOfferLocal(order.id, offerId)
  }

  const handleCancel = () => {
    if (useApi) {
      cancelMutation.mutate(order.id)
      return
    }
    cancelOrderLocal(order.id)
  }

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <Link
        href="/customer/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} /> К заказам
      </Link>

      <div className="bg-white border border-border rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
            <KindIcon size={22} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-foreground">{order.title}</h1>
              <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full", meta.className)}>
                {meta.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {order.category ?? "—"} · {createdAt}
            </p>
          </div>
        </div>

        <p className="text-sm text-foreground/80 leading-relaxed mt-4">{order.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 text-sm">
          <div className="rounded-xl bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">Бюджет</p>
            <p className="font-bold text-foreground">{formatPrice(order.budget)}</p>
          </div>
          <div className="rounded-xl bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">Количество</p>
            <p className="font-bold text-foreground">{order.qty}</p>
          </div>
          <div className="rounded-xl bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">Доставка</p>
            <p className="font-bold text-foreground">{order.needsDelivery ? "Да" : "Нет"}</p>
          </div>
        </div>

        {order.status === "published" && (
          <button
            type="button"
            onClick={handleCancel}
            className="mt-4 text-sm text-destructive hover:underline"
          >
            Отменить заказ
          </button>
        )}
      </div>

      <section className="bg-white border border-border rounded-2xl p-6">
        <h2 className="text-base font-bold text-foreground mb-4">
          Отклики поставщиков ({order.offers.length})
        </h2>

        {order.offers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет откликов</p>
        ) : (
          <div className="space-y-3">
            {order.offers.map((offer) => {
              const isAccepted = order.acceptedOfferId === offer.id
              return (
                <div
                  key={offer.id}
                  className={cn(
                    "border rounded-xl p-4",
                    isAccepted ? "border-emerald-300 bg-emerald-50/50" : "border-border",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {offer.supplierName ?? `Поставщик #${offer.supplierId}`}
                      </p>
                      {offer.message && (
                        <p className="text-sm text-muted-foreground mt-1">{offer.message}</p>
                      )}
                      {offer.deliveryDays != null && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Срок: {offer.deliveryDays} дн.
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-primary">{formatPrice(offer.price)}</p>
                      {isAccepted ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 mt-1">
                          <CheckCircle2 size={14} /> Принят
                        </span>
                      ) : (
                        order.status === "published" && (
                          <button
                            type="button"
                            onClick={() => handleAcceptOffer(offer.id)}
                            className="mt-2 text-xs font-semibold text-primary hover:underline"
                          >
                            Принять
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
