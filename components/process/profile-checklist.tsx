import Link from "next/link"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type ChecklistItem = {
  id: string
  label: string
  done: boolean
  href?: string
  cta?: string
}

type ProfileChecklistProps = {
  items: ChecklistItem[]
  title?: string
  description?: string
}

export const ProfileChecklist = ({
  items,
  title = "Подготовьте профиль",
  description = "Заказчики чаще выбирают исполнителей с полным профилем",
}: ProfileChecklistProps) => {
  const total = items.length
  const done = items.filter((i) => i.done).length
  if (total === 0 || done === total) return null
  const percent = Math.round((done / total) * 100)

  return (
    <section className="grid gap-4 rounded-2xl border border-border bg-card p-5" aria-label={title}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <b className="text-brand-700">
          {done} из {total}
        </b>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Готовность профиля"
      >
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              "flex items-center gap-3 rounded-xl p-3",
              item.done ? "bg-muted" : "bg-amber-50",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                item.done ? "bg-primary text-primary-foreground" : "border-2 border-amber-400",
              )}
              aria-hidden="true"
            >
              {item.done ? <Check size={14} /> : null}
            </span>
            <span className={cn("flex-1 text-sm", item.done ? "text-muted-foreground" : "font-semibold")}>
              {item.label}
              <span className="sr-only">{item.done ? " — готово" : " — не сделано"}</span>
            </span>
            {!item.done && item.href ? (
              <Link href={item.href} className="text-sm font-semibold text-brand-700 hover:underline">
                {item.cta ?? "Добавить"} →
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
