import Link from "next/link"
import type { MarketplaceCategory } from "@/types/marketplace"
import { getIcon } from "@/lib/icon-map"
import { categoryUrl } from "@/lib/marketplace-routes"

type CategoryCardProps = {
  category: MarketplaceCategory
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const Icon = getIcon(category.icon)

  return (
    <Link
      href={categoryUrl(category.slug)}
      className={`${category.color} rounded-2xl p-4 flex flex-col items-center gap-3 text-center transition-all hover:shadow-md border border-transparent hover:border-primary/15 group`}
      aria-label={`Категория ${category.label}`}
    >
      <div className={`${category.iconBg} rounded-xl w-12 h-12 flex items-center justify-center`}>
        <Icon size={22} className={category.iconColor} />
      </div>
      <div>
        <div className="text-xs font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
          {category.label}
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{category.count} услуг</div>
      </div>
    </Link>
  )
}
