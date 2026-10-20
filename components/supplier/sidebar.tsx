"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Boxes, Inbox, Plus, FileCheck, MessageSquare, Send, Wallet,
  Building2, type LucideIcon,
} from "lucide-react"
import { BrandLogo } from "@/components/bm"
import { CabinetNavLink } from "@/components/layout/cabinet-nav-link"
import { Button } from "@/components/ui/button"
import { useDealActionCount } from "@/hooks/use-deal-action-count"
import { useUnreadNotificationsCount } from "@/hooks/use-notifications"
import { useHydrated } from "@/hooks/use-hydrated"
import { useAuthStore } from "@/lib/store/auth-store"

type NavItem = {
  href: string
  label: string
  Icon: LucideIcon
  badge?: "deals" | "messages"
}

const navItems: NavItem[] = [
  { href: "/supplier", label: "Обзор", Icon: LayoutDashboard },
  { href: "/supplier/rfqs", label: "Заявки покупателей", Icon: Inbox },
  { href: "/supplier/proposals", label: "Мои КП", Icon: Send },
  { href: "/supplier/contracts", label: "Сделки", Icon: FileCheck, badge: "deals" },
  { href: "/supplier/catalog", label: "Товары и услуги", Icon: Boxes },
  { href: "/supplier/finance", label: "Финансы", Icon: Wallet },
  { href: "/supplier/messages", label: "Сообщения", Icon: MessageSquare, badge: "messages" },
  { href: "/supplier/company", label: "Профиль компании", Icon: Building2 },
]

export default function SupplierSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const dealActions = useDealActionCount("supplier")
  const unread = useUnreadNotificationsCount("supplier")

  const getBadge = (item: NavItem): number => {
    if (!item.badge) return 0
    if (item.badge === "deals") return dealActions
    return hydrated ? unread : 0
  }

  const isActive = (href: string): boolean =>
    href === "/supplier" ? pathname === href : pathname.startsWith(href)

  return (
    <nav className="grid gap-1" aria-label="Меню кабинета">
      {onNavigate ? (
        <div className="mb-3 flex items-center justify-between border-b border-line pb-4">
          <BrandLogo small />
        </div>
      ) : null}

      <div className="mb-4 flex items-center gap-3 rounded-xl border border-line bg-white p-3">
        <span className="grid size-10 place-items-center rounded-lg bg-ink text-[12px] font-semibold text-white">
          {hydrated && user?.name ? user.name.slice(0, 2).toUpperCase() : "ПП"}
        </span>
        <span className="min-w-0 flex-1">
          <b className="block truncate text-[14.5px]">
            {hydrated && user?.company ? user.company : "Поставщик"}
          </b>
          <span className="text-[12.5px] text-mute">Поставщик</span>
        </span>
      </div>

      <Button asChild className="mb-4 w-full">
        <Link href="/supplier/catalog/new" onClick={onNavigate}>
          <Plus className="size-5" />
          Добавить товар
        </Link>
      </Button>

      <ul className="grid gap-1">
        {navItems.map((item) => (
          <li key={item.href}>
            <CabinetNavLink
              href={item.href}
              label={item.label}
              Icon={item.Icon}
              active={isActive(item.href)}
              badge={getBadge(item)}
              onClick={onNavigate}
            />
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-2 rounded-xl border border-line bg-white p-4">
        <b className="text-[14px]">Нужна помощь?</b>
        <p className="text-[13px] text-mute">
          Ответим в чате в течение часа или по телефону +992 44 600 00 00.
        </p>
        <a
          href="tel:+992446000000"
          className="justify-self-start text-[13.5px] font-semibold text-brand-700 hover:underline"
        >
          Написать в поддержку
        </a>
      </div>
    </nav>
  )
}
