import type { SessionUser } from "@/lib/store/auth-store"

export const getUserDisplayName = (user: SessionUser | null): string => {
  if (!user) return "Гость"
  return user.company?.trim() || user.name
}

export const getUserInitials = (user: SessionUser | null): string => {
  if (!user) return "?"
  const source = user.company?.trim() || user.name
  return source.charAt(0).toUpperCase()
}

export const getActorId = (user: SessionUser | null): number =>
  user?.actorId ?? 0
