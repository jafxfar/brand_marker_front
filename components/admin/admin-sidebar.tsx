"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BookOpen,
  Boxes,
  Briefcase,
  Building2,
  CircleDollarSign,
  FileCheck2,
  FolderTree,
  Gavel,
  LayoutDashboard,
  PackageCheck,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

type AdminNavItem = {
  label: string
  href: string
  Icon: LucideIcon
  available?: boolean
}

type AdminNavSection = {
  title: string
  items: AdminNavItem[]
}

const adminNavSections: AdminNavSection[] = [
  {
    title: "Обзор",
    items: [
      {
        label: "Дашборд",
        href: "/admin",
        Icon: LayoutDashboard,
        available: true,
      },
    ],
  },
  {
    title: "Платформа",
    items: [
      { label: "Пользователи", href: "/admin/users", Icon: Users, available: true },
      { label: "Модерация", href: "/admin/moderation", Icon: ShieldCheck },
      { label: "Компании", href: "/admin/companies", Icon: Building2 },
      { label: "Верификация", href: "/admin/verification", Icon: FileCheck2 },
      { label: "Каталог", href: "/admin/catalog", Icon: Boxes },
      { label: "Категории", href: "/admin/categories", Icon: FolderTree },
    ],
  },
  {
    title: "Операции",
    items: [
      { label: "Заказы", href: "/admin/orders", Icon: PackageCheck },
      { label: "Контракты", href: "/admin/contracts", Icon: BookOpen },
      { label: "Финансы", href: "/admin/finance", Icon: CircleDollarSign },
      { label: "Escrow", href: "/admin/escrow", Icon: WalletCards },
      { label: "Споры", href: "/admin/disputes", Icon: Gavel },
    ],
  },
  {
    title: "Система",
    items: [
      { label: "Аналитика", href: "/admin/analytics", Icon: BarChart3 },
      { label: "Настройки", href: "/admin/settings", Icon: Settings },
    ],
  },
]

type AdminSidebarProps = {
  onNavigate?: () => void
}

export default function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-white">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="flex h-17 shrink-0 items-center gap-2.5 border-b border-border px-5"
        aria-label="Перейти на дашборд администратора"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Briefcase size={16} className="text-primary-foreground" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-black tracking-tight text-foreground">
            БрендМаркет
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Admin
          </span>
        </div>
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Админ-навигация">
        {adminNavSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              {section.title}
            </p>
            {section.items.map((item) => {
              const isActive =
                item.available &&
                (item.href === "/admin"
                  ? pathname === item.href
                  : pathname.startsWith(item.href))
              const itemClasses = cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                isActive && "bg-secondary text-primary",
                !isActive && item.available && "text-foreground transition-colors hover:bg-secondary",
                !item.available && "cursor-not-allowed text-muted-foreground/55",
              )

              if (!item.available) {
                return (
                  <button
                    key={item.href}
                    type="button"
                    disabled
                    aria-disabled="true"
                    title="Раздел появится в следующем этапе"
                    className={itemClasses}
                  >
                    <item.Icon size={18} aria-hidden="true" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-[9px] font-semibold uppercase tracking-wide">
                      Скоро
                    </span>
                  </button>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={itemClasses}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.Icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border p-4">
        <div className="rounded-xl bg-secondary p-3.5">
          <p className="text-xs font-bold text-foreground">Панель управления</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            Доступ ограничен сотрудниками платформы
          </p>
        </div>
      </div>
    </div>
  )
}
