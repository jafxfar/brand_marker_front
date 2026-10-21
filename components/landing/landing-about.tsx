import Link from "next/link"
import {
  Monitor, FileText, BrickWall, Box, CupSoda, Shirt, Code2, Truck, Printer, Sparkles,
} from "lucide-react"
import { servicesUrl } from "@/lib/marketplace-routes"

const CATEGORIES = [
  { name: "Компьютеры и оргтехника", Icon: Monitor, count: 24 },
  { name: "Офис и канцелярия", Icon: FileText, count: 18 },
  { name: "Стройматериалы", Icon: BrickWall, count: 31 },
  { name: "Упаковка и тара", Icon: Box, count: 12 },
  { name: "Продукты для HoReCa", Icon: CupSoda, count: 9 },
  { name: "Спецодежда и СИЗ", Icon: Shirt, count: 15 },
  { name: "ИТ‑услуги", Icon: Code2, count: 22 },
  { name: "Логистика", Icon: Truck, count: 11 },
  { name: "Реклама и печать", Icon: Printer, count: 8 },
  { name: "Клининг", Icon: Sparkles, count: 7 },
]

export const LandingAbout = () => (
  <section id="about" className="mx-auto mt-16 max-w-[1200px] px-4 lg:px-8">
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="text-[28px] font-extrabold tracking-[-0.02em] text-ink">Категории</h2>
      <Link href="/services" className="text-[15px] font-semibold text-brand-700 hover:underline">
        Весь каталог
      </Link>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CATEGORIES.map(({ name, Icon, count }) => (
        <Link
          key={name}
          href={servicesUrl({ q: name })}
          className="grid gap-4 rounded-2xl border border-line bg-white p-4 text-left transition hover:border-[#C9CED6] hover:shadow-[0_8px_24px_rgba(16,24,40,.06)]"
        >
          <span className="grid size-11 place-items-center rounded-xl bg-canvas text-ink">
            <Icon className="size-6" aria-hidden />
          </span>
          <span>
            <b className="block text-[15px] leading-snug">{name}</b>
            <span className="text-[13px] text-mute">{count} предложений</span>
          </span>
        </Link>
      ))}
    </div>
  </section>
)
