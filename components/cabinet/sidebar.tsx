"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Store,
  Plus,
  FileCheck,
  Wallet,
  MessageSquare,
  Building2,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react"
import { BrandLogo } from "@/components/bm"
import { CabinetNavLink } from "@/components/layout/cabinet-nav-link"
import { Button } from "@/components/ui/button"
import {
  emptyBuyerNavCounts,
  useBuyerNavCounts,
} from "@/hooks/api/use-nav-counts-query"
import { useHydrated } from "@/hooks/use-hydrated"
import { useAuthStore } from "@/lib/store/auth-store"

type BadgeKey = "rfqs" | "deals" | "messages" | "approvals"

type NavItem = {
  href: string
  label: string
  Icon: LucideIcon
  badge?: BadgeKey
}

/** Order matches extended CNAV.buyer in BrendMarket-v5. */
const navItems: NavItem[] = [
  { href: "/customer", label: "Обзор", Icon: LayoutDashboard },
  { href: "/customer/rfqs?status=quotes", label: "Заявки", Icon: FileText, badge: "rfqs" },
  { href: "/customer/contracts?tab=active", label: "Сделки", Icon: FileCheck, badge: "deals" },
  { href: "/customer/approvals", label: "Согласования", Icon: BadgeCheck, badge: "approvals" },
  { href: "/customer/payments", label: "Платежи и документы", Icon: Wallet },
  { href: "/customer/suppliers", label: "Поставщики", Icon: Store },
  { href: "/customer/messages", label: "Сообщения", Icon: MessageSquare, badge: "messages" },
  { href: "/customer/company", label: "Компания и сотрудники", Icon: Building2 },
]

const pathOf = (href: string) => href.split("?")[0] ?? href

export default function CustomerSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const countsQuery = useBuyerNavCounts()
  const counts = countsQuery.data ?? emptyBuyerNavCounts()

  const getBadge = (item: NavItem): number => {
    if (!hydrated || !item.badge) return 0
    if (item.badge === "messages") return counts.messages
    if (item.badge === "rfqs") return counts.rfqs_new
    if (item.badge === "deals") return counts.deals_new
    if (item.badge === "approvals") return counts.approvals_new
    return 0
  }

  const isActive = (href: string): boolean => {
    const base = pathOf(href)
    return base === "/customer" ? pathname === base : pathname.startsWith(base)
  }

  const companyName =
    hydrated && user?.company ? user.company : "Покупатель"
  const initials =
    hydrated && user?.name
      ? user.name
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase() ?? "")
          .join("")
      : "ПК"

  return (
    <nav className="grid gap-1" aria-label="Меню кабинета">
      {onNavigate ? (
        <div className="mb-3 flex items-center justify-between border-b border-line pb-4">
          <BrandLogo small />
          <button
            type="button"
            onClick={onNavigate}
            className="grid size-10 place-items-center rounded-lg hover:bg-canvas"
            aria-label="Закрыть меню"
          >
            ×
          </button>
        </div>
      ) : null}

      <div className="mb-4 flex items-center gap-3 rounded-xl border border-line bg-white p-3">
        <span className="grid size-10 place-items-center rounded-lg bg-ink text-[12px] font-semibold text-white">
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <b className="block truncate text-[14.5px]">{companyName}</b>
          <span className="text-[12.5px] text-mute">Покупатель</span>
        </span>
      </div>

      <Button asChild className="mb-4 h-11 w-full rounded-[10px] text-[15px]">
        <Link href="/customer/rfqs/new" onClick={onNavigate}>
          <Plus className="size-5" />
          Новая заявка
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

      <div className="mt-4 border-t border-line pt-4">
        <CabinetNavLink
          href="/services"
          label="Купить в каталоге"
          Icon={ShoppingCart}
          onClick={onNavigate}
        />
      </div>

      <div className="mt-6 grid gap-2 rounded-xl border border-line bg-white p-4">
        <b className="text-[14px]">Нужна помощь?</b>
        <p className="text-[13px] text-mute">
          Ответим в чате в течение часа или по телефону +992 44 600 00 00.
        </p>
        <button
          type="button"
          className="justify-self-start text-[13.5px] font-semibold text-brand-700 hover:underline"
          onClick={onNavigate}
        >
          Написать в поддержку
        </button>
      </div>
    </nav>
  )
}
