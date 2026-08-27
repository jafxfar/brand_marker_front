"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, FileText, ShoppingCart, Store, Bell, User,
  Briefcase, Plus, FileCheck, Wallet, Star, Building2, MessageSquare, Package, type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/lib/store/cart-store"
import { useUnreadNotificationsCount } from "@/hooks/use-notifications"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"

interface NavItem {
  href: string
  label: string
  Icon: LucideIcon
  badge?: "cart" | "notifications"
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: "Главное",
    items: [
      { href: "/customer", label: "Дашборд", Icon: LayoutDashboard },
      { href: "/customer/catalog", label: "Товары и услуги", Icon: Package },
      { href: "/customer/rfqs", label: "Мои заявки", Icon: FileText },
      { href: "/customer/contracts", label: "Договоры", Icon: FileCheck },
    ],
  },
  {
    title: "Оплата",
    items: [
      { href: "/customer/payments", label: "Платежи", Icon: Wallet },
      { href: "/customer/cart", label: "Корзина", Icon: ShoppingCart, badge: "cart" },
    ],
  },
  {
    title: "Партнёры",
    items: [
      { href: "/customer/suppliers", label: "Исполнители", Icon: Store },
      { href: "/customer/messages", label: "Сообщения", Icon: MessageSquare },
      { href: "/customer/reviews", label: "Мои отзывы", Icon: Star },
    ],
  },
  {
    title: "Аккаунт",
    items: [
      { href: "/customer/company", label: "Мои компании", Icon: Building2 },
      { href: "/customer/notifications", label: "Уведомления", Icon: Bell, badge: "notifications" },
      { href: "/customer/profile", label: "Профиль", Icon: User },
    ],
  },
]

export default function CustomerSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0))
  const unread = useUnreadNotificationsCount("buyer")

  const getBadge = (item: NavItem): number => {
    if (!hydrated || !item.badge) return 0
    return item.badge === "cart" ? cartCount : unread
  }

  const isActive = (href: string): boolean =>
    href === "/customer" ? pathname === href : pathname.startsWith(href)

  return (
    <div className="flex flex-col h-full bg-card">
      <Link
        href="/"
        className="flex items-center gap-2.5 h-[68px] px-5 border-b border-border flex-shrink-0"
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Briefcase size={16} className="text-primary-foreground" />
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-lg font-bold text-primary tracking-tight">Бренд</span>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Маркет
          </span>
        </div>
      </Link>

      <div className="p-4">
        <Link
          href="/customer/rfqs/new"
          onClick={onNavigate}
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors shadow-sm"
        >
          <Plus size={17} />
          Создать заявку
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-5 overflow-y-auto pb-4">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              {section.title}
            </p>
            {section.items.map((item) => {
              const active = isActive(item.href)
              const badge = getBadge(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative",
                    active
                      ? "bg-secondary text-primary"
                      : "text-foreground hover:bg-secondary hover:text-primary",
                  )}
                >
                  <item.Icon size={18} className={active ? "text-primary" : "text-muted-foreground"} />
                  <span>{item.label}</span>
                  {badge > 0 && (
                    <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="rounded-xl bg-secondary p-3.5">
          <p className="text-xs font-bold text-foreground">Кабинет заказчика</p>
          {!isApiEnabled() && (
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Демо-режим. Данные хранятся локально в браузере.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
