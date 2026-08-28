"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  ChevronDown, Globe, Bell, User, Menu, X,
  Phone, ShieldCheck, Star, Briefcase, ShoppingBag,
  MessageSquare, LogOut,
} from "lucide-react"
import { CategoryMegaMenu } from "@/components/marketplace/category-mega-menu"
import { MarketplaceSearch } from "@/components/marketplace/marketplace-search"
import { MobileCategoryAccordion } from "@/components/marketplace/mobile-category-accordion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore, type SessionRole } from "@/lib/store/auth-store"
import { getUserDisplayName, getUserInitials } from "@/lib/auth-display"
import { useHydrated } from "@/hooks/use-hydrated"
import {
  guaranteeUrl,
  helpUrl,
  loginRedirect,
  performersUrl,
} from "@/lib/marketplace-routes"

const getCabinetBase = (role: SessionRole): string => {
  if (role === "supplier") return "/supplier"
  if (role === "admin") return "/admin"
  return "/customer"
}

const getProfileHref = (role: SessionRole): string => {
  if (role === "admin") return "/admin"
  return `${getCabinetBase(role)}/profile`
}

const getCabinetHref = (
  role: SessionRole | null,
  path: "notifications" | "messages" | "rfqs",
): string => {
  if (!role) return loginRedirect(`/customer/${path}`)
  if (role === "admin") return "/admin"
  return `${getCabinetBase(role)}/${path}`
}

const getNavTabs = (pathname: string, scope: string | null) => [
  {
    label: "Услуги",
    href: "/services",
    isActive: pathname === "/" || pathname.startsWith("/services") || pathname.startsWith("/categories"),
  },
  {
    label: "Исполнители",
    href: "/performers",
    isActive: pathname.startsWith("/performers") && scope !== "worldwide",
  },
  {
    label: "По всему миру",
    href: performersUrl({ scope: "worldwide" }),
    isActive: pathname.startsWith("/performers") && scope === "worldwide",
  },
]

export default function Header() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const navTabs = getNavTabs(pathname, searchParams.get("scope"))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const authedUser = hydrated && user ? user : null
  const profileHref = authedUser ? getProfileHref(authedUser.role) : "/login"
  const notificationsHref = getCabinetHref(authedUser?.role ?? null, "notifications")
  const messagesHref = getCabinetHref(authedUser?.role ?? null, "messages")
  const rfqsHref = getCabinetHref(authedUser?.role ?? null, "rfqs")
  const displayName = authedUser ? getUserDisplayName(authedUser) : ""
  const initials = authedUser ? getUserInitials(authedUser) : ""

  const handleLogout = () => {
    void logout()
    setMobileMenuOpen(false)
    router.push("/")
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="w-full sticky top-0 z-50 shadow-sm">
      <div className="bg-foreground text-white text-xs">
        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between h-9">
          <div className="flex items-center gap-5">
            <Link href={performersUrl({ verified: true })} className="hover:text-primary transition-colors">
              Проверенные исполнители
            </Link>
            <Link href={helpUrl()} className="hover:text-primary transition-colors">
              Условия размещения
            </Link>
            <Link href="tel:88005553535" className="hover:text-primary transition-colors flex items-center gap-1">
              <Phone size={11} /> +992 92 882 9955
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <button type="button" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Globe size={12} />
              <span>Русский · TJS</span>
              <ChevronDown size={10} />
            </button>
            <Link href="/login" className="hover:text-primary transition-colors font-medium">Стать исполнителем</Link>
            <Link href={helpUrl()} className="hover:text-primary transition-colors">Помощь</Link>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 flex items-center gap-6 h-[68px]">
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 mr-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Briefcase size={16} className="text-primary-foreground" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-black text-primary tracking-tight">Бренд</span>
              <span className="text-xl font-black tracking-tight text-foreground">Маркет</span>
            </div>
          </Link>

          <MarketplaceSearch
            className="flex-1 max-w-[680px]"
            onNavigate={closeMobileMenu}
          />

          <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
            <Link
              href={notificationsHref}
              className="hidden lg:flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-foreground hover:bg-secondary hover:text-primary transition-all group"
            >
              <Bell size={20} className="group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Уведомления</span>
            </Link>
            <Link
              href={messagesHref}
              className="hidden lg:flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-foreground hover:bg-secondary hover:text-primary transition-all group relative"
            >
              <MessageSquare size={20} className="group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Сообщения</span>
              <span className="absolute top-1.5 right-2.5 w-4 h-4 bg-primary rounded-full text-[9px] text-primary-foreground flex items-center justify-center font-bold">3</span>
            </Link>
            <Link
              href={rfqsHref}
              className="hidden lg:flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-foreground hover:bg-secondary hover:text-primary transition-all group"
            >
              <ShoppingBag size={20} className="group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Запросы</span>
            </Link>
            <div className="h-8 w-px bg-border hidden lg:block mx-1" />
            {authedUser ? (
              <div className="hidden lg:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Профиль"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex flex-col leading-tight text-left">
                      <span className="text-[11px] text-muted-foreground">Профиль</span>
                      <span className="text-xs font-semibold text-foreground max-w-[140px] truncate group-hover:text-primary transition-colors">
                        {displayName}
                      </span>
                    </div>
                    <ChevronDown size={14} className="text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{displayName}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {authedUser.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={profileHref} className="cursor-pointer">
                      <User size={15} /> Профиль
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut size={15} /> Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden lg:flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-secondary border-2 border-border flex items-center justify-center group-hover:border-primary transition-colors">
                  <User size={15} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] text-muted-foreground">Войти /</span>
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Регистрация</span>
                </div>
              </Link>
            )}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Открыть меню"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-center">
            <CategoryMegaMenu variant="nav" />
            <div className="flex items-center overflow-x-auto">
              {navTabs.map((tab) => (
                  <Link
                    key={tab.label}
                    href={tab.href}
                    className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                      tab.isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    {tab.label}
                  </Link>
              ))}
            </div>
            <div className="hidden xl:flex items-center gap-1 ml-auto">
              <Link
                href={guaranteeUrl()}
                className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-2.5 hover:text-primary transition-colors rounded-lg hover:bg-secondary"
              >
                <ShieldCheck size={13} className="text-primary" />
                <span>Гарантия качества</span>
              </Link>
              <Link
                href={performersUrl({ featured: true })}
                className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-2.5 hover:text-primary transition-colors rounded-lg hover:bg-secondary"
              >
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span>ТОП исполнители</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-border shadow-xl">
          <div className="p-5 space-y-1">
            {authedUser ? (
              <>
                <Link
                  href={profileHref}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 py-3 px-3 rounded-xl text-sm hover:bg-secondary hover:text-primary transition-colors"
                >
                  <span className="w-8 h-8 shrink-0 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold truncate">{displayName}</span>
                    <span className="block text-xs text-muted-foreground truncate">{authedUser.email}</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 py-3 px-3 rounded-xl text-sm text-destructive hover:bg-secondary transition-colors"
                  aria-label="Выйти"
                >
                  <LogOut size={17} /> Выйти
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 py-3 px-3 rounded-xl text-sm hover:bg-secondary hover:text-primary transition-colors"
              >
                <User size={17} /> Войти / Регистрация
              </Link>
            )}
            <Link
              href={notificationsHref}
              onClick={closeMobileMenu}
              className="flex items-center gap-3 py-3 px-3 rounded-xl text-sm hover:bg-secondary hover:text-primary transition-colors"
            >
              <Bell size={17} /> Уведомления
            </Link>
            <Link
              href={rfqsHref}
              onClick={closeMobileMenu}
              className="flex items-center gap-3 py-3 px-3 rounded-xl text-sm hover:bg-secondary hover:text-primary transition-colors"
            >
              <ShoppingBag size={17} /> Мои запросы
            </Link>
            <div className="border-t border-border pt-3 mt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-2">Категории услуг</p>
              <MobileCategoryAccordion onNavigate={closeMobileMenu} />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
