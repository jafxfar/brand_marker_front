"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  ChevronDown,
  CircleDollarSign,
  FolderTree,
  Gavel,
  Headphones,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useAdminSupportUnreadQuery } from "@/hooks/api/use-support-query"
import {
  ADMIN_HUB_ANY_PERMISSIONS,
  getAdminRoutePermission,
  hasAnyPermission,
  hasPermission,
} from "@/lib/admin-permissions"
import { useAuthStore } from "@/lib/store/auth-store"
import { cn } from "@/lib/utils"

type AdminNavItem = {
  label: string
  href: string
  Icon: LucideIcon
}

type AdminNavSection = {
  title: string
  items: AdminNavItem[]
}

const NAV_COLLAPSED_KEY = "bm-admin-nav-collapsed"

const adminNavSections: AdminNavSection[] = [
  {
    title: "Обзор",
    items: [{ label: "Обзор", href: "/admin", Icon: LayoutDashboard }],
  },
  {
    title: "Операции",
    items: [
      { label: "Проверка компаний", href: "/admin/companies", Icon: Building2 },
      { label: "Модерация", href: "/admin/moderation", Icon: ShieldCheck },
      { label: "Переписки", href: "/admin/support", Icon: Headphones },
      { label: "Споры", href: "/admin/disputes", Icon: Gavel },
      { label: "Выплаты", href: "/admin/finance", Icon: CircleDollarSign },
    ],
  },
  {
    title: "Справочники",
    items: [
      { label: "Пользователи", href: "/admin/users", Icon: Users },
      { label: "Журнал действий", href: "/admin/logs", Icon: ScrollText },
      { label: "Категории", href: "/admin/categories", Icon: FolderTree },
    ],
  },
  {
    title: "Система",
    items: [
      { label: "Доступ", href: "/admin/staff", Icon: UserCog },
      { label: "Настройки", href: "/admin/settings", Icon: Settings },
    ],
  },
]

const itemMatchesPath = (href: string, pathname: string) => {
  if (href === "/admin") return pathname === href
  if (href === "/admin/companies") {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      pathname.startsWith("/admin/verification")
    )
  }
  if (href === "/admin/moderation") {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      pathname.startsWith("/admin/catalog") ||
      pathname.startsWith("/admin/rfqs") ||
      pathname.startsWith("/admin/proposals")
    )
  }
  if (href === "/admin/disputes") {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      pathname.startsWith("/admin/contracts")
    )
  }
  if (href === "/admin/finance") {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      pathname.startsWith("/admin/escrow")
    )
  }
  if (href === "/admin/staff") {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      pathname.startsWith("/admin/roles")
    )
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

const canSeeNavItem = (
  user: Parameters<typeof hasPermission>[0],
  href: string,
): boolean => {
  const hub = ADMIN_HUB_ANY_PERMISSIONS[href]
  if (hub) return hasAnyPermission(user, hub)
  const permission = getAdminRoutePermission(href)
  return !permission || hasPermission(user, permission)
}

const readCollapsed = (): Record<string, boolean> => {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(NAV_COLLAPSED_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object") return {}
    return parsed as Record<string, boolean>
  } catch {
    return {}
  }
}

const writeCollapsed = (value: Record<string, boolean>) => {
  try {
    localStorage.setItem(NAV_COLLAPSED_KEY, JSON.stringify(value))
  } catch {
    // ignore quota / private mode
  }
}

type AdminSidebarProps = {
  onNavigate?: () => void
}

export default function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const canSupport = hasPermission(user, "admin_support.view")
  const unreadQuery = useAdminSupportUnreadQuery(canSupport)
  const supportUnread = unreadQuery.data?.count ?? 0
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setCollapsed(readCollapsed())
  }, [])

  const visibleSections = useMemo(
    () =>
      adminNavSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => canSeeNavItem(user, item.href)),
        }))
        .filter((section) => section.items.length > 0),
    [user],
  )

  const activeSectionTitle = useMemo(
    () =>
      visibleSections.find((section) =>
        section.items.some((item) => itemMatchesPath(item.href, pathname)),
      )?.title ?? null,
    [pathname, visibleSections],
  )

  useEffect(() => {
    if (!activeSectionTitle) return
    setCollapsed((prev) => {
      if (!prev[activeSectionTitle]) return prev
      const next = { ...prev, [activeSectionTitle]: false }
      writeCollapsed(next)
      return next
    })
  }, [activeSectionTitle])

  const setSectionOpen = (title: string, open: boolean) => {
    setCollapsed((prev) => {
      const next = { ...prev, [title]: !open }
      writeCollapsed(next)
      return next
    })
  }

  return (
    <div className="grid gap-1">
      <div className="mb-3 px-1 text-[13px] font-semibold text-mute">
        Панель администратора
      </div>

      <nav className="grid gap-2" aria-label="Админ-навигация">
        {visibleSections.map((section) => {
          const open = !collapsed[section.title]
          return (
            <Collapsible
              key={section.title}
              open={open}
              onOpenChange={(nextOpen) => setSectionOpen(section.title, nextOpen)}
            >
              <CollapsibleTrigger
                type="button"
                className="flex h-8 w-full items-center gap-1.5 rounded-lg px-3 text-[11px] font-bold uppercase tracking-[.08em] text-mute transition-colors hover:bg-white/60 hover:text-ink"
              >
                <ChevronDown
                  size={14}
                  className={cn(
                    "shrink-0 transition-transform duration-200",
                    !open && "-rotate-90",
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{section.title}</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="grid gap-1 pt-1">
                {section.items.map((item) => {
                  const isActive = itemMatchesPath(item.href, pathname)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-[15px]",
                        isActive &&
                          "bg-white font-bold text-ink shadow-[0_1px_3px_rgba(16,24,40,.10)]",
                        !isActive &&
                          "font-semibold text-ink/75 hover:bg-white/70 hover:text-ink",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <item.Icon
                        size={20}
                        className={isActive ? "text-brand-600" : undefined}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.href === "/admin/support" && supportUnread > 0 ? (
                        <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                          {supportUnread > 99 ? "99+" : supportUnread}
                        </span>
                      ) : null}
                    </Link>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </nav>
    </div>
  )
}
