"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, Bell, Search, LogOut, User, ChevronDown } from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CustomerSidebar from "@/components/cabinet/sidebar"
import { CompanySwitcher } from "@/components/company/company-switcher"
import { useAuthStore } from "@/lib/store/auth-store"
import { useUnreadNotificationsCount } from "@/hooks/use-notifications"
import { useHydrated } from "@/hooks/use-hydrated"

export default function CustomerTopbar() {
  const router = useRouter()
  const hydrated = useHydrated()
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const unread = useUnreadNotificationsCount("buyer")

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-4 border-b border-border bg-card px-4 sm:px-6">
      {/* Mobile nav trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Открыть меню"
          >
            <Menu size={22} />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SheetTitle className="sr-only">Навигация</SheetTitle>
          <CustomerSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск по заказам и поставщикам..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <CompanySwitcher actorType="buyer" basePath="/customer/company" />

        {/* Notifications */}
        <Link
          href="/customer/notifications"
          className="relative p-2.5 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Уведомления"
        >
          <Bell size={20} className="text-foreground" />
          {hydrated && unread > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </Link>

        {/* Profile menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-lg hover:bg-secondary transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                {hydrated && user ? user.name.charAt(0).toUpperCase() : <User size={15} />}
              </div>
              <div className="hidden sm:flex flex-col leading-tight text-left">
                <span className="text-xs font-semibold text-foreground max-w-[120px] truncate">
                  {hydrated && user ? user.name : "Гость"}
                </span>
                <span className="text-[10px] text-muted-foreground">Заказчик</span>
              </div>
              <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold">{hydrated && user ? user.name : "Гость"}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {hydrated && user ? user.email : ""}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/customer/profile" className="cursor-pointer">
                <User size={15} /> Профиль
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut size={15} /> Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
