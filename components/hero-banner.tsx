"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft, ChevronRight, CheckCircle2, Users, Layers,
  ThumbsUp, TrendingUp, Monitor, Megaphone, Scale, BarChart2,
  Truck, HardHat, Palette, UserCheck, LineChart, Lock, Globe2,
  BookOpen, ChevronRight as ChevronRightIcon, ShieldCheck,
  Star, FileText,
} from "lucide-react"

const slides = [
  {
    id: 1,
    image: "/images/hero-banner-1.jpg",
    badge: "Топ-1 платформа",
    title: "Найдите лучших\nB2B исполнителей",
    subtitle: "Более 50 000 проверенных компаний и специалистов по всей России",
    cta: "Найти исполнителя",
    ctaSecondary: "Разместить заказ",
    bg: "oklch(0.22 0.055 255)",
    bgTo: "oklch(0.3 0.08 255)",
  },
  {
    id: 2,
    image: "/images/hero-banner-2.jpg",
    badge: "ИТ-услуги",
    title: "Разработка\nи цифровизация",
    subtitle: "Сайты, приложения, 1С, CRM — всё для вашего бизнеса под ключ",
    cta: "Смотреть ИТ услуги",
    ctaSecondary: "Стать партнёром",
    bg: "oklch(0.19 0.05 225)",
    bgTo: "oklch(0.27 0.07 240)",
  },
  {
    id: 3,
    image: "/images/hero-banner-3.jpg",
    badge: "Логистика",
    title: "Логистика\nи цепочки поставок",
    subtitle: "Грузоперевозки, таможня, склад — надёжная логистика по всей стране",
    cta: "Заказать перевозку",
    ctaSecondary: "Рассчитать стоимость",
    bg: "oklch(0.54 0.22 38)",
    bgTo: "oklch(0.66 0.22 43)",
  },
]

const stats = [
  { value: "50 000+", label: "Исполнителей", Icon: Users },
  { value: "120+", label: "Категорий услуг", Icon: Layers },
  { value: "98%", label: "Довольных клиентов", Icon: ThumbsUp },
  { value: "15 млрд  TJS", label: "Сделок в месяц", Icon: TrendingUp },
]

const sidebarItems = [
  { Icon: Monitor, label: "ИТ и разработка" },
  { Icon: Megaphone, label: "Маркетинг и реклама" },
  { Icon: Scale, label: "Юридические услуги" },
  { Icon: BarChart2, label: "Финансы и аудит" },
  { Icon: Truck, label: "Логистика и склад" },
  { Icon: HardHat, label: "Строительство" },
  { Icon: Palette, label: "Дизайн и брендинг" },
  { Icon: UserCheck, label: "Кадры и HR" },
  { Icon: LineChart, label: "Консалтинг" },
  { Icon: Lock, label: "Безопасность" },
  { Icon: Globe2, label: "ВЭД и экспорт" },
  { Icon: BookOpen, label: "Обучение и тренинги" },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goTo = (index: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrent(index)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const next = () => goTo((current + 1) % slides.length)
  const prev = () => goTo((current - 1 + slides.length) % slides.length)

  useEffect(() => {
    timerRef.current = setInterval(next, 5500)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [current])

  const slide = slides[current]

  return (
    <section className="bg-background">
      <div className="max-w-[1440px] mx-auto px-6 py-5">
        <div className="flex gap-4">
          {/* Left sidebar */}
          <aside className="hidden lg:block w-[210px] flex-shrink-0">
            <nav className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm h-full">
              {sidebarItems.map(({ Icon, label }, i) => (
                <Link
                  key={i}
                  href="#"
                  className="flex items-center gap-2.5 px-3.5 py-[9px] text-xs font-medium hover:bg-secondary hover:text-primary border-b border-border/60 last:border-0 transition-colors group"
                >
                  <Icon size={14} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  <span className="text-foreground group-hover:text-primary transition-colors leading-tight">{label}</span>
                  <ChevronRightIcon size={12} className="ml-auto text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main banner */}
          <div className="flex-1 relative rounded-2xl overflow-hidden min-h-[330px] group shadow-lg">
            <div
              className="absolute inset-0 transition-all duration-700"
              style={{ background: `linear-gradient(135deg, ${slide.bg} 0%, ${slide.bgTo} 100%)` }}
            />
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover mix-blend-overlay opacity-30 transition-opacity duration-500"
              priority
            />
            <div className="relative z-10 p-8 flex flex-col justify-center h-full min-h-[330px]">
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full w-fit mb-4">
                <CheckCircle2 size={12} />
                {slide.badge}
              </span>
              <h1 className="text-white text-[2.1rem] font-black leading-[1.15] mb-3 whitespace-pre-line">
                {slide.title}
              </h1>
              <p className="text-white/75 text-sm mb-6 max-w-xs leading-relaxed">
                {slide.subtitle}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="#"
                  className="bg-primary hover:bg-[oklch(0.58_0.22_38)] text-white font-bold px-6 py-2.5 rounded-xl transition-all text-sm shadow-md hover:shadow-lg hover:-translate-y-px"
                >
                  {slide.cta}
                </Link>
                <Link
                  href="#"
                  className="bg-white/15 hover:bg-white/25 text-white font-medium px-6 py-2.5 rounded-xl transition-all text-sm border border-white/25 hover:-translate-y-px"
                >
                  {slide.ctaSecondary}
                </Link>
              </div>
            </div>

            {/* Arrows */}
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/25 hover:bg-black/45 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-sm"
              aria-label="Предыдущий слайд"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/25 hover:bg-black/45 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-sm"
              aria-label="Следующий слайд"
            >
              <ChevronRight size={18} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${i === current ? "w-7 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/45 hover:bg-white/70"}`}
                  aria-label={`Слайд ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right promo blocks */}
          <div className="hidden xl:flex flex-col gap-3 w-[210px] flex-shrink-0">
            <PromoCard
              bg="bg-[oklch(0.97_0.04_60)]"
              border="border-primary/20"
              accentClass="text-primary"
              title="Гарантия сделки"
              subtitle="Оплата после выполнения работы"
              Icon={ShieldCheck}
              iconClass="text-primary"
              cta="Подробнее"
            />
            <PromoCard
              bg="bg-[oklch(0.96_0.008_255)]"
              border="border-[oklch(0.22_0.055_255)]/15"
              accentClass="text-[oklch(0.22_0.055_255)]"
              title="Верифицированные"
              subtitle="Проверенные юрлица и ИП"
              Icon={CheckCircle2}
              iconClass="text-[oklch(0.22_0.055_255)]"
              cta="Смотреть"
            />
            <PromoCard
              bg="bg-[oklch(0.96_0.06_155)]"
              border="border-green-200"
              accentClass="text-green-700"
              title="Разместите заказ"
              subtitle="10+ предложений за 24 часа"
              Icon={FileText}
              iconClass="text-green-600"
              cta="Разместить"
            />
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-4 bg-white border border-border rounded-2xl py-4 px-8 flex items-center justify-around flex-wrap gap-4 shadow-sm">
          {stats.map(({ value, label, Icon }, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="text-center flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-lg font-black text-foreground leading-none">{value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                </div>
              </div>
              {i < stats.length - 1 && <div className="hidden md:block h-9 w-px bg-border ml-3" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PromoCard({
  bg, border, accentClass, title, subtitle, Icon, iconClass, cta,
}: {
  bg: string; border: string; accentClass: string; title: string
  subtitle: string; Icon: React.ElementType; iconClass: string; cta: string
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex flex-col gap-2.5 border ${border} hover:shadow-md transition-all cursor-pointer flex-1`}>
      <div className={`w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center border ${border}`}>
        <Icon size={17} className={iconClass} />
      </div>
      <div>
        <div className={`text-sm font-bold ${accentClass} leading-tight`}>{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{subtitle}</div>
      </div>
      <Link href="#" className={`text-xs font-semibold ${accentClass} hover:underline flex items-center gap-1`}>
        {cta} <ChevronRightIcon size={11} />
      </Link>
    </div>
  )
}
