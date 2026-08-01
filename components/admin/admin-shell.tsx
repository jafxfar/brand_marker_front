"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminTopbar from "@/components/admin/admin-topbar"
import { useHydrated } from "@/hooks/use-hydrated"
import { useAuthStore } from "@/lib/store/auth-store"

const adminRoles = new Set(["admin", "superadmin", "moderator"])

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const hydrated = useHydrated()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const isAllowed =
    isAuthenticated &&
    user?.role === "admin" &&
    adminRoles.has(user.platformRole)

  useEffect(() => {
    if (hydrated && !isAllowed) {
      router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [hydrated, isAllowed, pathname, router])

  if (!hydrated || !isAllowed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} aria-label="Проверка доступа" />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-68 shrink-0 border-r border-border lg:block">
        <AdminSidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
