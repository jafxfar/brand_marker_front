"use client"

import { useState } from "react"
import Link from "next/link"
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
import { getSupplier as getMockSupplier } from "@/lib/mock/suppliers"
import PaymentDialog from "@/components/cabinet/payment-dialog"
import { TermHint } from "@/components/ui/term-hint"
import { Button } from "@/components/ui/button"
import { PageEmptyState, PageFrame, PageHeader, PageSurface } from "@/components/layout"
import type { PaymentScheme } from "@/types"

export default function CartPage() {
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const items = useCartStore((s) => s.items)
  const setQty = useCartStore((s) => s.setQty)
  const remove = useCartStore((s) => s.remove)
  const clear = useCartStore((s) => s.clear)
  const notify = useNotificationsStore((s) => s.add)

  const [payOpen, setPayOpen] = useState(false)

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  const handleCheckout = (scheme: PaymentScheme) => {
    const upfront =
      scheme === "prepay" ? total : scheme === "half" ? Math.round(total / 2) : 0
    notify({
      type: "payment",
      title: "Корзина оплачена безопасно",
      body: `${count} позиц. на сумму ${formatPrice(total)}. Заморожено до приёмки: ${formatPrice(upfront)}.`,
      href: "/customer/payments",
    })
    clear()
  }

  if (hydrated && items.length === 0) {
    return (
      <PageFrame>
        <PageHeader title="Корзина" description="Товары и услуги к оформлению" />
        <PageSurface>
          <PageEmptyState
            icon={<ShoppingCart size={26} />}
            title="Корзина пуста"
            description="Добавьте товары или услуги из каталога поставщиков"
          />
          <div className="flex justify-center pb-10">
            <Button asChild size="lg">
              <Link href="/customer/suppliers">Перейти в каталог</Link>
            </Button>
          </div>
        </PageSurface>
      </PageFrame>
    )
  }

  return (
    <PageFrame>
      <PageHeader title="Корзина" description="Товары и услуги к оформлению" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {!hydrated
            ? null
            : items.map((item) => {
                const supplier = useApi ? null : getMockSupplier(String(item.supplierId))
                return (
                  <div
                    key={item.listingId}
                    className="bg-card border border-border rounded-xl p-4 flex items-start gap-4"
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

                        <div className="text-sm font-bold text-primary">
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

        <div>
          <div className="bg-card border border-border rounded-xl p-5 lg:sticky lg:top-[84px]">
            <h2 className="text-sm font-bold text-foreground mb-4">Итого</h2>

            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Товаров и услуг</span>
              <span className="font-semibold text-foreground">{hydrated ? count : 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Сумма</span>
              <span className="font-semibold text-foreground">{formatPrice(hydrated ? total : 0)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary mb-4">
              <Truck size={13} /> Доставка по договорённости с поставщиком
            </div>

            <div className="border-t border-border pt-4 mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">К оплате</span>
              <span className="text-lg font-bold text-primary">{formatPrice(hydrated ? total : 0)}</span>
            </div>

            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() => setPayOpen(true)}
            >
              <ShieldCheck size={16} /> Оформить безопасно
            </Button>

            <p className="text-[11px] text-muted-foreground mt-3 text-center inline-flex items-center justify-center gap-1 w-full flex-wrap">
              Оплата защищена <TermHint term="escrow">безопасной сделкой</TermHint>. Постоплата для товаров недоступна.
            </p>
          </div>
        </div>
      </div>

      <PaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        kind="product"
        amount={total}
        defaultScheme="prepay"
        onConfirm={handleCheckout}
      />
    </PageFrame>
  )
}
