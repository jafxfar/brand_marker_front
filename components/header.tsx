"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search, ChevronDown, Globe, Bell, User, Menu, X,
  Phone, ShieldCheck, Star, Briefcase, ShoppingBag,
  MessageSquare, ChevronRight,
} from "lucide-react"

const categories = [
  "ИТ и разработка",
  "Маркетинг и реклама",
  "Юридические услуги",
  "Финансы и бухгалтерия",
  "Логистика",
  "Консалтинг",
  "Дизайн",
  "Кадры и HR",
  "Строительство",
  "Образование",
]

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

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const tabs = [
    { label: "Услуги", active: true },
    { label: "Исполнители", active: false },
    { label: "По всему миру", active: false },
  ]

  return (
    <header className="w-full sticky top-0 z-50 shadow-sm">
      {/* Top utility bar */}
      <div style={{ backgroundColor: "oklch(0.22 0.055 255)" }} className="text-white text-xs">
        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between h-9">
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:text-orange-300 transition-colors">Проверенные исполнители</Link>
            <Link href="#" className="hover:text-orange-300 transition-colors">Условия размещения</Link>
            <Link href="#" className="hover:text-orange-300 transition-colors flex items-center gap-1">
              <Phone size={11} /> 8 800 555-35-35
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <button className="flex items-center gap-1.5 hover:text-orange-300 transition-colors">
              <Globe size={12} />
              <span>Русский · ₽</span>
              <ChevronDown size={10} />
            </button>
            <Link href="#" className="hover:text-orange-300 transition-colors font-medium">Стать исполнителем</Link>
            <Link href="#" className="hover:text-orange-300 transition-colors">Помощь</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 flex items-center gap-6 h-[68px]">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 mr-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Briefcase size={16} className="text-white" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-black text-primary tracking-tight">Бизнес</span>
              <span className="text-xl font-black tracking-tight" style={{ color: "oklch(0.22 0.055 255)" }}>Маркет</span>
            </div>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-[680px] relative">
            <div className="flex items-center border-2 border-primary rounded-xl overflow-hidden shadow-sm">
              <button className="flex items-center gap-1.5 px-4 bg-secondary text-sm text-foreground border-r border-border whitespace-nowrap hover:bg-accent transition-colors h-11 font-medium">
                <span className="hidden md:block text-secondary-foreground">Все категории</span>
                <ChevronDown size={14} className="text-secondary-foreground" />
              </button>
              <input
                type="text"
                placeholder="Поиск B2B услуг, исполнителей, компаний..."
                className="flex-1 px-4 py-2.5 text-sm outline-none bg-white h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              />
              <button className="bg-primary hover:bg-[oklch(0.58_0.22_38)] text-white px-5 h-11 transition-colors flex items-center gap-2 font-semibold text-sm">
                <Search size={16} />
                <span className="hidden md:block">Найти</span>
              </button>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-border shadow-xl z-50 rounded-xl overflow-hidden">
                <div className="px-4 pt-3 pb-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Популярные запросы</p>
                </div>
                {searchSuggestions.map((s) => (
                  <button
                    key={s}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary flex items-center gap-3 transition-colors"
                    onMouseDown={() => setSearchQuery(s)}
                  >
                    <Search size={13} className="text-muted-foreground flex-shrink-0" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
            <button className="hidden lg:flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-foreground hover:bg-secondary hover:text-primary transition-all group">
              <Bell size={20} className="group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Уведомления</span>
            </button>
            <button className="hidden lg:flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-foreground hover:bg-secondary hover:text-primary transition-all group relative">
              <MessageSquare size={20} className="group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Сообщения</span>
              <span className="absolute top-1.5 right-2.5 w-4 h-4 bg-primary rounded-full text-[9px] text-white flex items-center justify-center font-bold">3</span>
            </button>
            <button className="hidden lg:flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-foreground hover:bg-secondary hover:text-primary transition-all group">
              <ShoppingBag size={20} className="group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Запросы</span>
            </button>
            <div className="h-8 w-px bg-border hidden lg:block mx-1" />
            <Link
              href="#"
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
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Открыть меню"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Category nav bar */}
      <div className="bg-white border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-center">
            <button className="flex items-center gap-2 py-3 pr-5 border-r border-border text-sm font-semibold hover:text-primary transition-colors whitespace-nowrap">
              <Menu size={15} />
              Все категории
            </button>
            <div className="flex items-center overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.label}
                  className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    tab.active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="hidden xl:flex items-center gap-1 ml-auto">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-2.5 hover:text-primary cursor-pointer transition-colors rounded-lg hover:bg-secondary">
                <ShieldCheck size={13} className="text-primary" />
                <span>Гарантия качества</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-2.5 hover:text-primary cursor-pointer transition-colors rounded-lg hover:bg-secondary">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span>ТОП исполнители</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-border shadow-xl">
          <div className="p-5 space-y-1">
            <Link href="#" className="flex items-center gap-3 py-3 px-3 rounded-xl text-sm hover:bg-secondary hover:text-primary transition-colors">
              <User size={17} /> Войти / Регистрация
            </Link>
            <Link href="#" className="flex items-center gap-3 py-3 px-3 rounded-xl text-sm hover:bg-secondary hover:text-primary transition-colors">
              <Bell size={17} /> Уведомления
            </Link>
            <Link href="#" className="flex items-center gap-3 py-3 px-3 rounded-xl text-sm hover:bg-secondary hover:text-primary transition-colors">
              <ShoppingBag size={17} /> Мои запросы
            </Link>
            <div className="border-t border-border pt-3 mt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-2">Категории услуг</p>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href="#"
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm hover:bg-secondary hover:text-primary transition-colors"
                >
                  <span>{cat}</span>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
