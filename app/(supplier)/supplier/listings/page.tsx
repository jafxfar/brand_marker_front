"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus, Boxes, Package, Briefcase, Pencil, Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuthStore } from "@/lib/store/auth-store"
import { useListingsStore } from "@/lib/store/listings-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { formatPrice } from "@/lib/format"
import { getCategory } from "@/lib/mock/categories"

type Filter = "all" | "product" | "service"

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "service", label: "Услуги" },
  { value: "product", label: "Товары" },
]

export default function ListingsPage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const items = useListingsStore((s) => s.items)
  const remove = useListingsStore((s) => s.remove)
  const [filter, setFilter] = useState<Filter>("all")
  const [toDelete, setToDelete] = useState<string | null>(null)

  const myItems = items.filter((l) => l.supplierId === user?.id)
  const filtered = filter === "all" ? myItems : myItems.filter((l) => l.kind === filter)
  const deleting = items.find((l) => l.id === toDelete)

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Товары и услуги</h1>
          <p className="text-sm text-muted-foreground mt-1">Ваш каталог предложений</p>
        </div>
        <Link
          href="/supplier/listings/new"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-[oklch(0.58_0.22_38)] text-white text-sm font-bold transition-colors"
        >
          <Plus size={17} /> Добавить позицию
        </Link>
      </div>

      <div className="flex items-center gap-1 mb-5 bg-white border border-border rounded-xl p-1 w-fit">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
              filter === f.value ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!hydrated ? null : filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Boxes size={26} className="text-primary" />
          </div>
          <p className="text-base font-bold text-foreground">Пока нет позиций</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            Добавьте товары или услуги, чтобы откликаться на заказы
          </p>
          <Link
            href="/supplier/listings/new"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-[oklch(0.58_0.22_38)] transition-colors"
          >
            <Plus size={16} /> Добавить позицию
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((l) => {
            const cat = getCategory(l.categoryId)
            return (
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
                      {l.kind === "product" ? "Товар" : "Услуга"} · {cat?.label ?? "—"}
                    </span>
                    <p className="text-sm font-bold text-foreground leading-snug">{l.title}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed line-clamp-2">{l.description}</p>

                {l.kind === "product" && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {typeof l.inStock === "number" && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-lg">В наличии: {l.inStock}</span>
                    )}
                    {l.color && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-lg">Цвет: {l.color}</span>
                    )}
                    {l.sku && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-lg">Арт.: {l.sku}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <div className="text-base font-black text-primary">{formatPrice(l.price)}</div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/supplier/listings/${l.id}`}
                      className="h-9 px-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5"
                    >
                      <Pencil size={14} /> Изменить
                    </Link>
                    <button
                      onClick={() => setToDelete(l.id)}
                      className="h-9 w-9 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors flex items-center justify-center"
                      aria-label="Удалить"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить позицию?</AlertDialogTitle>
            <AlertDialogDescription>
              «{deleting?.title}» будет удалена из вашего каталога. Действие необратимо.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:opacity-90"
              onClick={() => {
                if (toDelete) remove(toDelete)
                setToDelete(null)
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
