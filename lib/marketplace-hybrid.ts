import type { CategoryTree } from "@/lib/api/public"
import type { CatalogItemWithRelations, CompanyWithRelations, RfqWithRelations } from "@/types"
import type {
  MarketplaceCategory,
  MarketplacePerformer,
  MarketplaceRequest,
  MarketplaceService,
} from "@/types/marketplace"
import { formatPrice, formatRelativeIso } from "@/lib/format"

const CATEGORY_ICONS: Record<string, { icon: string; color: string; iconBg: string; iconColor: string }> = {
  it: { icon: "Monitor", color: "bg-blue-50 hover:bg-blue-100/80", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  marketing: { icon: "Megaphone", color: "bg-primary-light hover:bg-secondary", iconBg: "bg-secondary", iconColor: "text-secondary-foreground" },
  legal: { icon: "Scale", color: "bg-violet-50 hover:bg-violet-100/80", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  design: { icon: "Palette", color: "bg-pink-50 hover:bg-pink-100/80", iconBg: "bg-pink-100", iconColor: "text-pink-600" },
  logistics: { icon: "Truck", color: "bg-amber-50 hover:bg-amber-100/80", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  finance: { icon: "CircleDollarSign", color: "bg-emerald-50 hover:bg-emerald-100/80", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
}

const defaultCategoryStyle = {
  icon: "Briefcase",
  color: "bg-secondary hover:bg-secondary/80",
  iconBg: "bg-secondary",
  iconColor: "text-primary",
}

export const mergeByKey = <T extends Record<string, unknown>>(
  mockItems: T[],
  apiItems: T[],
  key: keyof T,
): T[] => {
  const map = new Map<string, T>()
  for (const item of mockItems) {
    map.set(String(item[key]), item)
  }
  for (const item of apiItems) {
    map.set(String(item[key]), item)
  }
  return [...map.values()]
}

export const mapCategoryTreeToMarketplace = (
  tree: CategoryTree[],
): MarketplaceCategory[] =>
  tree.map((cat) => {
    const style = CATEGORY_ICONS[cat.slug] ?? defaultCategoryStyle
    return {
      id: cat.slug,
      label: cat.name,
      slug: cat.slug,
      icon: style.icon,
      count: String((cat.children?.length ?? 0) * 100 + 120),
      subcategories: (cat.children ?? []).map((child) => ({
        id: child.slug,
        label: child.name,
        slug: child.slug,
      })),
      color: style.color,
      iconBg: style.iconBg,
      iconColor: style.iconColor,
    }
  })

export const mapCompanyToPerformer = (
  company: CompanyWithRelations,
): MarketplacePerformer => {
  const initials = company.title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
  const categorySlug = company.categories[0]
    ? String(company.categories[0].category_id)
    : "services"

  return {
    id: company.id,
    name: company.title,
    category: company.description?.slice(0, 40) ?? "Поставщик",
    categoryId: categorySlug,
    city: company.city ?? "—",
    rating: company.rating ?? company.stats?.average_rating ?? 4.5,
    reviews: company.reviews?.length ?? company.stats?.completed_contracts ?? 0,
    clients: String(company.stats?.completed_contracts ?? 0),
    years: company.profile?.founded_year
      ? `${new Date().getFullYear() - company.profile.founded_year}+`
      : "3+",
    initials: initials || "BM",
    color: "bg-primary",
    specialties: company.profile?.industries ?? [],
    verified: company.verification_status === "verified",
    featured: (company.rating ?? 0) >= 4.5,
    worldwide: Boolean(company.country && company.country !== "Таджикистан"),
    icon: "Building2",
    description: company.description ?? "",
  }
}

const formatCatalogPrice = (item: CatalogItemWithRelations): string => {
  const pricing = item.pricing
  if (!pricing) return "По запросу"
  if (pricing.fixed_price) return `от ${formatPrice(pricing.fixed_price)}`
  if (pricing.hourly_rate) return `от ${formatPrice(pricing.hourly_rate)}/ч`
  if (pricing.monthly_rate) return `от ${formatPrice(pricing.monthly_rate)}/мес`
  return "По запросу"
}

export const mapCatalogItemToService = (
  item: CatalogItemWithRelations,
  company?: CompanyWithRelations | null,
): MarketplaceService => ({
  id: item.id,
  title: item.title,
  description: item.description ?? "",
  provider: company?.title ?? "Поставщик",
  providerId: company?.id ?? item.actor_id,
  city: company?.city ?? "—",
  rating: company?.rating ?? company?.stats?.average_rating ?? 4.5,
  reviews: company?.reviews?.length ?? 0,
  price: formatCatalogPrice(item),
  tags: item.attributes.slice(0, 3).map((a) => a.value),
  verified: company?.verification_status === "verified",
  badge: null,
  icon: item.type === "product" ? "Package" : "Briefcase",
  iconBg: "bg-secondary",
  iconColor: "text-primary",
  saves: item.stats?.leads ?? 0,
  views: String(item.stats?.views ?? 0),
  categoryId: item.category?.slug ?? "services",
})

export const mapRfqToRequest = (rfq: RfqWithRelations): MarketplaceRequest => {
  const numericId = rfq.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const city =
    rfq.type === "product"
      ? rfq.delivery_city
      : (rfq.buyer?.city ?? "—")

  return {
    id: numericId,
    title: rfq.title,
    budget:
      rfq.budget_type === "fixed" && rfq.budget_from != null
        ? formatPrice(rfq.budget_from)
        : rfq.budget_to != null
          ? `до ${formatPrice(rfq.budget_to)}`
          : "По договорённости",
    city,
    time: formatRelativeIso(rfq.created_at),
    offers: 0,
    icon: rfq.type === "product" ? "Package" : "FileText",
    categoryId: rfq.category_id,
  }
}
