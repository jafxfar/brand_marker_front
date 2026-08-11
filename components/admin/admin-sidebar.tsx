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
  ClipboardList,
  FileCheck2,
  FileInput,
  FolderTree,
  Gavel,
  LayoutDashboard,
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

/** Routes with implemented admin UI — these stay clickable in the sidebar. */
const AVAILABLE_ADMIN_HREFS = new Set([
  "/admin",
  "/admin/users",
  "/admin/companies",
  "/admin/moderation",
  "/admin/catalog",
  "/admin/rfqs",
  "/admin/proposals",
  "/admin/contracts",
  "/admin/disputes",
  "/admin/finance",
])

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
      { label: "Модерация", href: "/admin/moderation", Icon: ShieldCheck, available: true },
      { label: "Компании", href: "/admin/companies", Icon: Building2, available: true },
      { label: "Верификация", href: "/admin/verification", Icon: FileCheck2 },
      { label: "Каталог", href: "/admin/catalog", Icon: Boxes, available: true },
      { label: "Категории", href: "/admin/categories", Icon: FolderTree },
    ],
  },
  {
    title: "Операции",
    items: [
      { label: "Заявки (RFQ)", href: "/admin/rfqs", Icon: ClipboardList, available: true },
      { label: "Предложения", href: "/admin/proposals", Icon: FileInput, available: true },
      { label: "Контракты", href: "/admin/contracts", Icon: BookOpen, available: true },
      { label: "Финансы", href: "/admin/finance", Icon: CircleDollarSign, available: true },
      { label: "Escrow", href: "/admin/escrow", Icon: WalletCards },
      { label: "Споры", href: "/admin/disputes", Icon: Gavel, available: true },
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

const isNavItemAvailable = (item: AdminNavItem) =>
  item.available === true || AVAILABLE_ADMIN_HREFS.has(item.href)

type AdminSidebarProps = {
  onNavigate?: () => void
}

export default function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-card">
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
          <span className="text-lg font-bold tracking-tight text-foreground">
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
              const available = isNavItemAvailable(item)
              const isActive =
                available &&
                (item.href === "/admin"
                  ? pathname === item.href
                  : pathname.startsWith(item.href))
              const itemClasses = cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                isActive && "bg-secondary text-primary",
                !isActive && available && "text-foreground transition-colors hover:bg-secondary",
                !available && "cursor-not-allowed text-muted-foreground/55",
              )

              if (!available) {
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
