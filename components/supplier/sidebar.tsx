"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Boxes, Inbox, Users, Crown, User,
  Briefcase, Plus, FileCheck, MessageSquare, Send, Wallet, Building2, type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  Icon: LucideIcon
}

const navItems: NavItem[] = [
  { href: "/supplier", label: "Дашборд", Icon: LayoutDashboard },
  { href: "/supplier/contracts", label: "Контракты", Icon: FileCheck },
  { href: "/supplier/finance", label: "Финансы", Icon: Wallet },
  { href: "/supplier/rfqs", label: "Маркетплейс RFQ", Icon: Inbox },
  { href: "/supplier/proposals", label: "Мои предложения", Icon: Send },
  { href: "/supplier/messages", label: "Сообщения", Icon: MessageSquare },
  { href: "/supplier/catalog", label: "Каталог", Icon: Boxes },
  { href: "/supplier/orders", label: "Заказы", Icon: Inbox },
  { href: "/supplier/customers", label: "Заказчики", Icon: Users },
  // { href: "/supplier/company", label: "Мои компании", Icon: Building2 },
  { href: "/supplier/subscription", label: "Подписка", Icon: Crown },
  { href: "/supplier/profile", label: "Профиль", Icon: User },
]

export default function SupplierSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string): boolean =>
    href === "/supplier" ? pathname === href : pathname.startsWith(href)

  return (
    <div className="flex flex-col h-full bg-white">
      <Link
        href="/"
        className="flex items-center gap-2.5 h-[68px] px-5 border-b border-border flex-shrink-0"
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Briefcase size={16} className="text-primary-foreground" />
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-lg font-black text-primary tracking-tight">Бизнес</span>
          <span className="text-lg font-black tracking-tight" style={{ color: "oklch(0.22 0.055 255)" }}>
            Маркет
          </span>
        </div>
      </Link>

      <div className="p-4">
        <Link
          href="/supplier/catalog/new"
          onClick={onNavigate}
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-bold transition-colors shadow-sm"
        >
          <Plus size={17} />
          Добавить позицию
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-primary"
                  : "text-foreground hover:bg-secondary hover:text-primary",
              )}
            >
              <item.Icon size={18} className={active ? "text-primary" : "text-muted-foreground"} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="rounded-xl bg-secondary p-3.5">
          <p className="text-xs font-bold text-foreground">Кабинет поставщика</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
            Демо-режим. Данные хранятся локально в браузере.
          </p>
        </div>
      </div>
    </div>
  )
}
