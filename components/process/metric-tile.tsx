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
      <div className="flex items-center gap-2 text-[14px] text-mute">
        <Icon size={16} aria-hidden="true" />
        {label}
      </div>
      <div className={cn("tnum text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-ink", valueClassName)}>
        {value}
      </div>
      {hint ? <div className="text-[13px] text-mute">{hint}</div> : null}
    </>
  )
  const className =
    "grid content-start gap-1.5 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)]"

  if (!href) return <div className={className}>{content}</div>
  return (
    <Link
      href={href}
      className={cn(className, "transition hover:border-[#C9CED6]")}
    >
      {content}
    </Link>
  )
}
