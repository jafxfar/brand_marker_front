import { cn } from "@/lib/utils"

type PageToolbarProps = {
  label?: string
  htmlFor?: string
  children: React.ReactNode
  className?: string
}

export const PageToolbar = ({
  label,
  htmlFor,
  children,
  className,
}: PageToolbarProps) => {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      ) : null}
      {children}
    </div>
  )
}
