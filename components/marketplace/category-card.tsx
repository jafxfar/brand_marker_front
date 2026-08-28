import Link from "next/link"
import type { MarketplaceCategory } from "@/types/marketplace"
import { getIcon } from "@/lib/icon-map"
import { categoryUrl } from "@/lib/marketplace-routes"

type CategoryCardProps = {
  category: MarketplaceCategory
  variant?: "grid" | "scroll"
}

export const CategoryCard = ({ category, variant = "grid" }: CategoryCardProps) => {
  const Icon = getIcon(category.icon)
  const subcategories = category.subcategories.slice(0, 3)

  const cardClass =
    variant === "scroll"
      ? `${category.color} rounded-2xl p-4 flex flex-col gap-3 border border-transparent hover:border-primary/15 transition-all hover:shadow-md group min-w-[140px] snap-start`
      : `${category.color} rounded-2xl p-4 flex flex-col items-center gap-3 text-center transition-all hover:shadow-md border border-transparent hover:border-primary/15 group`

  return (
    <article className={cardClass}>
      <Link
        href={categoryUrl(category.slug)}
        className={variant === "scroll" ? "flex flex-col gap-3" : "flex flex-col items-center gap-3 w-full"}
        aria-label={`Категория ${category.label}`}
      >
        <div className={`${category.iconBg} rounded-xl w-12 h-12 flex items-center justify-center`}>
          <Icon size={22} className={category.iconColor} />
        </div>
        <div className={variant === "scroll" ? "" : "w-full"}>
          <div className="text-xs font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
            {category.label}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{category.count} услуг</div>
        </div>
      </Link>

      {subcategories.length > 0 && (
        <ul className={`space-y-0.5 ${variant === "grid" ? "w-full text-center" : ""}`}>
          {subcategories.map((sub) => (
            <li key={sub.id}>
              <Link
                href={categoryUrl(category.slug, sub.slug)}
                className="text-[10px] text-muted-foreground hover:text-primary transition-colors line-clamp-1 block"
              >
                {sub.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
