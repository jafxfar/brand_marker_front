import type { Listing } from "@/types"

export const listings: Listing[] = [
  // Products
  {
    id: "lst-1",
    supplierId: "sup-8",
    kind: "product",
    title: "Сервер Dell PowerEdge R750 (стойка 2U)",
    description: "Корпоративный сервер с гарантией 3 года и доставкой по РФ.",
    categoryId: "logistics",
    price: 480000,
    color: "Чёрный",
    sku: "DELL-R750-2U",
    inStock: 12,
  },
  {
    id: "lst-2",
    supplierId: "sup-8",
    kind: "product",
    title: "Офисное кресло ErgoPro (эргономичное)",
    description: "Партия офисных кресел с сетчатой спинкой. Оптовая цена за штуку.",
    categoryId: "logistics",
    price: 18900,
    color: "Серый",
    sku: "ERGO-PRO-GRY",
    inStock: 340,
  },
  {
    id: "lst-3",
    supplierId: "sup-9",
    kind: "product",
    title: "Гипсокартон Knauf 12.5мм (поддон)",
    description: "Строительный гипсокартон, поддон 50 листов. Доставка манипулятором.",
    categoryId: "construction",
    price: 36500,
    color: "Серый",
    sku: "KNAUF-125-PAL",
    inStock: 80,
  },
  {
    id: "lst-4",
    supplierId: "sup-1",
    kind: "product",
    title: "Лицензия 1С:Предприятие 8 ПРОФ",
    description: "Коробочная лицензия с электронной поставкой ключа.",
    categoryId: "it",
    price: 33600,
    color: "—",
    sku: "1C-ENT8-PROF",
    inStock: 999,
  },
  // Services
  {
    id: "lst-5",
    supplierId: "sup-1",
    kind: "service",
    title: "Разработка корпоративного сайта под ключ",
    description: "Дизайн, вёрстка, бэкенд, SEO-подготовка. Срок 4–6 недель.",
    categoryId: "it",
    price: 280000,
  },
  {
    id: "lst-6",
    supplierId: "sup-2",
    kind: "service",
    title: "Комплексное SEO продвижение",
    description: "Аудит, семантика, контент, ссылочное. Абонентская плата в месяц.",
    categoryId: "marketing",
    price: 45000,
  },
  {
    id: "lst-7",
    supplierId: "sup-4",
    kind: "service",
    title: "Бухгалтерское обслуживание на аутсорсе",
    description: "Полное ведение учёта и отчётности. Стоимость в месяц.",
    categoryId: "finance",
    price: 25000,
  },
  {
    id: "lst-8",
    supplierId: "sup-3",
    kind: "service",
    title: "Юридическое сопровождение сделок",
    description: "Due diligence, договоры, регистрация. Фикс за проект.",
    categoryId: "legal",
    price: 120000,
  },
  {
    id: "lst-9",
    supplierId: "sup-7",
    kind: "service",
    title: "Разработка фирменного стиля и брендинг",
    description: "Логотип, гайдлайн, носители. Срок 3 недели.",
    categoryId: "design",
    price: 65000,
  },
  {
    id: "lst-10",
    supplierId: "sup-5",
    kind: "service",
    title: "Грузоперевозки по России и СНГ",
    description: "FTL/LTL перевозки с трекингом. Стоимость от маршрута.",
    categoryId: "logistics",
    price: 38000,
  },
]

export const getListing = (id: string): Listing | undefined =>
  listings.find((l) => l.id === id)

export const getListingsBySupplier = (supplierId: string): Listing[] =>
  listings.filter((l) => l.supplierId === supplierId)
