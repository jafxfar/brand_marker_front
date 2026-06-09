"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ShoppingCart, Briefcase, ArrowLeft, Truck, Check, Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { categories } from "@/lib/mock/categories"
import { suppliers } from "@/lib/mock/suppliers"
import { useOrdersStore } from "@/lib/store/orders-store"
import { useNotificationsStore } from "@/lib/store/notifications-store"
import { availableSchemes, paymentSchemeMeta } from "@/lib/order-display"
import type { OrderKind, PaymentScheme } from "@/types"

export default function NewOrderPage() {
  const router = useRouter()
  const createOrder = useOrdersStore((s) => s.createOrder)
  const notify = useNotificationsStore((s) => s.add)

  const [kind, setKind] = useState<OrderKind>("service")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [budget, setBudget] = useState("")
  const [qty, setQty] = useState("1")
  const [color, setColor] = useState("")
  const [sku, setSku] = useState("")
  const [needsDelivery, setNeedsDelivery] = useState(false)
  const [scheme, setScheme] = useState<PaymentScheme>("prepay")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const schemes = availableSchemes(kind)

  const handleKindChange = (next: OrderKind) => {
    setKind(next)
    // postpay is invalid for products — reset if needed.
    if (next === "product" && scheme === "postpay") setScheme("prepay")
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (title.trim().length < 5) e.title = "Заголовок не короче 5 символов"
    if (!categoryId) e.categoryId = "Выберите категорию"
    if (description.trim().length < 10) e.description = "Опишите задачу подробнее (от 10 символов)"
    const budgetNum = Number(budget)
    if (!budget || Number.isNaN(budgetNum) || budgetNum <= 0) e.budget = "Укажите бюджет"
    const qtyNum = Number(qty)
    if (!qty || Number.isNaN(qtyNum) || qtyNum < 1) e.qty = "Количество от 1"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    const order = createOrder({
      kind,
      title: title.trim(),
      description: description.trim(),
      categoryId,
      category: category.label,
      budget: Number(budget),
      qty: Number(qty),
      needsDelivery,
      color: kind === "product" ? color.trim() || undefined : undefined,
      sku: kind === "product" ? sku.trim() || undefined : undefined,
      preferredScheme: scheme,
    })

    const matched = suppliers.filter((s) => s.categoryId === categoryId).length || 3
    notify({
      type: "order",
      title: "Заказ опубликован",
      body: `Уведомлено ${matched} поставщиков категории «${category.label}». Ожидайте отклики.`,
      href: `/customer/orders/${order.id}`,
    })

    router.push(`/customer/orders/${order.id}`)
  }

  const inputClass = (field: string) =>
    cn(
      "w-full h-11 px-4 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20",
      errors[field] ? "border-destructive" : "border-input focus:border-primary",
    )

  return (
    <div className="max-w-[820px] mx-auto">
      <Link
        href="/customer/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft size={16} /> К списку заказов
      </Link>

      <h1 className="text-2xl font-black text-foreground mb-1">Создание заказа</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Выберите тип заказа и заполните детали — поставщики категории получат уведомление
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kind selector */}
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: "service", title: "Услуга", desc: "Работа или сервис на заказ", Icon: Briefcase },
            { value: "product", title: "Товар", desc: "Закупка товара или партии", Icon: ShoppingCart },
          ] as const).map(({ value, title: t, desc, Icon }) => {
            const active = kind === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleKindChange(value)}
                className={cn(
                  "text-left rounded-2xl border-2 p-4 transition-all",
                  active ? "border-primary bg-secondary shadow-sm" : "border-border bg-white hover:border-primary/40",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-2.5",
                    active ? "bg-primary text-white" : "bg-secondary text-primary",
                  )}
                >
                  <Icon size={18} />
                </div>
                <div className="text-sm font-bold text-foreground">{t}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>
              </button>
            )
          })}
        </div>

        {/* Main details */}
        <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
              Название заказа
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={kind === "product" ? "Напр. Поставка офисных кресел, 50 шт" : "Напр. Разработка корпоративного сайта"}
              className={inputClass("title")}
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1.5">
              Категория
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={cn(inputClass("categoryId"), "appearance-none")}
            >
              <option value="">Выберите категорию</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-destructive mt-1">{errors.categoryId}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
              Описание
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Опишите требования, сроки и пожелания"
              className={cn(
                "w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 resize-none",
                errors.description ? "border-destructive" : "border-input focus:border-primary",
              )}
            />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-foreground mb-1.5">
                Бюджет,  TJS
              </label>
              <input
                id="budget"
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="50000"
                className={inputClass("budget")}
              />
              {errors.budget && <p className="text-xs text-destructive mt-1">{errors.budget}</p>}
            </div>
            <div>
              <label htmlFor="qty" className="block text-sm font-medium text-foreground mb-1.5">
                Количество
              </label>
              <input
                id="qty"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className={inputClass("qty")}
              />
              {errors.qty && <p className="text-xs text-destructive mt-1">{errors.qty}</p>}
            </div>
          </div>

          {/* Product-only attributes */}
          {kind === "product" && (
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-foreground mb-1.5">
                  Цвет <span className="text-muted-foreground font-normal">(необязательно)</span>
                </label>
                <input
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Чёрный"
                  className={inputClass("color")}
                />
              </div>
              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-foreground mb-1.5">
                  Артикул / ИД <span className="text-muted-foreground font-normal">(необязательно)</span>
                </label>
                <input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU-12345"
                  className={inputClass("sku")}
                />
              </div>
            </div>
          )}

          {/* Delivery */}
          <label className="flex items-center gap-3 p-3.5 rounded-xl border border-border cursor-pointer hover:border-primary/40 transition-colors">
            <input
              type="checkbox"
              checked={needsDelivery}
              onChange={(e) => setNeedsDelivery(e.target.checked)}
              className="w-4 h-4 accent-[oklch(0.66_0.22_43)]"
            />
            <Truck size={18} className="text-primary" />
            <div>
              <div className="text-sm font-medium text-foreground">Требуется доставка</div>
              <div className="text-[11px] text-muted-foreground">Поставщик должен организовать доставку</div>
            </div>
          </label>
        </div>

        {/* Payment scheme */}
        <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-bold text-foreground mb-1">Предпочтительная схема оплаты</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Оплата защищена эскроу — средства переводятся поставщику только после приёмки
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {schemes.map((s) => {
              const meta = paymentSchemeMeta[s]
              const active = scheme === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScheme(s)}
                  className={cn(
                    "text-left rounded-xl border-2 p-3.5 transition-all relative",
                    active ? "border-primary bg-secondary" : "border-border hover:border-primary/40",
                  )}
                >
                  {active && (
                    <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </span>
                  )}
                  <div className="text-sm font-bold text-foreground pr-6">{meta.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{meta.desc}</div>
                </button>
              )
            })}
          </div>
          {kind === "product" && (
            <div className="flex items-start gap-2 mt-3 text-[11px] text-muted-foreground">
              <Info size={13} className="text-primary flex-shrink-0 mt-0.5" />
              Постоплата недоступна для товаров — только предоплата или 50/50.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/customer/orders"
            className="h-11 px-5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors flex items-center"
          >
            Отмена
          </Link>
          <button
            type="submit"
            className="h-11 px-6 rounded-xl bg-primary hover:bg-[oklch(0.58_0.22_38)] text-white text-sm font-bold transition-colors"
          >
            Опубликовать заказ
          </button>
        </div>
      </form>
    </div>
  )
}
