import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

type PageHeadProps = {
  title: React.ReactNode
  description?: React.ReactNode
  badge?: React.ReactNode
  actions?: React.ReactNode
  /**
   * Sub-mode (HTML `S._sub`): hide H1, show only description + actions —
   * used when section title lives in the cabinet topbar.
   */
  sub?: boolean
  className?: string
}

/** Page title block matching HTML `pageHead`. */
export function PageHead({
  title,
  description,
  badge,
  actions,
  sub = false,
  className,
}: PageHeadProps) {
  if (sub) {
    if (!description && !actions) return null
    return (
      <div
        className={cn(
          "mb-5 flex flex-wrap items-center justify-between gap-3",
          className,
        )}
      >
        {description ? (
          <p className="min-w-0 text-[15px] text-mute">{description}</p>
        ) : (
          <span />
        )}
        {actions ? (
          <div className="flex flex-wrap gap-2">{actions}</div>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-end justify-between gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.02em] text-balance text-ink">
            {title}
          </h1>
          {badge}
        </div>
        {description ? (
          <p className="mt-1.5 text-[16px] text-mute">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

type BackLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
}

export function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "mb-4 inline-flex h-9 -ml-2 items-center gap-1.5 rounded-lg pl-2 pr-3 text-[14px] font-medium text-mute hover:bg-white hover:text-ink",
        className,
      )}
    >
      <ChevronLeft className="size-4" aria-hidden />
      {children}
    </Link>
  )
}
