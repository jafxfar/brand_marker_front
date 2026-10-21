import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

type PageHeaderProps = {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  backHref?: string
  backLabel?: string
  className?: string
}

export const PageHeader = ({
  title,
  description,
  actions,
  backHref,
  backLabel = "Назад",
  className,
}: PageHeaderProps) => {
  return (
    <header
      className={cn(
        "mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        {backHref ? (
          <Link
            href={backHref}
            className="mb-2 inline-flex h-9 -ml-2 items-center gap-1.5 rounded-lg pl-2 pr-3 text-[14px] font-medium text-mute hover:bg-white hover:text-ink"
            aria-label={backLabel}
          >
            <ChevronLeft size={16} aria-hidden="true" />
            {backLabel}
          </Link>
        ) : null}
        <h1 className="text-balance text-[26px] font-extrabold tracking-[-0.02em] text-ink sm:text-[28px]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-prose text-[14.5px] text-mute">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  )
}
