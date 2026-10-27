"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Boxes,
  Inbox,
  Plus,
  FileCheck,
  MessageSquare,
  Send,
  Wallet,
  Building2,
  Crown,
  type LucideIcon,
} from "lucide-react"
import { BrandLogo } from "@/components/bm"
import { CabinetNavLink } from "@/components/layout/cabinet-nav-link"
import { Button } from "@/components/ui/button"
import { useSupportChat } from "@/components/support/support-chat-context"
import {
  emptySupplierNavCounts,
  useSupplierNavCounts,
} from "@/hooks/api/use-nav-counts-query"
import { useHydrated } from "@/hooks/use-hydrated"
import { useAuthStore } from "@/lib/store/auth-store"

type BadgeKey = "rfqs" | "deals" | "messages" | "catalog"

type NavItem = {
  href: string
  label: string
  Icon: LucideIcon
  badge?: BadgeKey
}

const navItems: NavItem[] = [
  { href: "/supplier", label: "Обзор", Icon: LayoutDashboard },
  {
    href: "/supplier/rfqs?response=open",
    label: "Заявки",
    Icon: Inbox,
    badge: "rfqs",
  },
  { href: "/supplier/proposals", label: "Мои КП", Icon: Send },
  {
    href: "/supplier/contracts?tab=active",
    label: "Сделки",
    Icon: FileCheck,
    badge: "deals",
  },
  {
    href: "/supplier/catalog?status=pending_review",
    label: "Товары и услуги",
    Icon: Boxes,
    badge: "catalog",
  },
  { href: "/supplier/finance", label: "Финансы", Icon: Wallet },
  { href: "/supplier/subscription", label: "Подписка", Icon: Crown },
  {
    href: "/supplier/messages",
    label: "Сообщения",
    Icon: MessageSquare,
    badge: "messages",
  },
  { href: "/supplier/company", label: "Профиль компании", Icon: Building2 },
]

const pathOf = (href: string) => href.split("?")[0] ?? href

export default function SupplierSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const countsQuery = useSupplierNavCounts()
  const counts = countsQuery.data ?? emptySupplierNavCounts()
  const { openSupport } = useSupportChat()

  const getBadge = (item: NavItem): number => {
    if (!hydrated || !item.badge) return 0
    if (item.badge === "messages") return counts.messages
    if (item.badge === "rfqs") return counts.rfqs_new
    if (item.badge === "deals") return counts.deals_new
    if (item.badge === "catalog") return counts.catalog_new
    return 0
  }

  const isActive = (href: string): boolean => {
    const base = pathOf(href)
    return base === "/supplier" ? pathname === base : pathname.startsWith(base)
  }

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
        <button
          type="button"
          className="justify-self-start text-[13.5px] font-semibold text-brand-700 hover:underline"
          onClick={() => {
            openSupport()
            onNavigate?.()
          }}
        >
          Написать в поддержку
        </button>
      </div>
    </nav>
  )
}
