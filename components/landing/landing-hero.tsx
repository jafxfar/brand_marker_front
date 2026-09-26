import Link from "next/link"
import { ArrowRight } from "lucide-react"

export const LandingHero = () => (
  <section
    className="relative overflow-hidden border-b border-border"
    aria-label="Главный баннер"
  >
    <div
      className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.92_0.06_150)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,oklch(0.94_0.04_160)_0%,transparent_50%),var(--background)]"
      aria-hidden
    />
    <div
      className="absolute inset-0 opacity-[0.35] bg-[linear-gradient(to_right,oklch(0.9_0.01_240)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.9_0.01_240)_1px,transparent_1px)] bg-[size:48px_48px]"
      aria-hidden
    />

    <div className="relative max-w-[1440px] mx-auto px-6 py-20 sm:py-28 lg:py-32">
      <p className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-2 duration-700">
        <span className="text-primary">Бренд</span>Маркет
      </p>
      <h1 className="mt-4 max-w-2xl text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
        Новый взгляд на ведение B2B-бизнеса
      </h1>
      <p className="mt-4 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        Найдите товар или услугу по одному запросу — сравните предложения,
        заключите контракт и оплатите безопасно на площадке.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
        <Link
          href="/register"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring outline-none"
        >
          Попробовать бесплатно
          <ArrowRight size={16} aria-hidden />
        </Link>
        <a
          href="#how-it-works"
          className="inline-flex h-12 items-center rounded-xl border border-border bg-card px-6 text-sm font-bold text-foreground hover:bg-secondary transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none"
        >
          Как это работает?
        </a>
      </div>
    </div>
  </section>
)
