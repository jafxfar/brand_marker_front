import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

type PageHeadProps = {
  title: React.ReactNode
  description?: React.ReactNode
  badge?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHead({ title, description, badge, actions, className }: PageHeadProps) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0 grid gap-1.5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[26px] font-extrabold tracking-[-0.02em] text-ink sm:text-[28px]">
            {title}
          </h1>
          {badge}
        </div>
        {description ? (
          <p className="text-[14.5px] text-mute">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
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
