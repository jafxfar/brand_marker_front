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
import { useAuthStore } from "@/lib/store/auth-store"

const roleLabels: Record<string, string> = {
  admin: "Администратор",
  superadmin: "Суперадминистратор",
  moderator: "Модератор",
}

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
  const roleLabel = roleLabels[user?.platformRole ?? "admin"] ?? "Администратор"

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-4 border-b border-border bg-card px-4 sm:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="-ml-2 rounded-lg p-2 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
            aria-label="Открыть меню администратора"
          >
            <Menu size={22} />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72.5 p-0">
          <SheetTitle className="sr-only">Навигация администратора</SheetTitle>
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-foreground">Управление платформой</p>
        <p className="hidden text-xs text-muted-foreground sm:block">
          Контроль операций и состояния маркетплейса
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="ml-auto flex items-center gap-2.5 rounded-lg py-1.5 pl-1.5 pr-2 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Открыть меню профиля"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {hydrated && user ? user.name.charAt(0).toUpperCase() : <Shield size={15} />}
            </div>
            <div className="hidden flex-col text-left leading-tight sm:flex">
              <span className="max-w-35 truncate text-xs font-semibold text-foreground">
                {displayName}
              </span>
              <span className="text-[10px] text-muted-foreground">{roleLabel}</span>
            </div>
            <ChevronDown size={14} className="hidden text-muted-foreground sm:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-semibold">{displayName}</span>
              <span className="text-xs font-normal text-muted-foreground">
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
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut size={15} />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
