"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  User, Menu, X, LogOut, ShoppingBag, LayoutGrid,
} from "lucide-react"
import { MarketplaceSearch } from "@/components/marketplace/marketplace-search"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BrandLogo } from "@/components/bm"
import { Button } from "@/components/ui/button"
import { useAuthStore, type SessionRole } from "@/lib/store/auth-store"
import { getUserDisplayName, getUserInitials } from "@/lib/auth-display"
import { useHydrated } from "@/hooks/use-hydrated"
import { createRfqHref } from "@/lib/create-rfq-href"
import {
  forSuppliersUrl,
  guaranteeUrl,
  performersUrl,
  registerUrl,
} from "@/lib/marketplace-routes"
import { cn } from "@/lib/utils"

const getCabinetBase = (role: SessionRole): string => {
  if (role === "supplier") return "/supplier"
  if (role === "admin") return "/admin"
  return "/customer"
}

const getProfileHref = (role: SessionRole): string => {
  if (role === "admin") return "/admin"
  return `${getCabinetBase(role)}/profile`
}

const NAV = [
  {
    label: "Каталог",
    href: "/services",
    match: (p: string) => p.startsWith("/services") || p.startsWith("/categories"),
  },
  {
    label: "Поставщики",
    href: performersUrl(),
    match: (p: string) => p.startsWith("/performers"),
  },
  {
    label: "Как это работает",
    href: guaranteeUrl(),
    match: (p: string) => p.startsWith("/guarantee"),
  },
  {
    label: "Продавцам",
    href: forSuppliersUrl(),
    match: (p: string) => p.startsWith("/for-suppliers"),
  },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const authedUser = hydrated && user ? user : null
  const profileHref = authedUser ? getProfileHref(authedUser.role) : "/login"
  const rfqsHref = authedUser
    ? `${getCabinetBase(authedUser.role)}/rfqs`
    : "/login"
  const rfqHref = createRfqHref()
  const displayName = authedUser ? getUserDisplayName(authedUser) : ""
  const initials = authedUser ? getUserInitials(authedUser) : ""

  const handleLogout = () => {
    void logout()
    setMobileMenuOpen(false)
    router.push("/")
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-30 w-full border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-2 px-4 sm:gap-3 lg:h-[68px] lg:gap-6 lg:px-8">
        <span className="shrink-0 sm:hidden">
          <BrandLogo small showWordmark={false} />
        </span>
        <span className="hidden shrink-0 sm:inline">
          <BrandLogo />
        </span>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Разделы"
        >
          {NAV.map((item) => {
            const on = item.match(pathname)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "inline-flex h-9 items-center whitespace-nowrap rounded-lg px-3 text-[15px] font-semibold transition",
                  on
                    ? "bg-canvas text-ink"
                    : "text-ink/70 hover:bg-canvas hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <span className="min-w-2 flex-1" aria-hidden="true" />

        <div className="relative hidden w-[280px] shrink-0 xl:block">
          <MarketplaceSearch
            variant="compact"
            className="w-full"
            onNavigate={closeMobileMenu}
          />
        </div>

        {authedUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Кабинет"
                className="flex h-10 shrink-0 items-center gap-2 rounded-[10px] pl-1 pr-3 transition hover:bg-canvas"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-ink text-[12px] font-bold text-white">
                  {initials}
                </span>
                <span className="hidden text-[14.5px] font-semibold sm:block">
                  Кабинет
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold">{displayName}</span>
                  <span className="text-xs font-normal text-mute">
                    {authedUser.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={getCabinetBase(authedUser.role)} className="cursor-pointer">
                  <LayoutGrid size={15} /> Обзор
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={profileHref} className="cursor-pointer">
                  <User size={15} /> Профиль
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={rfqsHref} className="cursor-pointer">
                  <ShoppingBag size={15} /> Заявки
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut size={15} /> Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/login"
            className="hidden h-10 shrink-0 items-center rounded-[10px] px-3 text-[15px] font-semibold text-ink transition hover:bg-canvas sm:inline-flex"
          >
            Войти
          </Link>
        )}

        <Button asChild className="h-10 shrink-0 px-4">
          <Link href={rfqHref}>
            <span className="hidden sm:inline">Разместить заявку</span>
            <span className="sm:hidden">Заявка</span>
          </Link>
        </Button>

        <button
          type="button"
          className="grid size-10 shrink-0 place-items-center rounded-[10px] hover:bg-canvas lg:hidden"
          aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-line bg-white lg:hidden">
          <div className="mx-auto grid max-w-[1200px] gap-1 px-4 py-3">
            {!authedUser ? (
              <>
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="flex h-11 items-center rounded-lg px-3 text-[16px] font-semibold hover:bg-canvas"
                >
                  Войти
                </Link>
                <Link
                  href={registerUrl()}
                  onClick={closeMobileMenu}
                  className="flex h-11 items-center rounded-lg px-3 text-[16px] font-semibold hover:bg-canvas"
                >
                  Регистрация
                </Link>
              </>
            ) : (
              <Link
                href={getCabinetBase(authedUser.role)}
                onClick={closeMobileMenu}
                className="flex h-11 items-center rounded-lg px-3 text-[16px] font-semibold hover:bg-canvas"
              >
                Кабинет
              </Link>
            )}
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  "flex h-11 items-center rounded-lg px-3 text-[16px] font-semibold hover:bg-canvas",
                  item.match(pathname) && "bg-canvas",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2">
              <MarketplaceSearch
                variant="compact"
                className="w-full"
                onNavigate={closeMobileMenu}
              />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
