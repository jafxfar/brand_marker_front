"use client"

import Link from "next/link"
import { Package, Briefcase, Pencil } from "lucide-react"
import type { CatalogItemWithRelations } from "@/types"
import { itemStatusMeta, formatItemPricing, catalogItemTypeLabel } from "@/lib/item-display"
import { getCatalogCategory } from "@/lib/mock/catalog-categories"

type CatalogItemsTableProps = {
  items: CatalogItemWithRelations[]
}

export const CatalogItemsTable = ({ items }: CatalogItemsTableProps) => (
  <>
    <div className="hidden lg:block bg-white border border-border rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/40">
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Позиция</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Категория</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Статус</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Просмотры</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Лиды</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Цена</th>
            <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => {
            const meta = itemStatusMeta[item.status]
            const category = item.category ?? getCatalogCategory(item.category_id)
            return (
              <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      {item.type === "product" ? (
                        <Package size={16} className="text-primary" />
                      ) : (
                        <Briefcase size={16} className="text-primary" />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/supplier/catalog/${item.id}`}
                        className="font-semibold text-foreground hover:text-primary"
                      >
                        {item.title}
                      </Link>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {catalogItemTypeLabel[item.type]}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{category?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${meta.className}`}>
                    {meta.label}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{item.stats?.views ?? 0}</td>
                <td className="px-4 py-3 font-medium">{item.stats?.leads ?? 0}</td>
                <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">
                  {formatItemPricing(item.pricing)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/supplier/catalog/${item.id}`}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition-colors"
                  >
                    <Pencil size={13} /> Изменить
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>

    <div className="lg:hidden space-y-3">
      {items.map((item) => {
        const meta = itemStatusMeta[item.status]
        const category = item.category ?? getCatalogCategory(item.category_id)
        return (
          <Link
            key={item.id}
            href={`/supplier/catalog/${item.id}`}
            className="block bg-white border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                {item.type === "product" ? (
                  <Package size={17} className="text-primary" />
                ) : (
                  <Briefcase size={17} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {category?.name} · {catalogItemTypeLabel[item.type]}
                </p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${meta.className}`}>
                {meta.label}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              <div>
                <p className="text-muted-foreground">Просмотры</p>
                <p className="font-semibold mt-0.5">{item.stats?.views ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Лиды</p>
                <p className="font-semibold mt-0.5">{item.stats?.leads ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Цена</p>
                <p className="font-semibold text-primary mt-0.5">
                  {formatItemPricing(item.pricing)}
                </p>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  </>
)
