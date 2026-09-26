import Link from "next/link"
import { Check } from "lucide-react"

const BENEFITS = [
  "Без комиссий со сделок",
  "Без абонентской платы",
  "Без лимита на заявки и отклики",
]

export const LandingPricing = () => (
  <section
    id="pricing"
    className="scroll-mt-28 border-b border-border"
    aria-labelledby="pricing-heading"
  >
    <div className="max-w-[1440px] mx-auto px-6 py-16 sm:py-20">
      <h2
        id="pricing-heading"
        className="text-2xl sm:text-3xl font-black text-foreground"
      >
        Всё бесплатно — для заказчиков и исполнителей
      </h2>
      <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground">
        Никакой абонентской платы и комиссий со сделок: пользуйтесь площадкой
        без ограничений по количеству.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            Для заказчиков
          </p>
          <h3 className="mt-2 text-xl font-black text-foreground">
            Абсолютно бесплатно
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Безлимитное количество запросов на товары и услуги.
          </p>
          <ul className="mt-6 space-y-3">
            {BENEFITS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                <Check size={16} className="shrink-0 text-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="mt-8 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring outline-none"
          >
            Создать заявку
          </Link>
        </div>

        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            Для исполнителей
          </p>
          <h3 className="mt-2 text-xl font-black text-foreground">
            Абсолютно бесплатно
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Безлимитное количество откликов на заявки заказчиков.
          </p>
          <ul className="mt-6 space-y-3">
            {BENEFITS.map((item) => (
              <li key={`s-${item}`} className="flex items-center gap-2 text-sm text-foreground">
                <Check size={16} className="shrink-0 text-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="mt-8 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring outline-none"
          >
            Начать продавать
          </Link>
        </div>
      </div>
    </div>
  </section>
)
