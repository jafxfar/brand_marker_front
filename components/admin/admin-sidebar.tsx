"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BadgeCheck,
  CircleDollarSign,
  FolderTree,
  Gavel,
  LayoutDashboard,
  ScrollText,
  Users,
  type LucideIcon,
} from "lucide-react"
import { BrandLogo } from "@/components/bm"
import { CabinetNavLink } from "@/components/layout/cabinet-nav-link"
import {
  emptyAdminNavCounts,
  useAdminNavCounts,
} from "@/hooks/api/use-nav-counts-query"
import {
  ADMIN_HUB_ANY_PERMISSIONS,
  getAdminRoutePermission,
  hasAnyPermission,
  hasPermission,
} from "@/lib/admin-permissions"
import { ADMIN_HUBS, matchHub } from "@/lib/cabinet-nav"
import { useAuthStore } from "@/lib/store/auth-store"

const ICONS: Record<string, LucideIcon> = {
  home: LayoutDashboard,
  verif: BadgeCheck,
  disputes: Gavel,
  payouts: CircleDollarSign,
  users: Users,
  audit: ScrollText,
  cats: FolderTree,
}

const canSeeHref = (
  user: Parameters<typeof hasPermission>[0],
  href: string,
): boolean => {
  const base = href.split("?")[0] ?? href
  const hub = ADMIN_HUB_ANY_PERMISSIONS[base]
  if (hub) return hasAnyPermission(user, hub)
  const permission = getAdminRoutePermission(base)
  return !permission || hasPermission(user, permission)
}

type AdminSidebarProps = {
  onNavigate?: () => void
}

export default function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const countsQuery = useAdminNavCounts()
  const counts = countsQuery.data ?? emptyAdminNavCounts()
  const activeHub = matchHub(ADMIN_HUBS, pathname, "/admin")

  const badgeFor = (keys?: string[]) => {
    if (!keys?.length) return 0
    let n = 0
    for (const key of keys) {
      const value = counts[key as keyof typeof counts]
      if (typeof value === "number") n += value
    }
    return n
  }

  const hubs = ADMIN_HUBS.filter((hub) => canSeeHref(user, hub.href))

  return (
    <nav className="flex h-full flex-col gap-1 p-4" aria-label="Админ-навигация">
      <div className="mb-3">
        <BrandLogo />
        <p className="mt-2 text-[13px] font-semibold text-mute">
          Панель администратора
        </p>
      </div>

      <ul className="grid gap-0.5">
        {hubs.map((hub) => {
          const Icon = ICONS[hub.id] ?? LayoutDashboard
          return (
            <li key={hub.id}>
              <CabinetNavLink
                href={hub.href}
                label={hub.label}
                Icon={Icon}
                active={activeHub?.id === hub.id}
                badge={badgeFor(hub.badgeKeys)}
                badgeTone="danger"
                onClick={onNavigate}
              />
            </li>
          )
        })}
      </ul>

      <div className="mt-auto border-t border-line pt-4">
        <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[.08em] text-mute">
          Ещё
        </p>
        <div className="grid gap-1 text-[13.5px]">
          {[
            { href: "/admin/catalog", label: "Каталог" },
            { href: "/admin/staff", label: "Доступ" },
            { href: "/admin/gateway-logs", label: "Логи шлюза" },
          ]
            .filter((item) => canSeeHref(user, item.href))
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className="rounded-lg px-3 py-2 font-semibold text-mute hover:bg-canvas hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
        </div>
      </div>
    </nav>
  )
}
