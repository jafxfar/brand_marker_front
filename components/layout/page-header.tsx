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
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {backHref ? (
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={backLabel}
          >
            <ChevronLeft size={16} aria-hidden="true" />
            {backLabel}
          </Link>
        ) : null}
        <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  )
}
