import { cn } from "@/lib/utils"

type PageSurfaceProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode
  className?: string
}

export const PageSurface = ({ children, className, ...props }: PageSurfaceProps) => {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  )
}

type PageEmptyStateProps = {
  title: string
  description?: string
  icon?: React.ReactNode
  /** Next step for the user, e.g. a button or link. */
  action?: React.ReactNode
  /** `card` renders a standalone dashed card; `plain` is meant for use inside `PageSurface`. */
  variant?: "plain" | "card"
  className?: string
}

export const PageEmptyState = ({
  title,
  description,
  icon,
  action,
  variant = "plain",
  className,
}: PageEmptyStateProps) => {
  return (
    <div
      className={cn(
        "grid justify-items-center gap-2 px-6 py-14 text-center",
        variant === "card" && "rounded-2xl border border-dashed border-border bg-card py-12",
        className,
      )}
    >
      {icon ? (
        <div
          className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground [&_svg]:h-6 [&_svg]:w-6"
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}
      <h2 className="text-[17px] font-bold text-foreground">{title}</h2>
      {description ? (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  )
}
