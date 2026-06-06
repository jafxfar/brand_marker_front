"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, BadgeCheck, MapPin, Users, Clock, Truck, Store } from "lucide-react"
import { cn } from "@/lib/utils"
import { suppliers } from "@/lib/mock/suppliers"
import { categories } from "@/lib/mock/categories"

export default function SuppliersPage() {
  const [categoryId, setCategoryId] = useState<string>("")

  const filtered = categoryId
    ? suppliers.filter((s) => s.categoryId === categoryId)
    : suppliers

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Store size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Каталог поставщиков</h1>
          <p className="text-sm text-muted-foreground">Проверенные поставщики товаров и услуг</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5">
        <button
          onClick={() => setCategoryId("")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors",
            categoryId === "" ? "bg-primary text-white" : "bg-white border border-border text-muted-foreground hover:text-foreground",
          )}
        >
          Все
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(c.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors",
              categoryId === c.id ? "bg-primary text-white" : "bg-white border border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center text-sm text-muted-foreground">
          В этой категории пока нет поставщиков
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={`/customer/suppliers/${s.id}`}
              className="bg-white border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0", s.color)}>
                  {s.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {s.name}
                    </span>
                    {s.verified && <BadgeCheck size={14} className="text-primary flex-shrink-0" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.category}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center gap-0.5">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold">{s.rating}</span>
                      <span className="text-xs text-muted-foreground">({s.reviews})</span>
                    </div>
                    <span className="text-muted-foreground/40 text-xs">•</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin size={10} /> {s.city}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                <span className="flex items-center gap-1.5">
                  <Users size={12} className="text-primary" />
                  <span className="font-semibold text-foreground">{s.clients}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className="text-primary" /> {s.years}
                </span>
                {s.hasDelivery && (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-semibold ml-auto">
                    <Truck size={12} /> Доставка
                  </span>
                )}
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {s.specialties.map((spec) => (
                  <span key={spec} className="text-[10px] bg-muted text-muted-foreground px-2.5 py-1 rounded-lg font-medium">
                    {spec}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
