import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type CabinetNavLinkProps = {
  href: string
  label: string
  Icon: LucideIcon
  active?: boolean
  badge?: number
  onClick?: () => void
  badgeTone?: "brand" | "danger"
}

export function CabinetNavLink({
  href,
  label,
  Icon,
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
        "flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-left text-[15px] transition",
        active
          ? "bg-white font-bold text-ink shadow-[0_1px_3px_rgba(16,24,40,.10)]"
          : "font-semibold text-ink/75 hover:bg-white/70 hover:text-ink",
      )}
    >
      <Icon className={cn("size-5", active ? "text-brand-600" : undefined)} aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge && badge > 0 ? (
        <span
          className={cn(
            "grid h-[22px] min-w-[22px] place-items-center rounded-full px-1.5 text-[12px] font-bold text-white",
            badgeTone === "danger" ? "bg-red-600" : "bg-brand-600",
          )}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  )
}
