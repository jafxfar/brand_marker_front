"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type MobileTab = {
  href?: string
  label: string
  Icon: LucideIcon
  match?: (pathname: string) => boolean
  badge?: number
  onClick?: () => void
  isMore?: boolean
}

type CabinetMobileNavProps = {
  tabs: MobileTab[]
  moreOpen?: boolean
}

export function CabinetMobileNav({ tabs, moreOpen }: CabinetMobileNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-white pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
      aria-label="Разделы"
    >
      {tabs.map((tab) => {
        const active = tab.isMore
          ? Boolean(moreOpen)
          : tab.match
            ? tab.match(pathname)
            : tab.href
              ? tab.href === pathname ||
                (tab.href !== "/" && pathname.startsWith(tab.href))
              : false

        const className = cn(
          "relative grid h-16 content-center justify-items-center gap-1",
          active ? "text-ink" : "text-mute",
        )

        const inner = (
          <>
            <tab.Icon className="size-6" aria-hidden />
            <span className={cn("text-[11.5px]", active ? "font-bold" : "font-medium")}>
              {tab.label}
            </span>
            {tab.badge && tab.badge > 0 ? (
              <span className="absolute top-2 left-1/2 ml-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                {tab.badge}
              </span>
            ) : null}
          </>
        )

        if (tab.onClick || tab.isMore) {
          return (
            <button
              key={tab.label}
              type="button"
              className={className}
              onClick={tab.onClick}
              aria-label={tab.label}
            >
              {inner}
            </button>
          )
        }

        return (
          <Link key={tab.label} href={tab.href!} className={className}>
            {inner}
          </Link>
        )
      })}
    </nav>
  )
}
