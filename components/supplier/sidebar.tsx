"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Boxes,
  Inbox,
  Plus,
  Briefcase,
  MessageSquare,
  ShieldCheck,
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
import { matchHub, SUPPLIER_HUBS } from "@/lib/cabinet-nav"

const ICONS: Record<string, LucideIcon> = {
  home: LayoutDashboard,
  leads: Inbox,
  deals: Briefcase,
  products: Boxes,
  messages: MessageSquare,
  tariff: ShieldCheck,
}

export default function SupplierSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const countsQuery = useSupplierNavCounts()
  const counts = countsQuery.data ?? emptySupplierNavCounts()
  const { openSupport } = useSupportChat()
  const activeHub = matchHub(SUPPLIER_HUBS, pathname, "/supplier")

  const badgeFor = (keys?: string[]) => {
    if (!hydrated || !keys?.length) return 0
    let n = 0
    for (const key of keys) {
      if (key === "messages") n += counts.messages
      if (key === "rfqs") n += counts.rfqs_new
      if (key === "deals") n += counts.deals_new
      if (key === "catalog") n += counts.catalog_new
    }
    return n
  }

  return (
    <nav className="flex h-full flex-col gap-1 p-4" aria-label="Меню кабинета">
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
      ) : (
        <div className="mb-3 hidden lg:block">
          <BrandLogo />
        </div>
      )}

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

      <ul className="grid gap-0.5">
        {SUPPLIER_HUBS.map((hub) => {
          const Icon = ICONS[hub.id] ?? LayoutDashboard
          return (
            <li key={hub.id}>
              <CabinetNavLink
                href={hub.href}
                label={hub.label}
                Icon={Icon}
                active={activeHub?.id === hub.id}
                badge={badgeFor(hub.badgeKeys)}
                onClick={onNavigate}
              />
            </li>
          )
        })}
      </ul>

      <div className="mt-4 border-t border-line pt-3">
        <p className="mb-1 px-1 text-[11px] font-bold uppercase tracking-[.08em] text-mute">
          Ещё
        </p>
        <div className="grid gap-0.5 text-[13.5px]">
          <Link
            href="/supplier/customers"
            onClick={onNavigate}
            className="rounded-lg px-3 py-2 font-semibold text-mute hover:bg-canvas hover:text-ink"
          >
            Заказчики
          </Link>
          <Link
            href="/supplier/reviews"
            onClick={onNavigate}
            className="rounded-lg px-3 py-2 font-semibold text-mute hover:bg-canvas hover:text-ink"
          >
            Отзывы
          </Link>
        </div>
      </div>

      <div className="mt-auto grid gap-3 pt-6">
        <Link
          href="/supplier/trust"
          onClick={onNavigate}
          className="grid gap-2 rounded-2xl border border-line p-3.5 hover:border-[#C9CED6]"
        >
          <span className="flex items-center gap-2.5">
            <ShieldCheck className="size-7 text-brand-600" aria-hidden />
            <b className="text-[14px]">Щит доверия</b>
          </span>
          <span className="text-[13.5px] text-mute">
            Уровень и условия — в разделе «Тариф и доверие»
          </span>
        </Link>
        <div className="grid gap-2 rounded-xl border border-line bg-white p-4">
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
      </div>
    </nav>
  )
}
