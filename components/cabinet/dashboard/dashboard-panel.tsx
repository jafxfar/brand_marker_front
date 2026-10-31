import Link from "next/link"
import { cn } from "@/lib/utils"

type DashboardPanelProps = {
  title: string
  href?: string
  linkLabel?: string
  badge?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function DashboardPanel({
  title,
  href,
  linkLabel = "Все →",
  badge,
  children,
  className,
}: DashboardPanelProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)] md:p-5",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-bold text-ink">{title}</h2>
          {badge}
        </div>
        {href ? (
          <Link
            href={href}
            className="shrink-0 text-[13px] font-semibold text-brand-700 hover:underline"
          >
            {linkLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  )
}
