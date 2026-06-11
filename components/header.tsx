"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Search, ChevronDown, Globe, Bell, User, Menu, X,
  Phone, ShieldCheck, Star, Briefcase, ShoppingBag,
  MessageSquare,
} from "lucide-react"
import { CategoryMegaMenu } from "@/components/marketplace/category-mega-menu"
import { MobileCategoryAccordion } from "@/components/marketplace/mobile-category-accordion"
import {
  guaranteeUrl,
  helpUrl,
  loginRedirect,
  performersUrl,
  servicesUrl,
} from "@/lib/marketplace-routes"

const searchSuggestions = [
  "Разработка сайтов",
  "SEO продвижение",
  "Бухгалтерские услуги",
  "Юридические консультации",
  "Перевозка грузов",
  "1С внедрение",
  "Аудит",
  "Подбор персонала",
]

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
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSearch = (query?: string) => {
    const value = (query ?? searchQuery).trim()
    if (!value) {
      router.push(servicesUrl())
      return
    }
    router.push(servicesUrl({ q: value }))
    setShowSuggestions(false)
    setMobileMenuOpen(false)
  }

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleSearch()
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="w-full sticky top-0 z-50 shadow-sm">
      <div style={{ backgroundColor: "oklch(0.22 0.055 255)" }} className="text-white text-xs">
        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between h-9">
          <div className="flex items-center gap-5">
            <Link href={performersUrl({ verified: true })} className="hover:text-primary transition-colors">
              Проверенные исполнители
            </Link>
            <Link href={helpUrl()} className="hover:text-primary transition-colors">
              Условия размещения
            </Link>
            <Link href="tel:88005553535" className="hover:text-primary transition-colors flex items-center gap-1">
              <Phone size={11} /> 8 800 555-35-35
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
              <span className="text-xl font-black tracking-tight" style={{ color: "oklch(0.22 0.055 255)" }}>Маркет</span>
            </div>
          </Link>

          <div className="flex-1 max-w-[680px] relative">
            <div className="flex items-center border-2 border-primary rounded-xl overflow-hidden shadow-sm">
              <CategoryMegaMenu variant="search" />
              <input
                type="text"
                placeholder="Поиск B2B услуг, исполнителей, компаний..."
                className="flex-1 px-4 py-2.5 text-sm outline-none bg-white h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={handleSearchKeyDown}
                aria-label="Поиск услуг"
              />
              <button
                type="button"
                onClick={() => handleSearch()}
                className="bg-primary hover:bg-primary-dark text-primary-foreground px-5 h-11 transition-colors flex items-center gap-2 font-semibold text-sm"
              >
                <Search size={16} />
                <span className="hidden md:block">Найти</span>
              </button>
            </div>

            {showSuggestions && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-border shadow-xl z-50 rounded-xl overflow-hidden">
                <div className="px-4 pt-3 pb-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Популярные запросы</p>
                </div>
                {searchSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary flex items-center gap-3 transition-colors"
                    onMouseDown={() => {
                      setSearchQuery(s)
                      handleSearch(s)
                    }}
                  >
                    <Search size={13} className="text-muted-foreground flex-shrink-0" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
            <Link
              href={loginRedirect("/customer/notifications")}
              className="hidden lg:flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-foreground hover:bg-secondary hover:text-primary transition-all group"
            >
              <Bell size={20} className="group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Уведомления</span>
            </Link>
            <Link
              href={loginRedirect("/customer/messages")}
              className="hidden lg:flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-foreground hover:bg-secondary hover:text-primary transition-all group relative"
            >
              <MessageSquare size={20} className="group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Сообщения</span>
              <span className="absolute top-1.5 right-2.5 w-4 h-4 bg-primary rounded-full text-[9px] text-primary-foreground flex items-center justify-center font-bold">3</span>
            </Link>
            <Link
              href={loginRedirect("/customer/rfqs")}
              className="hidden lg:flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-foreground hover:bg-secondary hover:text-primary transition-all group"
            >
              <ShoppingBag size={20} className="group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Запросы</span>
            </Link>
            <div className="h-8 w-px bg-border hidden lg:block mx-1" />
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
            <Link
              href="/login"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 py-3 px-3 rounded-xl text-sm hover:bg-secondary hover:text-primary transition-colors"
            >
              <User size={17} /> Войти / Регистрация
            </Link>
            <Link
              href={loginRedirect("/customer/notifications")}
              onClick={closeMobileMenu}
              className="flex items-center gap-3 py-3 px-3 rounded-xl text-sm hover:bg-secondary hover:text-primary transition-colors"
            >
              <Bell size={17} /> Уведомления
            </Link>
            <Link
              href={loginRedirect("/customer/rfqs")}
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
