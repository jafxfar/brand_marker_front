import Link from "next/link"
import { ArrowRight } from "lucide-react"

export const LandingCta = () => (
  <section
    className="border-b border-border bg-foreground text-white"
    aria-labelledby="final-cta-heading"
  >
    <div className="max-w-[1440px] mx-auto px-6 py-16 sm:py-20 text-center">
      <h2
        id="final-cta-heading"
        className="text-2xl sm:text-3xl font-black tracking-tight"
      >
        Выгодный бизнес для всех
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-sm sm:text-base text-white/70">
        С БрендМаркет это удобно — присоединяйтесь и начните первую сделку уже
        сегодня.
      </p>
      <Link
        href="/register"
        className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring outline-none"
      >
        Попробовать бесплатно
        <ArrowRight size={16} aria-hidden />
      </Link>
    </div>
  </section>
)
