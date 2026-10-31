/** Free trust / reputation tiers — earned by activity, not paid. */

export const REPUTATION_TIERS = [
  "none",
  "verified",
  "shield",
  "silver",
  "gold",
] as const

export type ReputationTier = (typeof REPUTATION_TIERS)[number]

export type TrustLevelMeta = {
  id: Exclude<ReputationTier, "none">
  name: string
  /** Short condition line under the title (replaces price from the design). */
  condition: string
  description: string
  minCompleted: number
  minRating: number
  minSuccessRate: number | null
}

export const TRUST_LEVELS: TrustLevelMeta[] = [
  {
    id: "verified",
    name: "Проверенный",
    condition: "бесплатно · верификация",
    description: "Документы компании или исполнителя проверены платформой.",
    minCompleted: 0,
    minRating: 0,
    minSuccessRate: null,
  },
  {
    id: "shield",
    name: "Щит",
    condition: "от 5 сделок · рейтинг ≥ 4.0",
    description: "Стабильная работа после верификации: первые успешные сделки.",
    minCompleted: 5,
    minRating: 4.0,
    minSuccessRate: null,
  },
  {
    id: "silver",
    name: "Серебряный щит",
    condition: "от 20 сделок · рейтинг ≥ 4.5 · успех ≥ 90%",
    description: "Высокий рейтинг и надёжность на дистанции.",
    minCompleted: 20,
    minRating: 4.5,
    minSuccessRate: 90,
  },
  {
    id: "gold",
    name: "Золотой щит",
    condition: "от 50 сделок · рейтинг ≥ 4.7 · успех ≥ 95%",
    description: "Топ доверия: много сделок и почти без споров.",
    minCompleted: 50,
    minRating: 4.7,
    minSuccessRate: 95,
  },
]

export const reputationTierLabel = (
  tier: ReputationTier | string | null | undefined,
): string => {
  switch (tier) {
    case "verified":
      return "Проверенный"
    case "shield":
      return "Щит"
    case "silver":
      return "Серебряный щит"
    case "gold":
      return "Золотой щит"
    default:
      return "Без уровня"
  }
}

export type ReputationStats = {
  verification_status?: string | null
  completed_contracts?: number | null
  rating?: number | null
  success_rate?: number | null
}

export const resolveReputationTier = (stats: ReputationStats): ReputationTier => {
  const verified = (stats.verification_status || "").toLowerCase() === "verified"
  if (!verified) return "none"

  const completed = Math.max(0, Number(stats.completed_contracts) || 0)
  const rating = Number(stats.rating) || 0
  const success =
    stats.success_rate == null || Number.isNaN(Number(stats.success_rate))
      ? null
      : Number(stats.success_rate)

  const gold = TRUST_LEVELS.find((t) => t.id === "gold")!
  if (
    completed >= gold.minCompleted &&
    rating >= gold.minRating &&
    success != null &&
    success >= (gold.minSuccessRate ?? 0)
  ) {
    return "gold"
  }

  const silver = TRUST_LEVELS.find((t) => t.id === "silver")!
  if (
    completed >= silver.minCompleted &&
    rating >= silver.minRating &&
    success != null &&
    success >= (silver.minSuccessRate ?? 0)
  ) {
    return "silver"
  }

  const shield = TRUST_LEVELS.find((t) => t.id === "shield")!
  if (completed >= shield.minCompleted && rating >= shield.minRating) {
    return "shield"
  }

  return "verified"
}
