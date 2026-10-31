import Link from "next/link"
import { BmIcon, type BmIconName } from "@/components/bm/bm-icon"
import { cn } from "@/lib/utils"

type CabinetNavLinkProps = {
  href: string
  label: string
  /** Phosphor icon name from BrendMarket-v7.2 CNAV */
  icon: BmIconName
  active?: boolean
  badge?: number
  onClick?: () => void
  badgeTone?: "brand" | "danger"
}

/** CNAV item — white sidebar (`bg-brand-50` active), Phosphor icons. */
export function CabinetNavLink({
  href,
  label,
  icon,
  active,
  badge,
  onClick,
  badgeTone = "brand",
}: CabinetNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] transition",
        active
          ? "bg-brand-50 font-bold text-brand-700"
          : "font-semibold text-ink/80 hover:bg-canvas hover:text-ink",
      )}
    >
      <BmIcon name={icon} className="size-[18px]" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge && badge > 0 ? (
        <span
          className={cn(
            "grid h-[22px] min-w-[22px] place-items-center rounded-full px-1.5 text-[12px] font-bold text-white",
            badgeTone === "danger"
              ? "bg-red-500"
              : active
                ? "bg-brand-600"
                : "bg-red-500",
          )}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  )
}
