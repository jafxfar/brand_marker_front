import type { CatalogItemWithRelations } from "@/types"
import { DEMO_SUPPLIER_ACTOR_ID } from "@/lib/mock/companies"
import { getCatalogCategory } from "@/lib/mock/catalog-categories"

const daysAgo = (days: number): string => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

export const mockCatalogItems: CatalogItemWithRelations[] = [
  {
    id: 1001,
    actor_id: DEMO_SUPPLIER_ACTOR_ID,
    type: "product",
    category_id: 1,
    title: "Сервер Dell PowerEdge R750",
    description: "Корпоративный сервер 2U с гарантией 3 года и доставкой по РФ.",
    status: "active",
    created_at: daysAgo(30),
    category: getCatalogCategory(1),
    attributes: [
      { id: 1, item_id: 1001, name: "Форм-фактор", value: "2U", value_type: "text", sort_order: 0 },
      { id: 2, item_id: 1001, name: "Гарантия", value: "36", value_type: "number", sort_order: 1 },
    ],
    pricing: {
      id: 1,
      item_id: 1001,
      pricing_type: "tiered",
      currency: "RUB",
      fixed_price: null,
      hourly_rate: null,
      monthly_rate: null,
      tiers: [
        { min_qty: 1, price: 480000 },
        { min_qty: 5, price: 450000 },
        { min_qty: 10, price: 420000 },
      ],
    },
    media: [
      {
        id: 1,
        item_id: 1001,
        file_name: "dell-r750-front.jpg",
        file_url: "#",
        media_type: "image",
        sort_order: 0,
      },
      {
        id: 2,
        item_id: 1001,
        file_name: "spec-sheet.pdf",
        file_url: "#",
        media_type: "document",
        sort_order: 1,
      },
    ],
    stats: { item_id: 1001, views: 1240, leads: 18 },
  },
  {
    id: 1002,
    actor_id: DEMO_SUPPLIER_ACTOR_ID,
    type: "service",
    category_id: 2,
    title: "Разработка корпоративного портала",
    description: "Полный цикл: проектирование, разработка, внедрение и поддержка.",
    status: "active",
    created_at: daysAgo(20),
    category: getCatalogCategory(2),
    attributes: [
      { id: 3, item_id: 1002, name: "Стек", value: "React, Node.js", value_type: "text", sort_order: 0 },
      { id: 4, item_id: 1002, name: "Команда", value: "5", value_type: "number", sort_order: 1 },
    ],
    pricing: {
      id: 2,
      item_id: 1002,
      pricing_type: "hourly",
      currency: "RUB",
      fixed_price: null,
      hourly_rate: 4500,
      monthly_rate: null,
      tiers: [],
    },
    media: [
      {
        id: 3,
        item_id: 1002,
        file_name: "portfolio-demo.mp4",
        file_url: "#",
        media_type: "video",
        sort_order: 0,
      },
    ],
    stats: { item_id: 1002, views: 890, leads: 12 },
  },
  {
    id: 1003,
    actor_id: DEMO_SUPPLIER_ACTOR_ID,
    type: "product",
    category_id: 3,
    title: "Офисное кресло ErgoPro",
    description: "Эргономичное кресло с сетчатой спинкой для open-space.",
    status: "draft",
    created_at: daysAgo(3),
    category: getCatalogCategory(3),
    attributes: [
      { id: 5, item_id: 1003, name: "Цвет", value: "Серый", value_type: "text", sort_order: 0 },
    ],
    pricing: {
      id: 3,
      item_id: 1003,
      pricing_type: "fixed",
      currency: "RUB",
      fixed_price: 18900,
      hourly_rate: null,
      monthly_rate: null,
      tiers: [],
    },
    media: [],
    stats: { item_id: 1003, views: 0, leads: 0 },
  },
  {
    id: 1004,
    actor_id: DEMO_SUPPLIER_ACTOR_ID,
    type: "service",
    category_id: 6,
    title: "IT-аудит инфраструктуры",
    description: "Комплексный аудит серверной и сетевой инфраструктуры.",
    status: "archived",
    created_at: daysAgo(90),
    category: getCatalogCategory(6),
    attributes: [
      { id: 6, item_id: 1004, name: "Срок аудита", value: "14", value_type: "number", sort_order: 0 },
    ],
    pricing: {
      id: 4,
      item_id: 1004,
      pricing_type: "monthly",
      currency: "RUB",
      fixed_price: null,
      hourly_rate: null,
      monthly_rate: 120000,
      tiers: [],
    },
    media: [
      {
        id: 4,
        item_id: 1004,
        file_name: "audit-checklist.pdf",
        file_url: "#",
        media_type: "document",
        sort_order: 0,
      },
    ],
    stats: { item_id: 1004, views: 456, leads: 7 },
  },
]
