import type { SessionUser } from "@/lib/store/auth-store"

export const getUserDisplayName = (user: SessionUser | null): string => {
  if (!user) return "Гость"
  return user.company?.trim() || user.name
}

export const getUserInitials = (user: SessionUser | null): string => {
  if (!user) return "?"
  const source = (user.name || user.company || "").trim()
  if (!source) return "?"
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

export const getActorId = (user: SessionUser | null): number =>
  user?.actorId ?? 0
