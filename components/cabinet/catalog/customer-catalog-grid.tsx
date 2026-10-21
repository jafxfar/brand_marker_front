import Link from "next/link"
import { Package, Briefcase } from "lucide-react"
import type { CatalogItemWithRelations } from "@/types"
import { catalogItemTypeLabel, formatItemPricing } from "@/lib/item-display"
import { createRfqHref } from "@/lib/create-rfq-href"
import { serviceUrl } from "@/lib/marketplace-routes"

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
            <Link
              href={serviceUrl(item.id)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary"
              aria-label={item.title}
            >
              {item.type === "product" ? (
                <Package size={19} className="text-primary" aria-hidden="true" />
              ) : (
                <Briefcase size={19} className="text-primary" aria-hidden="true" />
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {catalogItemTypeLabel[item.type]}
              </span>
              <Link
                href={serviceUrl(item.id)}
                className="mt-0.5 block text-sm font-bold leading-snug text-foreground hover:text-primary"
              >
                {item.title}
              </Link>
              {item.category && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {item.category.name}
                </p>
              )}
            </div>
          </div>

          {item.description && (
            <Link
              href={serviceUrl(item.id)}
              className="mt-2.5 block text-xs leading-relaxed text-muted-foreground line-clamp-3 hover:text-primary"
            >
              {item.description}
            </Link>
          )}

          <div className="mt-auto pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between gap-3">
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
            <Link
              href={createRfqHref({ service: item.id, supplierId: item.actor_id })}
              className="inline-flex w-full items-center justify-center h-10 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
              aria-label={`Откликнуться на ${item.title}`}
            >
              Откликнуться
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
}
