import type { Supplier, User } from "@/types"

const palette = [
  "bg-blue-600", "bg-primary", "bg-violet-600", "bg-emerald-600",
  "bg-amber-600", "bg-teal-600", "bg-pink-500", "bg-indigo-600",
]

const initialsFrom = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "ПС"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const colorFrom = (seed: string): string => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return palette[Math.abs(hash) % palette.length]
}

/**
 * Builds a virtual Supplier identity for the logged-in supplier user.
 * Used when the supplier responds to orders (offers) so the customer sees them.
 */
export const currentSupplier = (user: User): Supplier => {
  const name = user.company?.trim() || user.name
  return {
    id: user.id,
    name,
    initials: initialsFrom(name),
    color: colorFrom(user.id),
    categoryId: "",
    category: "",
    city: user.city ?? "",
    rating: 5.0,
    reviews: 0,
    clients: "0",
    years: "новый",
    verified: false,
    hasDelivery: user.hasDelivery,
    specialties: [],
  }
}
