import Link from "next/link"
import {
  FileText,
  Lock,
  FileCheck,
  Building2,
  Package,
  Inbox,
} from "lucide-react"
import { PageShell } from "@/components/marketplace/page-shell"
import { TrustLevelsGrid } from "@/components/bm"
import { Button } from "@/components/ui/button"
import { PUBLIC_TIERS, formatTierPrice } from "@/lib/public-tiers"
import { loginRedirect, registerUrl } from "@/lib/marketplace-routes"
import { cn } from "@/lib/utils"

const BENEFITS = [
  {
    Icon: Inbox,
    title: "Заявки покупателей",
    text: "Отвечайте ценой прямо из кабинета.",
  },
  {
    Icon: Lock,
    title: "Оплата гарантирована",
    text: "Отгружайте только после того, как деньги в банке.",
  },
  {
    Icon: FileCheck,
    title: "Документы сами",
    text: "Договор, счёт, накладная и акт формируются в сделке.",
  },
] as const

const HOW_TO = [
  ["1", "Выберите тариф", "В кабинете продавца → «Подписка»."],
  [
    "2",
    "Оплатите",
    "Картой — тариф включится сразу. По счёту — после поступления денег.",
  ],
  [
    "3",
    "Значок и функции включатся",
    "Значок появится на товарах, комиссия снизится со следующей сделки.",
  ],
] as const

export default function ForSuppliersPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-10 lg:px-8">
        <section className="max-w-[960px]">
          <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-balance text-ink">
            Продавайте компаниям по всему Таджикистану
          </h1>
          <p className="mt-4 max-w-2xl text-[18px] text-mute">
            Покупатель оплачивает заказ до отгрузки — вы видите, что деньги есть, и
            отгружаете без риска.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild className="h-12 px-6 text-[16px]">
              <Link href={registerUrl()}>Зарегистрировать компанию</Link>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <Link href={loginRedirect("/supplier")}>Открыть кабинет продавца</Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {BENEFITS.map(({ Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)]"
              >
                <span className="mb-4 grid size-11 place-items-center rounded-xl bg-canvas text-ink">
                  <Icon className="size-5" aria-hidden />
                </span>
                <b className="text-[17px] text-ink">{title}</b>
                <p className="mt-1 text-[15px] text-mute">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="tariffs" className="scroll-mt-28 pt-14">
          <div className="mb-8 grid justify-items-center gap-5 text-center">
            <span className="grid h-8 place-items-center rounded-full bg-brand-50 px-3 text-[13px] font-bold text-brand-700">
              Тарифы для поставщиков
            </span>
            <h2 className="max-w-3xl text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em] text-balance text-ink md:text-[44px]">
              Больше заявок, ниже комиссия, выше в поиске
            </h2>
            <p className="max-w-2xl text-[17px] text-mute">
              Подписка Pro, VIP или Premium даёт продвижение и инструменты. Щит доверия
              купить нельзя: площадка выдаёт его автоматически за успешные сделки и
              высокий рейтинг.
            </p>
          </div>

          <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PUBLIC_TIERS.map((tier) => (
              <article
                key={tier.id}
                className={cn(
                  "relative grid gap-4 rounded-2xl border bg-white p-5",
                  tier.popular
                    ? "border-brand-500 shadow-[0_12px_32px_rgba(16,24,40,.12)]"
                    : "border-line",
                )}
              >
                {tier.popular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-0.5 text-[12px] font-bold text-white">
                    Популярный
                  </span>
                ) : null}
                <div
                  className="grid size-12 place-items-center rounded-xl text-[15px] font-extrabold"
                  style={{
                    background: `linear-gradient(135deg, ${tier.colors[0]}, ${tier.colors[1]})`,
                    color: tier.fg,
                  }}
                >
                  {tier.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="text-[20px] text-ink">{tier.name}</b>
                    <span className="rounded-md bg-canvas px-2 py-0.5 text-[12px] font-semibold text-mute">
                      {tier.tag}
                    </span>
                  </div>
                  <p className="mt-2 text-[15px]">
                    <b className="tnum text-[22px] font-extrabold text-ink">
                      {formatTierPrice(tier.price)}
                    </b>
                    <span className="text-mute"> /мес</span>
                  </p>
                  <p className="mt-1 text-[14px] text-mute">
                    Комиссия {tier.fee}%
                  </p>
                </div>
                <ul className="grid gap-2 text-[14px] text-ink/85">
                  <li className="flex gap-2">
                    <Package className="mt-0.5 size-4 shrink-0 text-brand-600" />
                    Товаров: {tier.products == null ? "безлимит" : tier.products}
                  </li>
                  <li className="flex gap-2">
                    <FileText className="mt-0.5 size-4 shrink-0 text-brand-600" />
                    Заявок / мес: {tier.leads == null ? "безлимит" : tier.leads}
                  </li>
                  <li className="flex gap-2">
                    <Building2 className="mt-0.5 size-4 shrink-0 text-brand-600" />
                    Сотрудников: {tier.staff == null ? "безлимит" : tier.staff}
                  </li>
                  <li className="text-mute">Поиск: {tier.search}</li>
                </ul>
                <Button asChild variant={tier.popular ? "default" : "outline"} className="mt-auto">
                  <Link href={loginRedirect("/supplier/subscription")}>
                    {tier.price === 0 ? "Начать бесплатно" : "Выбрать"}
                  </Link>
                </Button>
              </article>
            ))}
          </div>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-line bg-canvas/60">
                  <th className="px-4 py-3 font-semibold text-mute">Параметр</th>
                  {PUBLIC_TIERS.map((t) => (
                    <th key={t.id} className="px-4 py-3 font-bold text-ink">
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(
                  [
                    ["Цена / мес", ...PUBLIC_TIERS.map((t) => formatTierPrice(t.price))],
                    ["Комиссия", ...PUBLIC_TIERS.map((t) => `${t.fee}%`)],
                    [
                      "Товары",
                      ...PUBLIC_TIERS.map((t) =>
                        t.products == null ? "∞" : String(t.products),
                      ),
                    ],
                    [
                      "Заявки",
                      ...PUBLIC_TIERS.map((t) =>
                        t.leads == null ? "∞" : String(t.leads),
                      ),
                    ],
                    ["Поиск", ...PUBLIC_TIERS.map((t) => t.search)],
                  ] as const
                ).map(([label, ...cells]) => (
                  <tr key={label}>
                    <td className="px-4 py-3 text-mute">{label}</td>
                    {cells.map((cell, i) => (
                      <td key={i} className="px-4 py-3 font-medium text-ink">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14 grid gap-6 rounded-3xl border border-line bg-white p-6 lg:grid-cols-2 lg:items-end lg:p-8">
          <div className="grid gap-3">
            <span className="text-[13px] font-bold uppercase tracking-wider text-brand-700">
              Не продаётся
            </span>
            <h2 className="text-[28px] font-extrabold tracking-[-0.02em] text-ink">
              Щит доверия: серебро, золото, алмаз
            </h2>
            <p className="text-[15.5px] text-ink/80">
              Подписка даёт продвижение, а щит — заслуженное доверие. Площадка выдаёт его
              автоматически даже на бесплатном тарифе и повышает уровень за успешные
              сделки, высокий рейтинг и поставки в срок.
            </p>
          </div>
          <TrustLevelsGrid className="lg:justify-self-stretch" />
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-3">
          {HOW_TO.map(([n, title, text]) => (
            <div
              key={n}
              className="rounded-2xl border border-line bg-white p-5"
            >
              <span className="grid size-8 place-items-center rounded-full bg-ink text-[14px] font-bold text-white">
                {n}
              </span>
              <b className="mt-3 block text-[16px] text-ink">{title}</b>
              <p className="mt-1 text-[14px] text-mute">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </PageShell>
  )
}
