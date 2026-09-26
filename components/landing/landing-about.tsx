import Link from "next/link"
import { CheckCircle2, FileCheck, Shield, Users } from "lucide-react"

const POINTS = [
  {
    Icon: Shield,
    title: "Проверенные участники",
    text: "Исполнители с компаниями и каталогом — меньше риска для заказчика.",
  },
  {
    Icon: FileCheck,
    title: "Контракты на площадке",
    text: "Заявки, предложения и договор в одном кабинете, без лишней переписки.",
  },
  {
    Icon: Users,
    title: "Прямое общение",
    text: "Сообщения по сделке и статусы этапов — прозрачно для обеих сторон.",
  },
  {
    Icon: CheckCircle2,
    title: "Безопасная оплата",
    text: "Эскроу до приёмки: деньги уходят исполнителю после подтверждения результата.",
  },
]

export const LandingAbout = () => (
  <section
    id="about"
    className="scroll-mt-28 border-b border-border"
    aria-labelledby="about-heading"
  >
    <div className="max-w-[1440px] mx-auto px-6 py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
        <div>
          <h2
            id="about-heading"
            className="text-2xl sm:text-3xl font-black text-foreground"
          >
            О нас
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            БрендМаркет — B2B-площадка для закупок товаров и услуг в
            Таджикистане. Мы соединяем заказчиков с проверенными исполнителями и
            сопровождаем сделку от первого запроса до оплаты.
          </p>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Присоединяйтесь как исполнитель: получайте прямые заявки, общайтесь с
            покупателями и заключайте договоры онлайн.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring outline-none"
          >
            Стать исполнителем
          </Link>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {POINTS.map((point) => (
            <li key={point.title} className="rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <point.Icon size={18} aria-hidden />
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground">{point.title}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {point.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
)
