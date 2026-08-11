import { cn } from "@/lib/utils"

type StatusBadgeProps = {
  label: string
  className?: string
}

export const StatusBadge = ({ label, className }: StatusBadgeProps) => (
  <span
    className={cn(
      "inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full",
      className,
    )}
  >
    {label}
  </span>
)
