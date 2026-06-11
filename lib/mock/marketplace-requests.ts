import type { MarketplaceRequest } from "@/types/marketplace"

export const marketplaceRequests: MarketplaceRequest[] = [
  {
    id: 1,
    title: "Нужна разработка интернет-магазина на Bitrix",
    budget: "150 000  TJS",
    city: "Душанбе",
    time: "5 мин назад",
    offers: 3,
    icon: "Monitor",
    categoryId: "it",
  },
  {
    id: 2,
    title: "SEO оптимизация сайта B2B компании",
    budget: "30 000  TJS/мес",
    city: "Казань",
    time: "12 мин назад",
    offers: 7,
    icon: "TrendingUp",
    categoryId: "marketing",
  },
  {
    id: 3,
    title: "Юридическое сопровождение слияния ООО",
    budget: "Договорная",
    city: "СПб",
    time: "23 мин назад",
    offers: 2,
    icon: "Scale",
    categoryId: "legal",
  },
  {
    id: 4,
    title: "Грузоперевозка Душанбе–Худжанд 10 тонн",
    budget: "45 000  TJS",
    city: "Душанбе",
    time: "31 мин назад",
    offers: 9,
    icon: "Truck",
    categoryId: "logistics",
  },
  {
    id: 5,
    title: "Бухгалтерский учёт для ИП на УСН",
    budget: "12 000  TJS/мес",
    city: "Екб",
    time: "45 мин назад",
    offers: 14,
    icon: "BarChart2",
    categoryId: "finance",
  },
  {
    id: 6,
    title: "Разработка фирменного стиля для стартапа",
    budget: "60 000  TJS",
    city: "Душанбе",
    time: "1 ч назад",
    offers: 5,
    icon: "Palette",
    categoryId: "design",
  },
]

export const getRequest = (id: number): MarketplaceRequest | undefined =>
  marketplaceRequests.find((r) => r.id === id)

export const getRecentRequests = (limit = 6): MarketplaceRequest[] =>
  marketplaceRequests.slice(0, limit)
