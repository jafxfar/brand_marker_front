"use client"

import { useId, useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  normalizeReputationTier,
  trustLevelMeta,
  type ReputationTier,
} from "@/lib/trust-levels"

type TrustShieldIconProps = {
  tier: ReputationTier | string | null | undefined
  size?: number
  className?: string
  /** Disable sweep / sparkles (badges) */
  still?: boolean
}

const SH_PATH =
  "M60 5 103 16.5Q107 17.6 107 21.6V55C107 84 88 102.5 60 115 32 102.5 13 84 13 55V21.6Q13 17.6 17 16.5Z"

const IDLE = {
  rim: ["#E6E9EE", "#CBD0D8"] as const,
  body: ["#F3F5F8", "#E1E5EA"] as const,
  fg: "#A3AAB5",
}

let _delayN = 0
const nextDelay = () => {
  _delayN += 1
  return `${((_delayN * 0.53) % 3.2).toFixed(2)}s`
}

function Spark({
  x,
  y,
  s,
  delay,
}: {
  x: number
  y: number
  s: number
  delay: string
}) {
  const d = `M${x} ${y - s}Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y}Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s}Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y}Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}Z`
  return (
    <path
      className="bm-tw"
      style={{ animationDelay: delay }}
      d={d}
      fill="#fff"
    />
  )
}

/** Animated trust shield — BrendMarket-v7.2 `SHIELD_SVG`. */
export function TrustShieldIcon({
  tier,
  size = 40,
  className,
  still = false,
}: TrustShieldIconProps) {
  const uid = useId().replace(/:/g, "")
  const delay = useMemo(() => nextDelay(), [])
  const normalized = normalizeReputationTier(tier)
  const meta = trustLevelMeta(normalized)
  const rim = meta?.rim ?? IDLE.rim
  const body = meta?.body ?? IDLE.body
  const fg = meta?.fg ?? IDLE.fg
  const anim = Boolean(meta) && !still
  const glowClass =
    anim && meta?.glow && size >= 20 ? `bm-glow-${meta.glow}` : ""

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={cn("shrink-0 overflow-visible", glowClass, className)}
      style={{ animationDelay: delay }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={rim[0]} />
          <stop offset="1" stopColor={rim[1]} />
        </linearGradient>
        <linearGradient id={`${uid}b`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={body[0]} />
          <stop offset="1" stopColor={body[1]} />
        </linearGradient>
        <linearGradient id={`${uid}s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0.85} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <clipPath id={`${uid}c`}>
          <path d={SH_PATH} />
        </clipPath>
      </defs>
      <path d={SH_PATH} fill={`url(#${uid}r)`} />
      <path
        d={SH_PATH}
        transform="translate(60 60) scale(.82) translate(-60 -58)"
        fill={`url(#${uid}b)`}
      />
      <path
        d="M24 26 60 15 96 26V44C80 38 42 40 24 52Z"
        fill="#fff"
        opacity={meta ? 0.28 : 0.4}
        clipPath={`url(#${uid}c)`}
      />
      <text
        x="60"
        y="80"
        textAnchor="middle"
        fontFamily="Golos Text, Manrope, Arial, sans-serif"
        fontSize="56"
        fontWeight="800"
        fill={fg}
      >
        B
      </text>
      {anim ? (
        <g clipPath={`url(#${uid}c)`}>
          <rect
            className="bm-sw"
            style={{ animationDelay: delay }}
            x={-40}
            y={-20}
            width={34}
            height={160}
            fill={`url(#${uid}s)`}
          />
        </g>
      ) : null}
      {anim && normalized === "diamond" && size >= 26 ? (
        <>
          <Spark x={100} y={14} s={9} delay="0s" />
          <Spark x={16} y={30} s={6} delay="1.1s" />
          <Spark x={104} y={70} s={5} delay="2s" />
        </>
      ) : null}
      {anim && normalized === "gold" && size >= 40 ? (
        <Spark x={101} y={16} s={7} delay=".6s" />
      ) : null}
    </svg>
  )
}
