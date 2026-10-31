"use client"

import { cn } from "@/lib/utils"
import {
  type TrustLevelMeta,
  type ReputationTier,
} from "@/lib/trust-levels"
import { TrustShieldIcon } from "@/components/bm/trust-shield-icon"

type TrustLevelCardProps = {
  level: TrustLevelMeta
  /** Highlight as the actor's current tier */
  current?: boolean
  className?: string
  onSelect?: (id: TrustLevelMeta["id"]) => void
}

export function TrustLevelCard({
  level,
  current = false,
  className,
  onSelect,
}: TrustLevelCardProps) {
  const interactive = Boolean(onSelect)
  const Comp = interactive ? "button" : "div"

  return (
    <Comp
      type={interactive ? "button" : undefined}
      onClick={interactive ? () => onSelect?.(level.id) : undefined}
      aria-pressed={interactive ? current : undefined}
      className={cn(
        "flex flex-col items-start gap-3 rounded-2xl border bg-white p-5 text-left transition-colors",
        current
          ? "border-ink shadow-[0_0_0_1px_#16181D]"
          : "border-line hover:border-ink/30",
        interactive && "cursor-pointer",
        className,
      )}
    >
      <TrustShieldIcon tier={level.id as ReputationTier} size={44} />
      <div className="min-w-0">
        <p className="text-[16px] font-bold leading-tight text-ink">{level.name}</p>
        <p className="mt-1 text-[13.5px] text-mute">{level.condition}</p>
      </div>
      {current ? (
        <span className="mt-auto rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">
          Ваш уровень
        </span>
      ) : null}
    </Comp>
  )
}
