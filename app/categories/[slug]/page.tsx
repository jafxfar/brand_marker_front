import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, BadgeCheck, MapPin, Star } from "lucide-react"
import { PageShell } from "@/components/marketplace/page-shell"
import { getCategoryBySlug } from "@/lib/mock/categories"
import { getServicesByCategory } from "@/lib/mock/marketplace-services"
import { getIcon } from "@/lib/icon-map"
import {
  categoriesUrl,
  categoryUrl,
  serviceUrl,
  servicesUrl,
} from "@/lib/marketplace-routes"

type CategoryPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sub?: string }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { sub } = await searchParams
  const category = getCategoryBySlug(slug)

  if (!category) notFound()

  const services = getServicesByCategory(category.id)
  const Icon = getIcon(category.icon)
  const activeSub = sub
    ? category.subcategories.find((item) => item.slug === sub)
    : undefined

  return (
    <PageShell>
      <section className="bg-white border-b border-border py-9">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
            <span>/</span>
            <Link href={categoriesUrl()} className="hover:text-primary transition-colors">Категории</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{category.label}</span>
          </div>

          <div className="flex items-start gap-4 mb-8">
            <div className={`${category.iconBg} rounded-2xl w-14 h-14 flex items-center justify-center flex-shrink-0`}>
              <Icon size={26} className={category.iconColor} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">{category.label}</h1>
              <p className="text-sm text-muted-foreground mt-1">{category.count} услуг в каталоге</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href={categoryUrl(category.slug)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                !activeSub
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary/30"
              }`}
            >
              Все
            </Link>
            {category.subcategories.map((item) => (
              <Link
                key={item.id}
                href={categoryUrl(category.slug, item.slug)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  activeSub?.slug === item.slug
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white text-muted-foreground border-border hover:border-primary/30"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {activeSub && (
            <p className="text-sm text-muted-foreground mb-6">
              Подкатегория: <span className="font-semibold text-foreground">{activeSub.label}</span>
            </p>
          )}

          {services.length === 0 ? (
            <div className="rounded-2xl border border-border bg-secondary/40 p-10 text-center">
              <p className="text-sm text-muted-foreground">В этой категории пока нет услуг</p>
              <Link
                href={servicesUrl()}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mt-3 hover:underline"
              >
                Смотреть все услуги <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => {
                const ServiceIcon = getIcon(service.icon)
                return (
                  <Link
                    key={service.id}
                    href={serviceUrl(service.id)}
                    className="border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg transition-all bg-white group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`${service.iconBg} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <ServiceIcon size={18} className={service.iconColor} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {service.title}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-xs text-muted-foreground truncate">{service.provider}</span>
                          {service.verified && <BadgeCheck size={12} className="text-primary flex-shrink-0" />}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                      <div className="text-sm font-black text-primary">{service.price}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          {service.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={10} />
                          {service.city}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  )
}
