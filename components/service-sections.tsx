"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Monitor, Megaphone, Scale, BarChart2, Truck, HardHat,
  Palette, UserCheck, LineChart, Lock, Globe2, BookOpen,
  Star, MapPin, BadgeCheck, ArrowRight, Heart, Eye,
  TrendingUp, ChevronRight, Users, Clock, Zap, Award,
  FileText, Building2, Briefcase, CircleDollarSign,
} from "lucide-react"

// ─── CATEGORY GRID ──────────────────────────────────────────────────────────

const mainCategories = [
  { Icon: Monitor,    label: "ИТ и разработка",         count: "8 420", color: "bg-blue-50 hover:bg-blue-100/80",     iconBg: "bg-blue-100",    iconColor: "text-blue-600" },
  { Icon: Megaphone,  label: "Маркетинг и реклама",     count: "5 310", color: "bg-orange-50 hover:bg-orange-100/80", iconBg: "bg-orange-100",  iconColor: "text-orange-500" },
  { Icon: Scale,      label: "Юридические услуги",      count: "3 780", color: "bg-violet-50 hover:bg-violet-100/80", iconBg: "bg-violet-100",  iconColor: "text-violet-600" },
  { Icon: BarChart2,  label: "Финансы и аудит",         count: "2 960", color: "bg-emerald-50 hover:bg-emerald-100/80", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { Icon: Truck,      label: "Логистика и склад",       count: "4 150", color: "bg-amber-50 hover:bg-amber-100/80",  iconBg: "bg-amber-100",   iconColor: "text-amber-600" },
  { Icon: HardHat,    label: "Строительство и ремонт",  count: "6 230", color: "bg-red-50 hover:bg-red-100/80",      iconBg: "bg-red-100",     iconColor: "text-red-500" },
  { Icon: Palette,    label: "Дизайн и брендинг",       count: "3 480", color: "bg-pink-50 hover:bg-pink-100/80",    iconBg: "bg-pink-100",    iconColor: "text-pink-500" },
  { Icon: UserCheck,  label: "Кадры и HR",               count: "2 110", color: "bg-indigo-50 hover:bg-indigo-100/80", iconBg: "bg-indigo-100",  iconColor: "text-indigo-600" },
  { Icon: LineChart,  label: "Консалтинг",               count: "1 890", color: "bg-teal-50 hover:bg-teal-100/80",   iconBg: "bg-teal-100",    iconColor: "text-teal-600" },
  { Icon: Lock,       label: "Безопасность",             count: "1 340", color: "bg-slate-50 hover:bg-slate-100/80", iconBg: "bg-slate-100",   iconColor: "text-slate-600" },
  { Icon: Globe2,     label: "ВЭД и экспорт",            count: "980",   color: "bg-cyan-50 hover:bg-cyan-100/80",   iconBg: "bg-cyan-100",    iconColor: "text-cyan-600" },
  { Icon: BookOpen,   label: "Обучение и тренинги",      count: "2 670", color: "bg-yellow-50 hover:bg-yellow-100/80", iconBg: "bg-yellow-100",  iconColor: "text-yellow-600" },
]

export function CategoryGrid() {
  return (
    <section className="bg-white border-b border-border py-9">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Категории услуг</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Найдите нужную услугу в вашей отрасли</p>
          </div>
          <Link href="#" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5">
            Все категории <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {mainCategories.map((cat, i) => (
            <Link
              key={i}
              href="#"
              className={`${cat.color} rounded-2xl p-4 flex flex-col items-center gap-3 text-center transition-all hover:shadow-md border border-transparent hover:border-primary/15 group`}
            >
              <div className={`${cat.iconBg} rounded-xl w-12 h-12 flex items-center justify-center`}>
                <cat.Icon size={22} className={cat.iconColor} />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                  {cat.label}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{cat.count} услуг</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FEATURED SERVICES ────────────────────────────────────────────────────────

type ServiceBadge = {
  label: string
  className: string
}

type Service = {
  id: number
  title: string
  provider: string
  city: string
  rating: number
  reviews: number
  price: string
  tags: string[]
  verified: boolean
  badge: ServiceBadge | null
  Icon: React.ElementType
  iconBg: string
  iconColor: string
  saves: number
  views: string
}

const featuredServices: Service[] = [
  {
    id: 1,
    title: "Разработка корпоративного сайта под ключ",
    provider: "ТехноСофт ООО",
    city: "Душанбе",
    rating: 4.9,
    reviews: 312,
    price: "от 80 000  TJS",
    tags: ["React", "Next.js", "SEO"],
    verified: true,
    badge: { label: "Топ исполнитель", className: "bg-primary text-white" },
    Icon: Monitor,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    saves: 128,
    views: "2.4к",
  },
  {
    id: 2,
    title: "Комплексное SEO продвижение бизнеса",
    provider: "РостМаркет Агентство",
    city: "Худжанд",
    rating: 4.8,
    reviews: 187,
    price: "от 25 000  TJS/мес",
    tags: ["SEO", "Контент", "Аналитика"],
    verified: true,
    badge: { label: "Гарантия результата", className: "bg-emerald-500 text-white" },
    Icon: TrendingUp,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    saves: 94,
    views: "1.8к",
  },
  {
    id: 3,
    title: "Бухгалтерское обслуживание на аутсорсе",
    provider: "ФинансПро",
    city: "Казань",
    rating: 4.9,
    reviews: 245,
    price: "от 15 000  TJS/мес",
    tags: ["1С", "Налоги", "Отчётность"],
    verified: true,
    badge: { label: "Выбор клиентов", className: "bg-[oklch(0.22_0.055_255)] text-white" },
    Icon: BarChart2,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    saves: 203,
    views: "3.1к",
  },
  {
    id: 4,
    title: "Юридическое сопровождение сделок M&A",
    provider: "ЮрПартнёр Групп",
    city: "Душанбе",
    rating: 5.0,
    reviews: 89,
    price: "от 120 000  TJS",
    tags: ["Корп. право", "Сделки", "Due diligence"],
    verified: true,
    badge: { label: "Премиум", className: "bg-amber-500 text-white" },
    Icon: Scale,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    saves: 67,
    views: "945",
  },
  {
    id: 5,
    title: "Грузоперевозки по России и СНГ",
    provider: "ГрузЛогист",
    city: "Худжанд",
    rating: 4.7,
    reviews: 521,
    price: "от 8 000  TJS",
    tags: ["FTL", "LTL", "Рефрижератор"],
    verified: true,
    badge: { label: "Быстрая доставка", className: "bg-orange-500 text-white" },
    Icon: Truck,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    saves: 156,
    views: "4.2к",
  },
  {
    id: 6,
    title: "Разработка и внедрение CRM системы",
    provider: "СистемИнтегратор",
    city: "Худжанд",
    rating: 4.8,
    reviews: 143,
    price: "от 200 000  TJS",
    tags: ["Битрикс24", "AmoCRM", "Кастом"],
    verified: true,
    badge: { label: "Сертифицирован", className: "bg-teal-600 text-white" },
    Icon: Briefcase,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    saves: 112,
    views: "2.0к",
  },
  {
    id: 7,
    title: "HR консалтинг и подбор топ-менеджеров",
    provider: "ЭлитПерсонал",
    city: "Душанбе",
    rating: 4.9,
    reviews: 76,
    price: "от 50 000  TJS",
    tags: ["C-level", "Executive search", "Оценка"],
    verified: true,
    badge: null,
    Icon: UserCheck,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    saves: 45,
    views: "780",
  },
  {
    id: 8,
    title: "Комплексная кибербезопасность предприятия",
    provider: "СекьюрТех",
    city: "Душанбе",
    rating: 4.9,
    reviews: 58,
    price: "от 150 000  TJS",
    tags: ["Пентест", "SIEM", "Compliance"],
    verified: true,
    badge: { label: "Новинка", className: "bg-red-500 text-white" },
    Icon: Lock,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    saves: 89,
    views: "1.3к",
  },
  {
    id: 9,
    title: "Дизайн фирменного стиля и брендинг",
    provider: "Креатив Студия",
    city: "Худжанд",
    rating: 4.8,
    reviews: 234,
    price: "от 45 000  TJS",
    tags: ["Логотип", "Гайдлайн", "Упаковка"],
    verified: false,
    badge: null,
    Icon: Palette,
    iconBg: "bg-pink-50",
    iconColor: "text-pink-500",
    saves: 178,
    views: "2.7к",
  },
  {
    id: 10,
    title: "Таможенное оформление и ВЭД поддержка",
    provider: "ТаможГрупп",
    city: "Худжанд",
    rating: 4.7,
    reviews: 302,
    price: "от 20 000  TJS",
    tags: ["Импорт", "Экспорт", "Брокер"],
    verified: true,
    badge: { label: "Выгодно", className: "bg-cyan-600 text-white" },
    Icon: Globe2,
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    saves: 134,
    views: "3.4к",
  },
]

export function FeaturedServices() {
  const [saved, setSaved] = useState<number[]>([])

  const toggleSave = (id: number) => {
    setSaved((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

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
          <Link href="#" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5">
            Смотреть все <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {featuredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-border rounded-2xl hover:shadow-lg hover:border-primary/25 transition-all duration-200 group relative overflow-hidden"
            >
              {/* Icon area */}
              <div className={`${service.iconBg} h-[110px] flex items-center justify-center relative`}>
                {service.badge && (
                  <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${service.badge.className} z-10 leading-4`}>
                    {service.badge.label}
                  </span>
                )}
                <button
                  onClick={() => toggleSave(service.id)}
                  className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition-all"
                  aria-label="Сохранить"
                >
                  <Heart
                    size={14}
                    className={saved.includes(service.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}
                  />
                </button>
                <div className={`w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center shadow-sm`}>
                  <service.Icon size={26} className={service.iconColor} />
                </div>
              </div>

              {/* Content */}
              <div className="p-3.5">
                <Link
                  href="#"
                  className="text-[13px] font-semibold text-foreground hover:text-primary transition-colors leading-snug line-clamp-2 block"
                >
                  {service.title}
                </Link>

                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-xs text-muted-foreground truncate">{service.provider}</span>
                    {service.verified && <BadgeCheck size={12} className="text-primary flex-shrink-0" />}
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={11} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{service.city}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {service.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-lg font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Rating & views */}
                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-foreground">{service.rating}</span>
                    <span className="text-[10px] text-muted-foreground">({service.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Eye size={10} />
                    <span>{service.views}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between">
                  <div className="text-sm font-black text-primary">{service.price}</div>
                  <button className="text-[11px] font-semibold text-primary hover:bg-secondary px-2 py-1 rounded-lg transition-colors">
                    Запрос
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── PROVIDER SHOWCASE ───────────────────────────────────────────────────────

const topProviders = [
  {
    id: 1,
    name: "ТехноСофт ООО",
    category: "ИТ и разработка",
    city: "Душанбе",
    rating: 4.9,
    reviews: 312,
    clients: "250+",
    years: "12 лет",
    initials: "ТС",
    color: "bg-blue-600",
    specialties: ["Веб-разработка", "Мобильные приложения", "DevOps"],
    verified: true,
    Icon: Monitor,
  },
  {
    id: 2,
    name: "РостМаркет Агентство",
    category: "Digital маркетинг",
    city: "Худжанд",
    rating: 4.8,
    reviews: 187,
    clients: "180+",
    years: "8 лет",
    initials: "РМ",
    color: "bg-orange-500",
    specialties: ["SEO", "Контекстная реклама", "SMM"],
    verified: true,
    Icon: Megaphone,
  },
  {
    id: 3,
    name: "ЮрПартнёр Групп",
    category: "Юридические услуги",
    city: "Душанбе",
    rating: 5.0,
    reviews: 89,
    clients: "320+",
    years: "15 лет",
    initials: "ЮП",
    color: "bg-violet-600",
    specialties: ["Корпоративное право", "Недвижимость", "M&A"],
    verified: true,
    Icon: Scale,
  },
  {
    id: 4,
    name: "ФинансПро",
    category: "Финансы и аудит",
    city: "Казань",
    rating: 4.9,
    reviews: 245,
    clients: "410+",
    years: "10 лет",
    initials: "ФП",
    color: "bg-emerald-600",
    specialties: ["Бухгалтерия", "Налоговый учёт", "Аудит"],
    verified: true,
    Icon: BarChart2,
  },
  {
    id: 5,
    name: "ГрузЛогист",
    category: "Логистика",
    city: "Худжанд",
    rating: 4.7,
    reviews: 521,
    clients: "900+",
    years: "7 лет",
    initials: "ГЛ",
    color: "bg-amber-600",
    specialties: ["FTL перевозки", "LTL сборные грузы", "Таможня"],
    verified: true,
    Icon: Truck,
  },
  {
    id: 6,
    name: "СистемИнтегратор",
    category: "ИТ-консалтинг",
    city: "Худжанд",
    rating: 4.8,
    reviews: 143,
    clients: "140+",
    years: "9 лет",
    initials: "СИ",
    color: "bg-teal-600",
    specialties: ["CRM системы", "ERP внедрение", "1С"],
    verified: true,
    Icon: Briefcase,
  },
]

export function ProviderShowcase() {
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
          <Link href="#" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5">
            Все исполнители <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topProviders.map((provider) => (
            <Link
              key={provider.id}
              href="#"
              className="border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg transition-all duration-200 group bg-white"
            >
              <div className="flex items-start gap-4">
                <div className={`${provider.color} w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
                  {provider.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {provider.name}
                    </span>
                    {provider.verified && <BadgeCheck size={14} className="text-primary flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <provider.Icon size={11} className="text-muted-foreground" />
                    <div className="text-xs text-muted-foreground">{provider.category}</div>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center gap-0.5">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold">{provider.rating}</span>
                      <span className="text-xs text-muted-foreground">({provider.reviews})</span>
                    </div>
                    <span className="text-muted-foreground/40 text-xs">•</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin size={10} />
                      {provider.city}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                <span className="flex items-center gap-1.5">
                  <Users size={12} className="text-primary" />
                  <span className="font-semibold text-foreground">{provider.clients}</span> клиентов
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className="text-primary" />
                  на рынке <span className="font-semibold text-foreground">{provider.years}</span>
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {provider.specialties.map((spec) => (
                  <span key={spec} className="text-[10px] bg-muted text-muted-foreground px-2.5 py-1 rounded-lg font-medium">
                    {spec}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── TRUST BANNERS ────────────────────────────────────────────────────────────

export function TrustBanners() {
  const trustFeatures = [
    { Icon: BadgeCheck, title: "Верификация компаний", desc: "Проверяем документы, реквизиты и репутацию каждого исполнителя" },
    { Icon: CircleDollarSign, title: "Безопасная оплата", desc: "Деньги переводятся исполнителю только после принятия работы" },
    { Icon: Zap, title: "Быстрый отклик", desc: "Получите первые предложения уже через 2 часа после публикации" },
    { Icon: Star, title: "Система рейтингов", desc: "Реальные отзывы от клиентов без цензуры и накрутки" },
  ]

  return (
    <section className="bg-background py-9">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Feature strips */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {trustFeatures.map(({ Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-5 border border-border flex gap-3 items-start hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground leading-tight">{title}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* For clients */}
          <div
            className="rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden min-h-[180px]"
            style={{ background: "linear-gradient(135deg, oklch(0.22 0.055 255) 0%, oklch(0.3 0.09 255) 100%)" }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-48 flex items-center justify-center opacity-[0.07]">
              <Building2 size={160} className="text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <BadgeCheck size={15} className="text-orange-300" />
                <span className="text-orange-300 text-xs font-bold uppercase tracking-widest">Для заказчиков</span>
              </div>
              <h3 className="text-white text-xl font-black leading-tight mb-1.5">
                Найдите исполнителя<br />за 24 часа
              </h3>
              <p className="text-white/65 text-xs leading-relaxed mb-5 max-w-xs">
                Опубликуйте задание бесплатно и получите предложения от проверенных компаний
              </p>
              <Link
                href="/login?redirect=/customer/orders/new"
                className="inline-flex items-center gap-2 bg-primary hover:bg-[oklch(0.58_0.22_38)] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg hover:-translate-y-px"
              >
                Разместить заказ <ChevronRight size={15} />
              </Link>
            </div>
          </div>

          {/* For providers */}
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

// ─── RECENT REQUESTS ─────────────────────────────────────────────────────────

const recentRequests = [
  { title: "Нужна разработка интернет-магазина на Bitrix", budget: "150 000  TJS", city: "Душанбе", time: "5 мин назад", offers: 3, Icon: Monitor },
  { title: "SEO оптимизация сайта B2B компании", budget: "30 000  TJS/мес", city: "Казань", time: "12 мин назад", offers: 7, Icon: TrendingUp },
  { title: "Юридическое сопровождение слияния ООО", budget: "Договорная", city: "СПб", time: "23 мин назад", offers: 2, Icon: Scale },
  { title: "Грузоперевозка Душанбе–Худжанд 10 тонн", budget: "45 000  TJS", city: "Душанбе", time: "31 мин назад", offers: 9, Icon: Truck },
  { title: "Бухгалтерский учёт для ИП на УСН", budget: "12 000  TJS/мес", city: "Екб", time: "45 мин назад", offers: 14, Icon: BarChart2 },
  { title: "Разработка фирменного стиля для стартапа", budget: "60 000  TJS", city: "Душанбе", time: "1 ч назад", offers: 5, Icon: Palette },
]

export function RecentRequests() {
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
          <Link href="#" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5">
            Все заказы <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentRequests.map((req, i) => (
            <Link
              key={i}
              href="#"
              className="border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg transition-all duration-200 group bg-white"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <req.Icon size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {req.title}
                    </h3>
                  </div>
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
                  <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5 justify-end">
                    Откликнуться <ChevronRight size={9} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
