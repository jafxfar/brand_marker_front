import type { LucideIcon } from "lucide-react"

type StatCardProps = {
  Icon: LucideIcon
  label: string
  value: string
  accent: string
  subValue?: string
}

export const StatCard = ({ Icon, label, value, accent, subValue }: StatCardProps) => (
  <div className="bg-card border border-border rounded-xl p-4">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${accent}`}>
      <Icon size={16} />
    </div>
    <div className="text-xl font-bold text-foreground leading-none">{value}</div>
    {subValue && (
      <div className="text-[11px] text-muted-foreground mt-1">{subValue}</div>
    )}
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
  </div>
)
