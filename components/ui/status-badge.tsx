import { cn } from "@/lib/utils"

type StatusBadgeProps = {
  label: string
  className?: string
}

export const StatusBadge = ({ label, className }: StatusBadgeProps) => (
  <span
    className={cn(
      "inline-block text-xs font-semibold px-3 py-1.5 rounded-full",
      className,
    )}
  >
    {label}
  </span>
)
