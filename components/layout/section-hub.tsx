"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  ADMIN_HUBS,
  ADMIN_SECTION_TITLE,
  ADMIN_SUBTABS,
  BUYER_HUBS,
  BUYER_SECTION_TITLE,
  BUYER_SUBTABS,
  matchHub,
  matchSubtab,
  SUPPLIER_HUBS,
  SUPPLIER_SECTION_TITLE,
  SUPPLIER_SUBTABS,
  type CabinetRole,
  type CabinetSubtab,
  type SectionMeta,
} from "@/lib/cabinet-nav"
import { cn } from "@/lib/utils"

type SectionHubProps = {
  role: CabinetRole
  /** Optional badge counts keyed by subtab id */
  badges?: Record<string, number>
}

const CONFIG = {
  buyer: {
    hubs: BUYER_HUBS,
    subtabs: BUYER_SUBTABS,
    titles: BUYER_SECTION_TITLE,
    home: "/customer",
  },
  supplier: {
    hubs: SUPPLIER_HUBS,
    subtabs: SUPPLIER_SUBTABS,
    titles: SUPPLIER_SECTION_TITLE,
    home: "/supplier",
  },
  admin: {
    hubs: ADMIN_HUBS,
    subtabs: ADMIN_SUBTABS,
    titles: ADMIN_SECTION_TITLE,
    home: "/admin",
  },
} as const

/** HTML `sectionWrap` — section H1 + underline subtabs for merged CNAV hubs. */
export function SectionHub({ role, badges }: SectionHubProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()
  const cfg = CONFIG[role]
  const hub = matchHub(cfg.hubs, pathname, cfg.home)
  if (!hub) return null
  const tabs = cfg.subtabs[hub.id]
  if (!tabs?.length) return null
  const meta: SectionMeta | undefined = cfg.titles[hub.id]
  const active = matchSubtab(tabs, pathname, search)

  return (
    <div className="mb-6">
      {meta ? (
        <div className="mb-1">
          <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-ink">
            {meta.title}
          </h1>
          {meta.description ? (
            <p className="mt-1 text-[15px] text-mute">{meta.description}</p>
          ) : null}
        </div>
      ) : null}
      <div
        role="tablist"
        aria-label={meta?.title ?? hub.label}
        className="mt-4 flex gap-6 overflow-x-auto border-b border-line no-scrollbar"
      >
        {tabs.map((tab: CabinetSubtab) => {
          const on = active?.id === tab.id
          const badge = badges?.[tab.id] ?? 0
          return (
            <Link
              key={tab.id}
              href={tab.href}
              role="tab"
              aria-selected={on}
              className={cn(
                "-mb-px inline-flex h-11 shrink-0 items-center gap-2 border-b-2 text-[15px] font-semibold transition",
                on
                  ? "border-brand-600 text-ink"
                  : "border-transparent text-mute hover:text-ink",
              )}
            >
              {tab.label}
              {badge > 0 ? (
                <span
                  className={cn(
                    "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold text-white",
                    on ? "bg-brand-600" : "bg-red-500",
                  )}
                >
                  {badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
