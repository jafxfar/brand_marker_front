"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"
import type { MarketplaceSessionRole } from "@/lib/store/auth-store"
import { useHydrated } from "@/hooks/use-hydrated"

type GateStatus = "loading" | "allowed" | "denied"

/**
 * Waits for auth hydration, then either accepts an in-memory session
 * for the expected role or restores it from API tokens.
 * Prevents stale localStorage sessions from kicking the user out.
 */
export const useCabinetGate = (expectedRole: MarketplaceSessionRole): GateStatus => {
  const router = useRouter()
  const pathname = usePathname()
  const hydrated = useHydrated()
  const isReady = useAuthStore((s) => s.isReady)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const userRole = useAuthStore((s) => s.user?.role)
  const [status, setStatus] = useState<GateStatus>("loading")

  useEffect(() => {
    if (!hydrated || !isReady) return

    let cancelled = false

    const ensureAccess = async () => {
      const state = useAuthStore.getState()
      if (state.isAuthenticated && state.user?.role === expectedRole) {
        if (!cancelled) setStatus("allowed")
        return
      }

      const restored = await state.restoreSession(expectedRole)
      if (cancelled) return

      if (restored) {
        setStatus("allowed")
        return
      }

      setStatus("denied")
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }

    void ensureAccess()

    return () => {
      cancelled = true
    }
  }, [hydrated, isReady, isAuthenticated, userRole, expectedRole, router, pathname])

  return status
}
