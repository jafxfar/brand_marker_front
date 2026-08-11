"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ShoppingCart, Minus, Plus, Trash2, Package, Briefcase,
  Truck, ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/lib/store/cart-store"
import { useNotificationsStore } from "@/lib/store/notifications-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { formatPrice } from "@/lib/format"
import { isApiEnabled } from "@/lib/api/config"
import { useCreateBuyerOrderMutation } from "@/hooks/api/use-buyer-orders-query"
import { getSupplier as getMockSupplier } from "@/lib/mock/suppliers"
import PaymentDialog from "@/components/cabinet/payment-dialog"
import { TermHint } from "@/components/ui/term-hint"
import type { PaymentScheme } from "@/types"

export default function CartPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const items = useCartStore((s) => s.items)
  const setQty = useCartStore((s) => s.setQty)
  const remove = useCartStore((s) => s.remove)
  const clear = useCartStore((s) => s.clear)
  const notify = useNotificationsStore((s) => s.add)
  const createOrderMutation = useCreateBuyerOrderMutation()

  const [payOpen, setPayOpen] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  const handleCheckout = async (scheme: PaymentScheme) => {
    if (useApi) {
      setCheckingOut(true)
      try {
        for (const item of items) {
          await createOrderMutation.mutateAsync({
            kind: item.kind,
            title: item.title,
            description: `Заказ из корзины${item.sku ? ` · ${item.sku}` : ""}`,
            category_label: item.categoryLabel ?? undefined,
            budget: item.price * item.qty,
            qty: item.qty,
            needs_delivery: item.kind === "product",
          })
        }
        notify({
          type: "order",
          title: "Заказы оформлены",
          body: `${count} позиц. на сумму ${formatPrice(total)} опубликованы на маркетплейсе.`,
          href: "/customer/orders",
        })
        clear()
        router.push("/customer/orders")
      } finally {
        setCheckingOut(false)
      }
      return
    }

    const upfront = scheme === "full" ? total : Math.round(total / 2)
    notify({
      type: "payment",
      title: "Корзина оплачена безопасно",
      body: `${count} позиц. на сумму ${formatPrice(total)}. Заморожено до приёмки: ${formatPrice(upfront)}.`,
    })
    clear()
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="max-w-[900px] mx-auto">
        <h1 className="text-2xl font-black text-foreground mb-6">Корзина</h1>
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={26} className="text-primary" />
          </div>
          <p className="text-base font-bold text-foreground">Корзина пуста</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            Добавьте товары или услуги из каталога поставщиков
          </p>
          <Link
            href="/customer/suppliers"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1000px] mx-auto">
      <h1 className="text-2xl font-black text-foreground mb-6">Корзина</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {!hydrated
            ? null
            : items.map((item) => {
                const supplier = useApi ? null : getMockSupplier(String(item.supplierId))
                return (
                  <div
                    key={item.listingId}
                    className="bg-white border border-border rounded-2xl p-4 flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      {item.kind === "product" ? (
                        <Package size={20} className="text-primary" />
                      ) : (
                        <Briefcase size={20} className="text-primary" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground leading-snug">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {supplier?.name ?? "Поставщик"}
                        {item.color && item.color !== "—" ? ` · ${item.color}` : ""}
                        {item.sku ? ` · ${item.sku}` : ""}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        {/* Qty stepper */}
                        <div className="flex items-center border border-border rounded-lg">
                          <button
                            onClick={() => setQty(item.listingId, item.qty - 1)}
                            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                            aria-label="Уменьшить"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                          <button
                            onClick={() => setQty(item.listingId, item.qty + 1)}
                            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                            aria-label="Увеличить"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="text-sm font-black text-primary">
                          {formatPrice(item.price * item.qty)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => remove(item.listingId)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      aria-label="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}

          {hydrated && items.length > 0 && (
            <button
              onClick={clear}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5"
            >
              <Trash2 size={14} /> Очистить корзину
            </button>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white border border-border rounded-2xl p-5 lg:sticky lg:top-[84px]">
            <h2 className="text-sm font-bold text-foreground mb-4">Итого</h2>

            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Товаров и услуг</span>
              <span className="font-semibold text-foreground">{hydrated ? count : 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Сумма</span>
              <span className="font-semibold text-foreground">{formatPrice(hydrated ? total : 0)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mb-4">
              <Truck size={13} /> Доставка по договорённости с поставщиком
            </div>

            <div className="border-t border-border pt-4 mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">К оплате</span>
              <span className="text-lg font-black text-primary">{formatPrice(hydrated ? total : 0)}</span>
            </div>

            <button
              onClick={() => (useApi ? handleCheckout("full") : setPayOpen(true))}
              disabled={checkingOut}
              className={cn(
                "w-full h-11 rounded-xl text-white text-sm font-bold transition-colors flex items-center justify-center gap-2",
                "bg-primary hover:bg-primary-dark",
              )}
            >
              <ShieldCheck size={16} /> {checkingOut ? "Оформление…" : useApi ? "Оформить заказы" : "Оформить безопасно"}
            </button>

            <p className="text-[11px] text-muted-foreground mt-3 text-center inline-flex items-center justify-center gap-1 w-full flex-wrap">
              Оплата защищена <TermHint term="escrow">безопасной сделкой</TermHint>. Постоплата для товаров недоступна.
            </p>
          </div>
        </div>
      </div>

      {!useApi && (
        <PaymentDialog
          open={payOpen}
          onOpenChange={setPayOpen}
          kind="product"
          amount={total}
          defaultScheme="full"
          onConfirm={handleCheckout}
        />
      )}
    </div>
  )
}
