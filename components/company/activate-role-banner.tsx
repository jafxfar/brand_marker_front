"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"
import { isApiEnabled } from "@/lib/api/config"

type ActivateRoleBannerProps = {
  targetSide: "buyer" | "supplier"
  redirectTo: string
  label: string
}

export const ActivateRoleBanner = ({
  targetSide,
  redirectTo,
  label,
}: ActivateRoleBannerProps) => {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const activateRole = useAuthStore((s) => s.activateRole)

  if (!user || !isApiEnabled()) return null

  const hasCapability =
    targetSide === "buyer" ? user.capabilities.buyer : user.capabilities.supplier

  if (hasCapability) return null

  const handleActivate = async () => {
    await activateRole(targetSide)
    router.push(redirectTo)
  }

  return (
    <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <p className="text-sm text-foreground">{label}</p>
      <button
        type="button"
        onClick={handleActivate}
        className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
      >
        Активировать
      </button>
    </div>
  )
}
