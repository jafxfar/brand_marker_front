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
  className?: string
}

export const PageEmptyState = ({
  title,
  description,
  icon,
  className,
}: PageEmptyStateProps) => {
  return (
    <div className={cn("px-6 py-16 text-center", className)}>
      {icon ? (
        <div className="mx-auto mb-3 flex justify-center text-muted-foreground/50" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <h2 className="font-bold text-foreground">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
