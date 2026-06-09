import {
  Monitor, Megaphone, Scale, BarChart2, Truck, HardHat,
  Palette, UserCheck, LineChart, Lock, Globe2, BookOpen,
  Package, type LucideIcon,
} from "lucide-react"

export const iconMap: Record<string, LucideIcon> = {
  Monitor,
  Megaphone,
  Scale,
  BarChart2,
  Truck,
  HardHat,
  Palette,
  UserCheck,
  LineChart,
  Lock,
  Globe2,
  BookOpen,
}

export const getIcon = (name: string): LucideIcon => iconMap[name] ?? Package
