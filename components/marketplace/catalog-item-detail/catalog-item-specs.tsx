import type { ItemAttribute } from "@/types"

type CatalogItemSpecsProps = {
  attributes: ItemAttribute[]
}

export const CatalogItemSpecs = ({ attributes }: CatalogItemSpecsProps) => {
  const sorted = [...attributes].sort((a, b) => a.sort_order - b.sort_order)

  if (sorted.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-2 text-base font-bold text-foreground">
          Основные характеристики
        </h2>
        <p className="text-sm text-muted-foreground">Характеристики не указаны</p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-4 text-base font-bold text-foreground">
        Основные характеристики
      </h2>
      <dl className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
        {sorted.map((attr) => (
          <div
            key={attr.id}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-3 border-b border-border py-2.5 last:border-0"
          >
            <dt className="text-sm text-muted-foreground">{attr.name}</dt>
            <dd className="text-sm font-medium text-foreground">{attr.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
