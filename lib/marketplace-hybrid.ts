import type { CategoryTree } from "@/lib/api/public"
import type {
  CatalogItemWithRelations,
  CompanyWithRelations,
  PublicSupplier,
  RfqWithRelations,
} from "@/types"
import type {
  MarketplaceCategory,
  MarketplacePerformer,
  MarketplaceRequest,
  MarketplaceService,
} from "@/types/marketplace"
import { formatCurrency, formatPrice, formatRelativeIso } from "@/lib/format"
import { resolveFileUrl } from "@/lib/file-url"

const CATEGORY_ICONS: Record<string, { icon: string; color: string; iconBg: string; iconColor: string }> = {
  it: { icon: "Monitor", color: "bg-blue-50 hover:bg-blue-100/80", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  marketing: { icon: "Megaphone", color: "bg-primary/10 hover:bg-secondary", iconBg: "bg-secondary", iconColor: "text-secondary-foreground" },
  legal: { icon: "Scale", color: "bg-violet-50 hover:bg-violet-100/80", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  design: { icon: "Palette", color: "bg-pink-50 hover:bg-pink-100/80", iconBg: "bg-pink-100", iconColor: "text-pink-600" },
  logistics: { icon: "Truck", color: "bg-warning/10 hover:bg-warning/10/80", iconBg: "bg-warning/10", iconColor: "text-warning" },
  finance: { icon: "CircleDollarSign", color: "bg-primary/10 hover:bg-primary/10/80", iconBg: "bg-primary/10", iconColor: "text-primary" },
}

const defaultCategoryStyle = {
  icon: "Briefcase",
  color: "bg-secondary hover:bg-secondary/80",
  iconBg: "bg-secondary",
  iconColor: "text-primary",
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
    category: company.description?.slice(0, 40) ?? "Исполнитель",
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

export const mapPublicSupplierToPerformer = (
  supplier: import("@/types").PublicSupplier,
): MarketplacePerformer => {
  const initials = supplier.display_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")

  return {
    id: supplier.actor_id,
    name: supplier.display_name,
    category: supplier.description?.slice(0, 40)
      ?? (supplier.kind === "individual" ? "Физлицо" : "Исполнитель"),
    categoryId: supplier.industries[0] ?? "services",
    city: supplier.city ?? "—",
    rating: supplier.rating || 4.5,
    reviews: supplier.reviews_count,
    clients: String(supplier.active_catalog_count),
    years: "—",
    initials: initials || "BM",
    color: "bg-primary",
    specialties: supplier.industries,
    verified: supplier.verification_status === "verified",
    featured: (supplier.rating ?? 0) >= 4.5,
    worldwide: Boolean(supplier.country && supplier.country !== "Таджикистан"),
    icon: supplier.kind === "individual" ? "User" : "Building2",
    description: supplier.description ?? "",
  }
}

const formatCatalogPrice = (item: CatalogItemWithRelations): string => {
  const pricing = item.pricing
  if (!pricing) return "По запросу"
  const currency = pricing.currency || "TJS"
  if (pricing.pricing_type === "tiered" && pricing.tiers.length > 0) {
    const min = pricing.tiers.reduce(
      (lowest, tier) => (tier.price < lowest ? tier.price : lowest),
      pricing.tiers[0]!.price,
    )
    return `от ${formatCurrency(min, currency)}`
  }
  if (pricing.fixed_price != null) return `от ${formatCurrency(pricing.fixed_price, currency)}`
  if (pricing.hourly_rate != null) return `от ${formatCurrency(pricing.hourly_rate, currency)}/ч`
  if (pricing.monthly_rate != null) {
    return `от ${formatCurrency(pricing.monthly_rate, currency)}/мес`
  }
  return "По запросу"
}

const catalogItemImageUrl = (item: CatalogItemWithRelations): string | null => {
  const image = item.media.find((entry) => entry.media_type === "image" && entry.file_url)
  if (!image?.file_url || image.file_url === "#") return null
  return resolveFileUrl(image.file_url) || null
}

const catalogMoqLabel = (item: CatalogItemWithRelations): string | null => {
  const pricing = item.pricing
  if (!pricing) return "MOQ: 1"
  if (pricing.pricing_type === "tiered" && pricing.tiers.length > 0) {
    const minQty = pricing.tiers.reduce(
      (lowest, tier) => (tier.min_qty < lowest ? tier.min_qty : lowest),
      pricing.tiers[0]!.min_qty,
    )
    return `MOQ: ${minQty}`
  }
  return "MOQ: 1"
}

const catalogActivityLabel = (item: CatalogItemWithRelations): string | null => {
  const leads = item.stats?.leads ?? 0
  const views = item.stats?.views ?? 0
  if (leads > 0) return `${leads} ${leads === 1 ? "отклик" : "откликов"}`
  if (views > 0) return `${views} ${views === 1 ? "просмотр" : "просмотров"}`
  return null
}

export const mapCatalogItemToService = (
  item: CatalogItemWithRelations,
  company?: CompanyWithRelations | null,
  supplier?: PublicSupplier | null,
): MarketplaceService => ({
  id: item.id,
  title: item.title,
  description: item.description ?? "",
  provider: supplier?.display_name ?? company?.title ?? "Исполнитель",
  providerId: item.actor_id,
  city: supplier?.city ?? company?.city ?? "—",
  rating:
    supplier?.rating
    ?? company?.rating
    ?? company?.stats?.average_rating
    ?? 4.5,
  reviews: supplier?.reviews_count ?? company?.reviews?.length ?? 0,
  price: formatCatalogPrice(item),
  tags: item.attributes.slice(0, 3).map((a) => a.value),
  verified:
    (supplier?.verification_status ?? company?.verification_status) === "verified",
  badge: null,
  icon: item.type === "product" ? "Package" : "Briefcase",
  iconBg: "bg-secondary",
  iconColor: "text-primary",
  imageUrl: catalogItemImageUrl(item),
  moqLabel: catalogMoqLabel(item),
  activityLabel: catalogActivityLabel(item),
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
