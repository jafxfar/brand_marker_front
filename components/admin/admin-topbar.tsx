"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, LogOut, Menu, Shield, User } from "lucide-react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useHydrated } from "@/hooks/use-hydrated"
import { getStaffRoleLabel } from "@/lib/admin-permissions"
import { useAuthStore } from "@/lib/store/auth-store"

export default function AdminTopbar() {
  const router = useRouter()
  const hydrated = useHydrated()
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = async () => {
    await logout()
    router.push("/admin/login")
  }

  const displayName = hydrated && user ? user.name : "Администратор"
  const roleLabel = getStaffRoleLabel(user?.staffRoleName ?? user?.platformRole ?? "admin")

  return (
    <header className="sticky top-0 z-30 h-[68px] border-b border-line bg-white/95 backdrop-blur">
      <div className="flex h-full items-center gap-4 px-4 lg:px-8">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="-ml-2 rounded-lg p-2 transition-colors hover:bg-canvas lg:hidden"
            aria-label="Открыть меню администратора"
          >
            <Menu size={22} />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 max-w-[88vw] p-4">
          <SheetTitle className="sr-only">Навигация администратора</SheetTitle>
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-ink">Управление платформой</p>
        <p className="hidden text-xs text-mute sm:block">
          Контроль операций и состояния маркетплейса
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="ml-auto flex h-10 items-center gap-2.5 rounded-[10px] py-1.5 pl-1 pr-2 transition-colors hover:bg-canvas"
            aria-label="Открыть меню профиля"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-xs font-bold text-white">
              {hydrated && user ? user.name.charAt(0).toUpperCase() : <Shield size={15} />}
            </div>
            <div className="hidden flex-col text-left leading-tight sm:flex">
              <span className="max-w-35 truncate text-[14.5px] font-semibold text-ink">
                {displayName}
              </span>
              <span className="text-[10px] text-mute">{roleLabel}</span>
            </div>
            <ChevronDown size={14} className="hidden text-mute sm:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-semibold">{displayName}</span>
              <span className="text-xs font-normal text-mute">
                {hydrated && user ? user.email : ""}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <User size={15} />
            {roleLabel}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut size={15} />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </header>
  )
}
