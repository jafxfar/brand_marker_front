import { cn } from "@/lib/utils"

export const statusPillClass =
  "inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"

type StatusBadgeProps = {
  label: string
  className?: string
}

export const StatusBadge = ({ label, className }: StatusBadgeProps) => (
  <span className={cn(statusPillClass, className)}>
    {label}
  </span>
)
