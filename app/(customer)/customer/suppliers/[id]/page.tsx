"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft, Star, BadgeCheck, MapPin, Users, Clock, Truck,
  Package, Briefcase, ShoppingCart, Check, Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getSupplier } from "@/lib/mock/suppliers"
import { getListingsBySupplier } from "@/lib/mock/listings"
import { useCartStore } from "@/lib/store/cart-store"
import { formatPrice } from "@/lib/format"
import type { Listing } from "@/types"

export default function SupplierProfilePage() {
  const params = useParams<{ id: string }>()
  const supplier = getSupplier(params.id)
  const listings = getListingsBySupplier(params.id)
  const add = useCartStore((s) => s.add)
  const [added, setAdded] = useState<Record<string, boolean>>({})

  if (!supplier) {
    return (
      <div className="max-w-[900px] mx-auto text-center py-16">
        <p className="text-lg font-bold text-foreground">Поставщик не найден</p>
        <Link href="/customer/suppliers" className="text-primary font-semibold hover:underline mt-2 inline-block">
          ← К каталогу
        </Link>
      </div>
    )
  }

  const handleAdd = (listing: Listing) => {
    add({
      listingId: listing.id,
      supplierId: listing.supplierId,
      title: listing.title,
      kind: listing.kind,
      price: listing.price,
      color: listing.color,
      sku: listing.sku,
    })
    setAdded((prev) => ({ ...prev, [listing.id]: true }))
    setTimeout(() => setAdded((prev) => ({ ...prev, [listing.id]: false })), 1500)
  }

  return (
    <div className="max-w-[1000px] mx-auto">
      <Link
        href="/customer/suppliers"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft size={16} /> К каталогу
      </Link>

      {/* Profile header */}
      <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0", supplier.color)}>
            {supplier.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-foreground">{supplier.name}</h1>
              {supplier.verified && <BadgeCheck size={18} className="text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{supplier.category}</p>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
              <div className="flex items-center gap-0.5">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold">{supplier.rating}</span>
                <span className="text-xs text-muted-foreground">({supplier.reviews} отзывов)</span>
              </div>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={11} /> {supplier.city}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users size={11} /> {supplier.clients} клиентов
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={11} /> на рынке {supplier.years}
              </span>
              {supplier.hasDelivery && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <Truck size={11} /> Есть доставка
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-4">
          {supplier.specialties.map((spec) => (
            <span key={spec} className="text-[11px] bg-secondary text-secondary-foreground px-2.5 py-1 rounded-lg font-medium">
              {spec}
            </span>
          ))}
        </div>

        <Link
          href="/customer/orders/new"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-primary text-primary text-sm font-bold hover:bg-secondary transition-colors mt-5"
        >
          <Plus size={16} /> Создать заказ в категории
        </Link>
      </div>

      {/* Listings */}
      <h2 className="text-base font-bold text-foreground mb-3">
        Товары и услуги ({listings.length})
      </h2>
      {listings.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
          У поставщика пока нет опубликованных позиций
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {listings.map((l) => (
            <div key={l.id} className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  {l.kind === "product" ? (
                    <Package size={19} className="text-primary" />
                  ) : (
                    <Briefcase size={19} className="text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {l.kind === "product" ? "Товар" : "Услуга"}
                  </span>
                  <p className="text-sm font-bold text-foreground leading-snug">{l.title}</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">{l.description}</p>

              {l.kind === "product" && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {l.color && l.color !== "—" && (
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-lg">Цвет: {l.color}</span>
                  )}
                  {l.sku && (
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-lg">Арт.: {l.sku}</span>
                  )}
                  {typeof l.inStock === "number" && (
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-lg">В наличии: {l.inStock}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <div className="text-base font-black text-primary">{formatPrice(l.price)}</div>
                <button
                  onClick={() => handleAdd(l)}
                  className={cn(
                    "h-9 px-4 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5",
                    added[l.id]
                      ? "bg-emerald-600 text-white"
                      : "bg-primary hover:bg-[oklch(0.58_0.22_38)] text-white",
                  )}
                >
                  {added[l.id] ? (
                    <>
                      <Check size={15} /> Добавлено
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={15} /> В корзину
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
