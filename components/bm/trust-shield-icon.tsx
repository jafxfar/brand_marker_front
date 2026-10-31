import { cn } from "@/lib/utils"
import type { ReputationTier } from "@/lib/trust-levels"

type TrustShieldIconProps = {
  tier: Exclude<ReputationTier, "none"> | ReputationTier
  size?: number
  className?: string
}

const PALETTE: Record<
  Exclude<ReputationTier, "none">,
  { fill: string; letter: string; rim: string }
> = {
  verified: { fill: "#12A06E", letter: "#FFFFFF", rim: "#0A6E4B" },
  shield: { fill: "#0E8F62", letter: "#FFFFFF", rim: "#0A6E4B" },
  silver: { fill: "#C5CBD3", letter: "#2A2F38", rim: "#8B93A0" },
  gold: { fill: "#E9A73B", letter: "#3A2800", rim: "#C4841E" },
}

/** Shield with brand «B» — visual from the trust-levels design. */
export function TrustShieldIcon({
  tier,
  size = 40,
  className,
}: TrustShieldIconProps) {
  if (tier === "none") return null
  const colors = PALETTE[tier]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M24 4.5c6.2 3.4 11.4 4.6 15.5 4.6v14.2c0 9.8-6.2 18.2-15.5 21.2C15.7 41.5 9.5 33.1 9.5 23.3V9.1c4.1 0 9.3-1.2 14.5-4.6Z"
        fill={colors.fill}
        stroke={colors.rim}
        strokeWidth="1.5"
      />
      <text
        x="24"
        y="28"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="16"
        fontWeight="800"
        fill={colors.letter}
      >
        B
      </text>
    </svg>
  )
}
