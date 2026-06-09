import type { LucideIcon } from "lucide-react"

type StatCardProps = {
  Icon: LucideIcon
  label: string
  value: string
  accent: string
  subValue?: string
}

export const StatCard = ({ Icon, label, value, accent, subValue }: StatCardProps) => (
  <div className="bg-white border border-border rounded-2xl p-5">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
      <Icon size={18} />
    </div>
    <div className="text-2xl font-black text-foreground leading-none">{value}</div>
    {subValue && (
      <div className="text-[11px] text-muted-foreground mt-1">{subValue}</div>
    )}
    <div className="text-xs text-muted-foreground mt-1.5">{label}</div>
  </div>
)
