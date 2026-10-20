"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Search, LogOut, User, ChevronDown, Store, ShoppingCart } from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BrandLogo } from "@/components/bm"
import CustomerSidebar from "@/components/cabinet/sidebar"
import { useAuthStore } from "@/lib/store/auth-store"
import { useUnreadNotificationsCount } from "@/hooks/use-notifications"
import { useHydrated } from "@/hooks/use-hydrated"
import { getUserDisplayName, getUserInitials } from "@/lib/auth-display"

export default function CustomerTopbar({
  moreOpen,
  onMoreOpenChange,
}: {
  moreOpen?: boolean
  onMoreOpenChange?: (open: boolean) => void
}) {
  const router = useRouter()
  const hydrated = useHydrated()
  const [internalOpen, setInternalOpen] = useState(false)
  const mobileOpen = moreOpen ?? internalOpen
  const setMobileOpen = onMoreOpenChange ?? setInternalOpen
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const switchSessionRole = useAuthStore((s) => s.switchSessionRole)
  const unread = useUnreadNotificationsCount("buyer")
  const displayName = hydrated && user ? getUserDisplayName(user) : "Гость"
  const initials = hydrated && user ? getUserInitials(user) : ""

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <>
      <header className="sticky top-0 z-30 h-[68px] border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-4 lg:gap-6 lg:px-8">
          <BrandLogo small showWordmark className="shrink-0" />
          <span className="hidden h-7 items-center rounded-md bg-canvas px-2.5 text-[13px] font-semibold text-mute md:inline-flex">
            Кабинет покупателя
          </span>
          <label className="relative ml-0 hidden max-w-md flex-1 sm:block lg:ml-6">
            <span className="sr-only">Поиск</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-mute" />
            <input
              type="text"
              placeholder="Поиск по заявкам и сделкам"
              className="h-10 w-full rounded-[10px] border border-transparent bg-canvas pl-10 pr-3 text-[14.5px] outline-none focus:border-brand-600 focus:bg-white"
            />
          </label>
          <span className="flex-1" />
          <Link
            href="/services"
            className="hidden h-10 items-center gap-2 rounded-[10px] px-3 text-[14.5px] font-semibold hover:bg-canvas xl:inline-flex"
          >
            <ShoppingCart className="size-[18px]" />
            Каталог
          </Link>
          <Link
            href="/customer/notifications"
            className="relative grid size-10 place-items-center rounded-[10px] hover:bg-canvas"
            aria-label="Уведомления"
          >
            <Bell className="size-5" />
            {hydrated && unread > 0 ? (
              <span className="absolute top-2 right-2.5 size-2 rounded-full bg-red-500 ring-2 ring-white" />
            ) : null}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-10 items-center gap-2.5 rounded-[10px] pl-1 pr-2 hover:bg-canvas"
                aria-label="Аккаунт"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-ink text-[12px] font-bold text-white">
                  {initials || <User size={15} />}
                </span>
                <span className="hidden text-[14.5px] font-semibold md:block">
                  {displayName.split(" ")[0]}
                </span>
                <ChevronDown className="hidden size-4 text-mute md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold">{displayName}</span>
                  <span className="text-xs font-normal text-mute">
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
              {hydrated && user?.role === "customer" ? (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    void (async () => {
                      await switchSessionRole("supplier")
                      router.push("/supplier")
                    })()
                  }}
                >
                  <Store size={15} /> Перейти к продажам
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut size={15} /> Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-80 max-w-[88vw] p-4">
          <SheetTitle className="sr-only">Навигация</SheetTitle>
          <CustomerSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
