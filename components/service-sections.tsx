"use client"

import Link from "next/link"
import {
  TrendingUp, ChevronRight, Users, Clock, Zap, Award,
  FileText, Building2, Briefcase, CircleDollarSign,
  Star, MapPin, BadgeCheck, ArrowRight,
} from "lucide-react"
import { getAllCategories } from "@/lib/mock/categories"
import { getFeaturedServices } from "@/lib/mock/marketplace-services"
import { getTopPerformers } from "@/lib/mock/marketplace-performers"
import { getRecentRequests } from "@/lib/mock/marketplace-requests"
import { getIcon } from "@/lib/icon-map"
import { CategoryCard } from "@/components/marketplace/category-card"
import { ServiceCard } from "@/components/marketplace/service-card"
import { PerformerCard } from "@/components/marketplace/performer-card"
import {
  categoriesUrl,
  guaranteeUrl,
  newRfqRedirect,
  ordersUrl,
  performersUrl,
  servicesUrl,
  supplierRfqRedirect,
  verificationUrl,
} from "@/lib/marketplace-routes"

export function CategoryGrid() {
  const categories = getAllCategories()

  return (
    <section className="bg-white border-b border-border py-9">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Категории услуг</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Найдите нужную услугу в вашей отрасли</p>
          </div>
          <Link href={categoriesUrl()} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5">
            Все категории <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function FeaturedServices() {
  const featuredServices = getFeaturedServices(10)

  return (
    <section className="bg-background py-9">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
              <TrendingUp size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Рекомендуемые услуги</h2>
              <p className="text-sm text-muted-foreground">Лучшие предложения от проверенных исполнителей</p>
            </div>
          </div>
          <Link href={servicesUrl()} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5">
            Смотреть все <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function ProviderShowcase() {
  const topProviders = getTopPerformers(6)

  return (
    <section className="bg-white border-t border-b border-border py-9">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
              <Award size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Топ исполнители</h2>
              <p className="text-sm text-muted-foreground">Проверенные компании с высоким рейтингом</p>
            </div>
          </div>
          <Link href={performersUrl({ featured: true })} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5">
            Все исполнители <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topProviders.map((performer) => (
            <PerformerCard key={performer.id} performer={performer} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function TrustBanners() {
  const trustFeatures = [
    { Icon: BadgeCheck, title: "Верификация компаний", desc: "Проверяем документы, реквизиты и репутацию каждого исполнителя", href: verificationUrl() },
    { Icon: CircleDollarSign, title: "Безопасная оплата", desc: "Деньги переводятся исполнителю только после принятия работы", href: guaranteeUrl() },
    { Icon: Zap, title: "Быстрый отклик", desc: "Получите первые предложения уже через 2 часа после публикации", href: ordersUrl() },
    { Icon: Star, title: "Система рейтингов", desc: "Реальные отзывы от клиентов без цензуры и накрутки", href: performersUrl({ featured: true }) },
  ]

  return (
    <section className="bg-background py-9">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {trustFeatures.map(({ Icon, title, desc, href }) => (
            <Link
              key={title}
              href={href}
              className="bg-white rounded-2xl p-5 border border-border flex gap-3 items-start hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground leading-tight">{title}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden min-h-[180px]"
            style={{ background: "linear-gradient(135deg, oklch(0.22 0.055 255) 0%, oklch(0.3 0.09 255) 100%)" }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-48 flex items-center justify-center opacity-[0.07]">
              <Building2 size={160} className="text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <BadgeCheck size={15} className="text-primary" />
                <span className="text-primary text-xs font-bold uppercase tracking-widest">Для заказчиков</span>
              </div>
              <h3 className="text-white text-xl font-black leading-tight mb-1.5">
                Найдите исполнителя<br />за 24 часа
              </h3>
              <p className="text-white/65 text-xs leading-relaxed mb-5 max-w-xs">
                Опубликуйте задание бесплатно и получите предложения от проверенных компаний
              </p>
              <Link
                href={newRfqRedirect()}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg hover:-translate-y-px"
              >
                Разместить заказ <ChevronRight size={15} />
              </Link>
            </div>
          </div>

          <div className="bg-[oklch(0.97_0.04_60)] border border-primary/20 rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden min-h-[180px]">
            <div className="absolute right-0 top-0 bottom-0 w-48 flex items-center justify-center opacity-[0.07]">
              <Briefcase size={160} className="text-foreground" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Star size={15} className="text-primary fill-primary" />
                <span className="text-primary text-xs font-bold uppercase tracking-widest">Для исполнителей</span>
              </div>
              <h3 className="text-foreground text-xl font-black leading-tight mb-1.5">
                Получайте новых<br />клиентов каждый день
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed mb-5 max-w-xs">
                Регистрируйтесь и откликайтесь на заказы в вашей категории прямо сейчас
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-[oklch(0.22_0.055_255)] hover:bg-[oklch(0.18_0.055_255)] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg hover:-translate-y-px"
              >
                Стать исполнителем <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function RecentRequests() {
  const recentRequests = getRecentRequests(6)

  return (
    <section className="bg-white border-t border-b border-border py-9">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
              <FileText size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Свежие заказы</h2>
              <p className="text-sm text-muted-foreground">Актуальные запросы от бизнеса прямо сейчас</p>
            </div>
          </div>
          <Link href={ordersUrl()} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5">
            Все заказы <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentRequests.map((req) => {
            const Icon = getIcon(req.icon)
            return (
              <div
                key={req.id}
                className="border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg transition-all duration-200 group bg-white"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={ordersUrl()}
                      className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 block"
                    >
                      {req.title}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock size={10} className="text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{req.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <div>
                    <div className="text-sm font-black text-primary">{req.budget}</div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                      <MapPin size={9} />{req.city}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Users size={11} />
                      {req.offers} предложений
                    </div>
                    <Link
                      href={supplierRfqRedirect()}
                      className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5 justify-end hover:text-primary transition-colors"
                    >
                      Откликнуться <ChevronRight size={9} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
