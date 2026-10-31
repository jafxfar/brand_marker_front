import { cn } from "@/lib/utils"
import { BM_ICON_PATHS, type BmIconName } from "@/lib/bm-icons"

type BmIconProps = {
  name: BmIconName
  className?: string
  /** Accessible title when the icon is not decorative */
  title?: string
}

/** Phosphor Icons (MIT) — regular weight, viewBox 256 as in BrendMarket-v7.2. */
export function BmIcon({ name, className, title }: BmIconProps) {
  const paths = BM_ICON_PATHS[name]
  return (
    <svg
      viewBox="0 0 256 256"
      className={cn("size-5 shrink-0", className)}
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <g dangerouslySetInnerHTML={{ __html: paths }} />
    </svg>
  )
}

export type { BmIconName }
