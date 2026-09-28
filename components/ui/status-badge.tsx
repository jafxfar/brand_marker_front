import { cn } from "@/lib/utils"

export const statusPillClass =
  "inline-block text-sm font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap"

type StatusBadgeProps = {
  label: string
  className?: string
}

export const StatusBadge = ({ label, className }: StatusBadgeProps) => (
  <span className={cn(statusPillClass, className)}>
    {label}
  </span>
)
