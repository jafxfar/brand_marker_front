import type { Offer } from "@/types"
import { getSuppliersByCategory, suppliers } from "@/lib/mock/suppliers"

const messages = [
  "Готовы взяться за ваш заказ, есть опыт в похожих проектах.",
  "Можем приступить сразу после согласования. Гарантия на работы.",
  "Предлагаем оптимальные сроки и прозрачную смету.",
  "Большой портфель похожих кейсов, рады сотрудничеству.",
  "Сделаем качественно и в срок, есть свободные ресурсы.",
]

const uid = () => Math.random().toString(36).slice(2, 10)

/**
 * Simulates suppliers from the order's category responding with offers.
 * Falls back to a few random suppliers if the category has too few.
 */
export const generateOffers = (
  orderId: string,
  categoryId: string,
  budget: number,
): Offer[] => {
  let pool = getSuppliersByCategory(categoryId)
  if (pool.length < 2) {
    pool = [...pool, ...suppliers.filter((s) => s.categoryId !== categoryId)].slice(0, 3)
  }

  return pool.slice(0, 3).map((s, i) => {
    const variance = 0.85 + Math.random() * 0.4 // 0.85x–1.25x of budget
    const price = Math.max(1000, Math.round((budget * variance) / 100) * 100)
    return {
      id: uid(),
      orderId,
      supplierId: s.id,
      supplierName: s.name,
      supplierInitials: s.initials,
      supplierColor: s.color,
      rating: s.rating,
      reviews: s.reviews,
      price,
      message: messages[(i + Math.floor(Math.random() * messages.length)) % messages.length],
      daysToComplete: 3 + Math.floor(Math.random() * 21),
      verified: s.verified,
      createdAt: Date.now() + i * 1000,
    }
  })
}
