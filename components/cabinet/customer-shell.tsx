"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import CustomerSidebar from "@/components/cabinet/sidebar"
import CustomerTopbar from "@/components/cabinet/topbar"
import { useAuthStore } from "@/lib/store/auth-store"
import { useNotificationsSocket } from "@/hooks/use-notifications-socket"
import { useHydrated } from "@/hooks/use-hydrated"

export default function CustomerShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const hydrated = useHydrated()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  const allowed = isAuthenticated && user?.role === "customer"

  useNotificationsSocket("buyer", hydrated && allowed)

  useEffect(() => {
    if (hydrated && !allowed) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [hydrated, allowed, router, pathname])

  if (!hydrated || !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:block w-[260px] flex-shrink-0 border-r border-border h-screen sticky top-0">
        <CustomerSidebar />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <CustomerTopbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
