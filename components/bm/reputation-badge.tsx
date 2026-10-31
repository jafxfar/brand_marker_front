import { cn } from "@/lib/utils"
import {
  reputationTierLabel,
  type ReputationTier,
} from "@/lib/trust-levels"
import { TrustShieldIcon } from "@/components/bm/trust-shield-icon"

type ReputationBadgeProps = {
  tier: ReputationTier | string | null | undefined
  className?: string
  /** Show label next to icon */
  showLabel?: boolean
  size?: number
}

export function ReputationBadge({
  tier,
  className,
  showLabel = true,
  size = 18,
}: ReputationBadgeProps) {
  if (!tier || tier === "none") return null
  const id = tier as Exclude<ReputationTier, "none">
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-canvas px-2 py-0.5 text-xs font-semibold text-ink",
        className,
      )}
    >
      <TrustShieldIcon tier={id} size={size} />
      {showLabel ? <span>{reputationTierLabel(id)}</span> : null}
    </span>
  )
}
