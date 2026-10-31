"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  normalizeReputationTier,
  reputationTierLabel,
  trustLevelMeta,
} from "@/lib/trust-levels"
import { TrustShieldIcon } from "@/components/bm/trust-shield-icon"

type ReputationBadgeProps = {
  tier: string | null | undefined
  className?: string
  showLabel?: boolean
  size?: number
}

let _d = 0
const nextD = () => {
  _d += 1
  return `${((_d * 0.53) % 3.2).toFixed(2)}s`
}

/** Trust badge with shine — BrendMarket-v7.2 `trustBadge`. */
export function ReputationBadge({
  tier,
  className,
  showLabel = true,
  size = 18,
}: ReputationBadgeProps) {
  const delay = useMemo(() => nextD(), [])
  const id = normalizeReputationTier(tier)
  if (id === "none") return null
  const meta = trustLevelMeta(id)
  if (!meta) return null

  return (
    <span
      className={cn(
        "bm-shine inline-flex items-center gap-1 whitespace-nowrap rounded-md font-extrabold shrink-0",
        size <= 15 ? "h-5 pl-0.5 pr-1.5 text-[11px]" : "h-6 pl-0.5 pr-2 text-[12px]",
        className,
      )}
      style={{
        ["--d" as string]: delay,
        background: meta.bg,
        color: meta.fg,
        boxShadow: `inset 0 0 0 1px ${meta.bd}`,
      }}
      title={`${meta.name} щит доверия: выдан площадкой за успешные сделки и высокий рейтинг. Купить нельзя`}
    >
      <TrustShieldIcon tier={id} size={size <= 15 ? 15 : 18} still />
      {showLabel ? <span>{reputationTierLabel(id)}</span> : null}
    </span>
  )
}
