/**
 * Trust / reputation shields — BrendMarket-v7.2.
 * Earned automatically; not sold. Levels: silver → gold → diamond.
 */

export const REPUTATION_TIERS = [
  "none",
  "silver",
  "gold",
  "diamond",
] as const

export type ReputationTier = (typeof REPUTATION_TIERS)[number]

/** Legacy API / UI values remapped to v7.2 tiers. */
export type LegacyReputationTier =
  | ReputationTier
  | "verified"
  | "shield"

export type TrustLevelMeta = {
  id: Exclude<ReputationTier, "none">
  name: string
  condition: string
  description: string
  minCompleted: number
  minRating: number
  /** On-time / success rate %, null = not required */
  minOnTime: number | null
  minMonths: number
  glow: "" | "gold" | "diamond"
  rim: [string, string]
  body: [string, string]
  fg: string
  bg: string
  bd: string
}

export const TRUST_LEVELS: TrustLevelMeta[] = [
  {
    id: "silver",
    name: "Серебряный",
    condition: "от 10 сделок · рейтинг ≥ 4.5 · в срок ≥ 90%",
    description: "Первый щит: стабильные сделки после проверки документов.",
    minCompleted: 10,
    minRating: 4.5,
    minOnTime: 90,
    minMonths: 3,
    glow: "",
    rim: ["#C7CDD6", "#7E8794"],
    body: ["#FBFCFD", "#C5CBD4"],
    fg: "#363C46",
    bg: "linear-gradient(135deg,#F4F6F8,#D3D8DF)",
    bd: "#C3C9D2",
  },
  {
    id: "gold",
    name: "Золотой",
    condition: "от 40 сделок · рейтинг ≥ 4.7 · в срок ≥ 95%",
    description: "Высокий рейтинг и поставки в срок на дистанции.",
    minCompleted: 40,
    minRating: 4.7,
    minOnTime: 95,
    minMonths: 12,
    glow: "gold",
    rim: ["#F0C04F", "#A8700C"],
    body: ["#FFE98F", "#F2B12A"],
    fg: "#2E1F00",
    bg: "linear-gradient(135deg,#FFE38A,#E9A825)",
    bd: "#D99A1E",
  },
  {
    id: "diamond",
    name: "Алмазный",
    condition: "от 100 сделок · рейтинг ≥ 4.8 · в срок ≥ 98%",
    description: "Лучшие на площадке: почти без срывов и споров.",
    minCompleted: 100,
    minRating: 4.8,
    minOnTime: 98,
    minMonths: 24,
    glow: "diamond",
    rim: ["#9F6BFF", "#4B1A9E"],
    body: ["#EBDDFF", "#8B5CF6"],
    fg: "#FFFFFF",
    bg: "linear-gradient(135deg,#A779FF,#5B21B6)",
    bd: "#6D35D9",
  },
]

export const normalizeReputationTier = (
  tier: string | null | undefined,
): ReputationTier => {
  switch ((tier || "").toLowerCase()) {
    case "silver":
      return "silver"
    case "gold":
      return "gold"
    case "diamond":
      return "diamond"
    // legacy ladder
    case "verified":
    case "shield":
    case "none":
    default:
      return "none"
  }
}

export const reputationTierLabel = (
  tier: LegacyReputationTier | string | null | undefined,
): string => {
  const n = normalizeReputationTier(tier)
  switch (n) {
    case "silver":
      return "Серебряный щит"
    case "gold":
      return "Золотой щит"
    case "diamond":
      return "Алмазный щит"
    default:
      return "Без уровня"
  }
}

export const trustLevelMeta = (
  tier: ReputationTier | string | null | undefined,
): TrustLevelMeta | null => {
  const n = normalizeReputationTier(tier)
  if (n === "none") return null
  return TRUST_LEVELS.find((t) => t.id === n) ?? null
}

export type ReputationStats = {
  verification_status?: string | null
  completed_contracts?: number | null
  rating?: number | null
  /** On-time / success %, 0–100 */
  success_rate?: number | null
  /** Months on platform — optional */
  months_on_platform?: number | null
  disputes_lost?: number | null
}

export const resolveReputationTier = (stats: ReputationStats): ReputationTier => {
  const verified = (stats.verification_status || "").toLowerCase() === "verified"
  if (!verified) return "none"

  const completed = Math.max(0, Number(stats.completed_contracts) || 0)
  const rating = Number(stats.rating) || 0
  const onTime =
    stats.success_rate == null || Number.isNaN(Number(stats.success_rate))
      ? null
      : Number(stats.success_rate)
  const months = Math.max(0, Number(stats.months_on_platform) || 0)
  const disputes = Math.max(0, Number(stats.disputes_lost) || 0)

  const meets = (L: TrustLevelMeta) => {
    if (completed < L.minCompleted) return false
    if (rating < L.minRating) return false
    // Skip when API has no on-time / tenure yet
    if (
      L.minOnTime != null &&
      onTime != null &&
      onTime < L.minOnTime
    ) {
      return false
    }
    if (months > 0 && months < L.minMonths) return false
    if (disputes > 0) return false
    return true
  }

  // Highest first
  for (const L of [...TRUST_LEVELS].reverse()) {
    if (meets(L)) return L.id
  }
  return "none"
}
