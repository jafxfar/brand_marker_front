import Link from "next/link"
import { Package, Briefcase } from "lucide-react"
import type { CatalogItemWithRelations } from "@/types"
import { catalogItemTypeLabel, formatItemPricing } from "@/lib/item-display"

type CustomerCatalogGridProps = {
  items: CatalogItemWithRelations[]
  getSupplierName: (actorId: number) => string
}

export const CustomerCatalogGrid = ({
  items,
  getSupplierName,
}: CustomerCatalogGridProps) => {
  if (items.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
        Позиции не найдены
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="bg-card border border-border rounded-xl p-5 flex flex-col"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              {item.type === "product" ? (
                <Package size={19} className="text-primary" aria-hidden="true" />
              ) : (
                <Briefcase size={19} className="text-primary" aria-hidden="true" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {catalogItemTypeLabel[item.type]}
              </span>
              <p className="text-sm font-bold text-foreground leading-snug mt-0.5">
                {item.title}
              </p>
              {item.category && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {item.category.name}
                </p>
              )}
            </div>
          </div>

          {item.description && (
            <p className="text-xs text-muted-foreground mt-2.5 line-clamp-3 leading-relaxed">
              {item.description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-border">
            <div className="text-sm font-semibold text-primary">
              {formatItemPricing(item.pricing)}
            </div>
            <Link
              href={`/customer/suppliers/${item.actor_id}`}
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors truncate max-w-[50%] text-right"
              aria-label={`Открыть профиль исполнителя ${getSupplierName(item.actor_id)}`}
            >
              {getSupplierName(item.actor_id)}
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
}
