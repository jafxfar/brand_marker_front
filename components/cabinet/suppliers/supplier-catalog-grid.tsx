import { Package, Briefcase } from "lucide-react"
import type { CatalogItemWithRelations } from "@/types"
import { catalogItemTypeLabel, formatItemPricing } from "@/lib/item-display"

type SupplierCatalogGridProps = {
  items: CatalogItemWithRelations[]
}

export const SupplierCatalogGrid = ({ items }: SupplierCatalogGridProps) => {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
        У поставщика пока нет опубликованных позиций в каталоге
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item) => (
        <div key={item.id} className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              {item.type === "product" ? (
                <Package size={19} className="text-primary" />
              ) : (
                <Briefcase size={19} className="text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {catalogItemTypeLabel[item.type]}
              </span>
              <p className="text-sm font-bold text-foreground leading-snug mt-0.5">{item.title}</p>
              {item.category && (
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.category.name}</p>
              )}
            </div>
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-2.5 line-clamp-3 leading-relaxed">
              {item.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <div className="text-base font-black text-primary">
              {formatItemPricing(item.pricing)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
