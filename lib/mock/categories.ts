import type { Category } from "@/types"

// Icon names map to lucide-react components via lib/icon-map.ts
export const categories: Category[] = [
  { id: "it", label: "ИТ и разработка", icon: "Monitor", count: "8 420" },
  { id: "marketing", label: "Маркетинг и реклама", icon: "Megaphone", count: "5 310" },
  { id: "legal", label: "Юридические услуги", icon: "Scale", count: "3 780" },
  { id: "finance", label: "Финансы и аудит", icon: "BarChart2", count: "2 960" },
  { id: "logistics", label: "Логистика и склад", icon: "Truck", count: "4 150" },
  { id: "construction", label: "Строительство и ремонт", icon: "HardHat", count: "6 230" },
  { id: "design", label: "Дизайн и брендинг", icon: "Palette", count: "3 480" },
  { id: "hr", label: "Кадры и HR", icon: "UserCheck", count: "2 110" },
  { id: "consulting", label: "Консалтинг", icon: "LineChart", count: "1 890" },
  { id: "security", label: "Безопасность", icon: "Lock", count: "1 340" },
  { id: "export", label: "ВЭД и экспорт", icon: "Globe2", count: "980" },
  { id: "education", label: "Обучение и тренинги", icon: "BookOpen", count: "2 670" },
]

export const getCategory = (id: string): Category | undefined =>
  categories.find((c) => c.id === id)
