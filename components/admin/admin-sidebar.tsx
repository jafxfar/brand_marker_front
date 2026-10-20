"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BookOpen,
  Boxes,
  Building2,
  CircleDollarSign,
  ClipboardList,
  FileCheck2,
  FileInput,
  FolderTree,
  Gavel,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react"
import { getAdminRoutePermission, hasPermission } from "@/lib/admin-permissions"
import { useAuthStore } from "@/lib/store/auth-store"
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
      { label: "Верификация", href: "/admin/verification", Icon: FileCheck2, available: true },
      { label: "Каталог", href: "/admin/catalog", Icon: Boxes, available: true },
      { label: "Категории", href: "/admin/categories", Icon: FolderTree, available: true },
    ],
  },
  {
    title: "Операции",
    items: [
      { label: "Заявки (RFQ)", href: "/admin/rfqs", Icon: ClipboardList, available: true },
      { label: "Предложения", href: "/admin/proposals", Icon: FileInput, available: true },
      { label: "Контракты", href: "/admin/contracts", Icon: BookOpen, available: true },
      { label: "Финансы", href: "/admin/finance", Icon: CircleDollarSign, available: true },
      { label: "Escrow", href: "/admin/escrow", Icon: WalletCards, available: true },
      { label: "Споры", href: "/admin/disputes", Icon: Gavel, available: true },
    ],
  },
  {
    title: "Система",
    items: [
      { label: "Аналитика", href: "/admin/analytics", Icon: BarChart3, available: true },
      { label: "Сотрудники", href: "/admin/staff", Icon: UserCog, available: true },
      { label: "Роли и доступы", href: "/admin/roles", Icon: KeyRound, available: true },
      { label: "Журнал действий", href: "/admin/logs", Icon: ScrollText, available: true },
      { label: "Настройки", href: "/admin/settings", Icon: Settings, available: true },
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
  const user = useAuthStore((state) => state.user)

  const visibleSections = adminNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const permission = getAdminRoutePermission(item.href)
        return !permission || hasPermission(user, permission)
      }),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <div className="grid gap-1">
      <div className="mb-3 px-1 text-[13px] font-semibold text-mute">
        Панель администратора
      </div>

      <nav className="grid gap-4" aria-label="Админ-навигация">
        {visibleSections.map((section) => (
          <div key={section.title} className="grid gap-1">
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[.08em] text-mute">
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
                "flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-[15px]",
                isActive && "bg-white font-bold text-ink shadow-[0_1px_3px_rgba(16,24,40,.10)]",
                !isActive && available && "font-semibold text-ink/75 hover:bg-white/70 hover:text-ink",
                !available && "cursor-not-allowed font-semibold text-mute/55",
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
                    <item.Icon size={20} className={isActive ? "text-brand-600" : undefined} aria-hidden="true" />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide">
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
                  <item.Icon size={20} className={isActive ? "text-brand-600" : undefined} aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </div>
  )
}
