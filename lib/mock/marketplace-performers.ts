import type { MarketplacePerformer } from "@/types/marketplace"

export const marketplacePerformers: MarketplacePerformer[] = [
  {
    id: 1,
    name: "ТехноСофт ООО",
    category: "ИТ и разработка",
    categoryId: "it",
    city: "Душанбе",
    rating: 4.9,
    reviews: 312,
    clients: "250+",
    years: "12 лет",
    initials: "ТС",
    color: "bg-blue-600",
    specialties: ["Веб-разработка", "Мобильные приложения", "DevOps"],
    verified: true,
    featured: true,
    worldwide: false,
    icon: "Monitor",
    description: "Команда из 45 разработчиков. Специализируемся на корпоративных веб-приложениях и мобильных решениях.",
  },
  {
    id: 2,
    name: "РостМаркет Агентство",
    category: "Digital маркетинг",
    categoryId: "marketing",
    city: "Худжанд",
    rating: 4.8,
    reviews: 187,
    clients: "180+",
    years: "8 лет",
    initials: "РМ",
    color: "bg-primary",
    specialties: ["SEO", "Контекстная реклама", "SMM"],
    verified: true,
    featured: true,
    worldwide: true,
    icon: "Megaphone",
    description: "Digital-агентство полного цикла с фокусом на B2B и измеримый ROI.",
  },
  {
    id: 3,
    name: "ЮрПартнёр Групп",
    category: "Юридические услуги",
    categoryId: "legal",
    city: "Душанбе",
    rating: 5.0,
    reviews: 89,
    clients: "320+",
    years: "15 лет",
    initials: "ЮП",
    color: "bg-violet-600",
    specialties: ["Корпоративное право", "Недвижимость", "M&A"],
    verified: true,
    featured: true,
    worldwide: false,
    icon: "Scale",
    description: "Юридическая фирма с практикой корпоративного и сделочного права.",
  },
  {
    id: 4,
    name: "ФинансПро",
    category: "Финансы и аудит",
    categoryId: "finance",
    city: "Бохтар",
    rating: 4.9,
    reviews: 245,
    clients: "410+",
    years: "10 лет",
    initials: "ФП",
    color: "bg-emerald-600",
    specialties: ["Бухгалтерия", "Налоговый учёт", "Аудит"],
    verified: true,
    featured: false,
    worldwide: false,
    icon: "BarChart2",
    description: "Аутсорсинг бухгалтерии и налогового сопровождения для среднего бизнеса.",
  },
  {
    id: 5,
    name: "ГрузЛогист",
    category: "Логистика",
    categoryId: "logistics",
    city: "Худжанд",
    rating: 4.7,
    reviews: 521,
    clients: "900+",
    years: "7 лет",
    initials: "ГЛ",
    color: "bg-amber-600",
    specialties: ["FTL перевозки", "LTL сборные грузы", "Таможня"],
    verified: true,
    featured: true,
    worldwide: true,
    icon: "Truck",
    description: "Логистический оператор с собственным автопарком и складскими хабами.",
  },
  {
    id: 6,
    name: "СистемИнтегратор",
    category: "ИТ-консалтинг",
    categoryId: "it",
    city: "Худжанд",
    rating: 4.8,
    reviews: 143,
    clients: "140+",
    years: "9 лет",
    initials: "СИ",
    color: "bg-teal-600",
    specialties: ["CRM системы", "ERP внедрение", "1С"],
    verified: true,
    featured: false,
    worldwide: false,
    icon: "Briefcase",
    description: "Внедрение CRM, ERP и 1С для производственных и торговых компаний.",
  },
]

export const getPerformer = (id: number): MarketplacePerformer | undefined =>
  marketplacePerformers.find((p) => p.id === id)

export const getTopPerformers = (limit = 6): MarketplacePerformer[] =>
  marketplacePerformers.filter((p) => p.featured).slice(0, limit)

export const filterPerformers = (params: {
  verified?: boolean
  featured?: boolean
  scope?: string
  q?: string
}): MarketplacePerformer[] => {
  const q = params.q?.trim().toLowerCase()
  return marketplacePerformers.filter((p) => {
    if (params.verified && !p.verified) return false
    if (params.featured && !p.featured) return false
    if (params.scope === "worldwide" && !p.worldwide) return false
    if (!q) return true
    const haystack = [p.name, p.category, p.city, ...p.specialties].join(" ").toLowerCase()
    return haystack.includes(q)
  })
}
