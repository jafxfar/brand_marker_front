import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type MetricTileProps = {
  Icon: LucideIcon
  label: string
  value: string
  /** Plain-language explanation of what the number means. */
  hint?: string
  href?: string
  valueClassName?: string
}

export const MetricTile = ({ Icon, label, value, hint, href, valueClassName }: MetricTileProps) => {
  const content = (
    <>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon size={16} aria-hidden="true" />
        {label}
      </div>
      <div className={cn("tnum text-[22px] font-bold", valueClassName)}>{value}</div>
      {hint ? <div className="text-[13px] text-muted-foreground">{hint}</div> : null}
    </>
  )
  const className = "grid gap-1 rounded-2xl border border-border bg-card p-4"

  if (!href) return <div className={className}>{content}</div>
  return (
    <Link
      href={href}
      className={cn(
        className,
        "transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {content}
    </Link>
  )
}
