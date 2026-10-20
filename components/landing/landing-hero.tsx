"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Lock, Search, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { servicesUrl } from "@/lib/marketplace-routes"

const QUICK = ["Бумага А4", "Цемент", "Ноутбуки", "Спецодежда", "Грузоперевозки"]

const TIMELINE = [
  { title: "Договор подписан", date: "15 сентября", state: 1 as const },
  { title: "Оплачено — деньги в банке‑партнёре", date: "16 сентября", state: 1 as const },
  { title: "Товар отгружен, накладная приложена", date: "25 сентября", state: 1 as const },
  { title: "Проверьте и примите заказ", date: "сейчас", state: 2 as const },
  { title: "Поставщик получит оплату", date: "после приёмки", state: 0 as const },
]

export const LandingHero = () => {
  const router = useRouter()
  const [q, setQ] = useState("")

  const submit = (value = q) => {
    router.push(servicesUrl({ q: value.trim() || undefined }))
  }

  return (
    <section className="border-b border-line bg-white" aria-label="Главный баннер">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-12 lg:grid-cols-[1.15fr_1fr] lg:px-8 lg:py-20">
        <div className="grid content-start gap-6">
          <span className="inline-flex h-8 items-center gap-2 justify-self-start rounded-full bg-brand-50 px-3 text-[13.5px] font-semibold text-brand-700">
            <ShieldCheck className="size-4" aria-hidden />
            Каждая сделка под защитой банка‑партнёра
          </span>
          <h1 className="text-[38px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[52px] [text-wrap:balance]">
            Закупки для бизнеса — просто и&nbsp;безопасно
          </h1>
          <p className="max-w-xl text-[18px] leading-relaxed text-mute">
            Найдите проверенного поставщика, сравните цены и платите только после того, как получили товар.
          </p>
          <div className="flex max-w-xl flex-col gap-2 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Что нужно купить</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-mute" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Что нужно купить? Например: цемент М500"
                className="h-14 w-full rounded-xl border border-line bg-white pl-12 pr-3.5 text-[16px] outline-none transition hover:border-[#C9CED6] focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10"
              />
            </label>
            <Button type="button" className="h-14 rounded-xl px-8 text-[16px]" onClick={() => submit()}>
              Найти
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[14px]">
            <span className="mr-1 text-mute">Часто ищут:</span>
            {QUICK.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => submit(item)}
                className="h-8 rounded-lg bg-canvas px-3 font-medium hover:bg-surface-muted"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute -inset-4 rounded-[28px] bg-[radial-gradient(60%_60%_at_70%_30%,#DDF1E7_0%,transparent_70%)]"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-[0_24px_60px_-20px_rgba(16,24,40,.25)]">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <span className="text-[12.5px] text-mute">Сделка БМ‑2041</span>
                <b className="block truncate text-[15px]">Ноутбуки Lenovo, 20 шт</b>
              </div>
              <b className="shrink-0 text-[16px] tnum">167 000 TJS</b>
            </div>
            <ol className="grid gap-0 px-5 py-4">
              {TIMELINE.map((item, i) => (
                <li
                  key={item.title}
                  className={`relative grid grid-cols-[28px_1fr] gap-3 ${i < TIMELINE.length - 1 ? "pb-4" : ""}`}
                >
                  {i < TIMELINE.length - 1 ? (
                    <span
                      className={`absolute top-7 bottom-0 left-[13px] w-0.5 ${item.state === 1 ? "bg-brand-600" : "bg-line"}`}
                      aria-hidden
                    />
                  ) : null}
                  <span
                    className={`relative z-10 grid size-7 place-items-center rounded-full ${
                      item.state === 1
                        ? "bg-brand-600 text-white"
                        : item.state === 2
                          ? "border-2 border-brand-600 bg-white text-brand-700"
                          : "bg-canvas text-mute"
                    }`}
                  >
                    {item.state === 1 ? (
                      <Check className="size-3.5" />
                    ) : item.state === 2 ? (
                      <span className="size-2 rounded-full bg-brand-600" />
                    ) : null}
                  </span>
                  <div className="pt-0.5">
                    <b className={`text-[14.5px] ${item.state === 0 ? "font-semibold text-mute" : ""}`}>
                      {item.title}
                    </b>
                    <span className="block text-[12.5px] text-mute">{item.date}</span>
                    {item.state === 2 ? (
                      <span className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-brand-600 px-4 text-[14px] font-semibold text-white">
                        <Check className="size-4" />
                        Принять заказ
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex items-center gap-2 bg-canvas px-5 py-3 text-[13px] text-mute">
              <Lock className="size-4 text-brand-600" />
              Деньги в банке, пока вы не нажмёте «Принять»
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
