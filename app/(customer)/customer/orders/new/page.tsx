"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import { useOrdersStore } from "@/lib/store/orders-store"
import { useCreateBuyerOrderMutation } from "@/hooks/api/use-buyer-orders-query"
import { catalogCategories as mockCatalogCategories } from "@/lib/mock/catalog-categories"
import { usePublicCategoriesQuery } from "@/hooks/api/use-public-query"
import { mapCategoryTreeToMarketplace } from "@/lib/marketplace-hybrid"
import type { OrderKind } from "@/types"

export default function BuyerOrderNewPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const createOrderLocal = useOrdersStore((s) => s.createOrder)
  const createOrderMutation = useCreateBuyerOrderMutation()

  const { data: apiCategories } = usePublicCategoriesQuery(useApi)
  const catalogCategories = useMemo(() => {
    if (!useApi || !apiCategories?.length) return mockCatalogCategories
    return mapCategoryTreeToMarketplace(apiCategories).map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.label,
    }))
  }, [useApi, apiCategories])

  const [kind, setKind] = useState<OrderKind>("service")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState(catalogCategories[0]?.slug ?? "")
  const [budget, setBudget] = useState("")
  const [qty, setQty] = useState("1")
  const [needsDelivery, setNeedsDelivery] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!hydrated) return null

  const category = catalogCategories.find((c) => c.slug === categoryId)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const budgetNum = Number(budget)
    const qtyNum = Math.max(1, Number(qty) || 1)
    if (!title.trim() || !budgetNum) return

    setSubmitting(true)
    try {
      if (useApi) {
        const order = await createOrderMutation.mutateAsync({
          kind,
          title: title.trim(),
          description: description.trim(),
          category_label: category?.name ?? categoryId,
          budget: budgetNum,
          qty: qtyNum,
          needs_delivery: needsDelivery,
        })
        router.push(`/customer/orders/${order.id}`)
        return
      }
      const order = createOrderLocal({
        kind,
        title: title.trim(),
        description: description.trim(),
        categoryId,
        category: category?.name ?? categoryId,
        budget: budgetNum,
        qty: qtyNum,
        needsDelivery,
      })
      router.push(`/customer/orders/${order.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    "w-full h-11 px-4 rounded-xl border border-input bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"

  return (
    <div className="max-w-[720px] mx-auto space-y-6">
      <Link
        href="/customer/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} /> К заказам
      </Link>

      <div>
        <h1 className="text-2xl font-black text-foreground">Новый заказ</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Опубликуйте заказ — поставщики смогут откликнуться
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-6 space-y-5">
        <div className="flex gap-2">
          {(["service", "product"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setKind(value)}
              className={cn(
                "flex-1 h-10 rounded-xl text-sm font-semibold border transition-colors",
                kind === value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-muted-foreground border-border",
              )}
            >
              {value === "service" ? "Услуга" : "Товар"}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1.5">Название</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1.5">Описание</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={cn(inputClass, "h-auto py-3")}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1.5">Категория</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
          >
            {catalogCategories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="budget" className="block text-sm font-medium mb-1.5">Бюджет, ₽</label>
            <input
              id="budget"
              type="number"
              min={0}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="qty" className="block text-sm font-medium mb-1.5">Количество</label>
            <input
              id="qty"
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={needsDelivery}
            onChange={(e) => setNeedsDelivery(e.target.checked)}
            className="rounded border-border"
          />
          Требуется доставка
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          {submitting ? "Публикация…" : "Опубликовать заказ"}
        </button>
      </form>
    </div>
  )
}
