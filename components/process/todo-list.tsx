import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Check,
  Clock,
  FileText,
  Inbox,
  MessageSquare,
  Send,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { TodoIcon, TodoItem } from "@/lib/process/todo"

const ICONS: Record<TodoIcon, LucideIcon> = {
  deal: Briefcase,
  proposal: Send,
  draft: FileText,
  rfq: Inbox,
  clock: Clock,
  message: MessageSquare,
  dispute: AlertTriangle,
}

type TodoListProps = {
  items: TodoItem[]
  loading?: boolean
  emptyText?: string
  title?: string
}

const TodoRow = ({ item }: { item: TodoItem }) => {
  const Icon = ICONS[item.icon]
  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-2xl border p-4 sm:flex-nowrap",
        item.hot
          ? "border-brand-200 bg-brand-50/50"
          : "border-line bg-white",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          item.hot ? "bg-brand-600 text-white" : "bg-canvas text-mute",
        )}
        aria-hidden="true"
      >
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15.5px] font-bold text-ink">{item.title}</p>
        <p className="mt-0.5 text-[14px] text-mute">{item.text}</p>
      </div>
      <Link
        href={item.href}
        className={cn(
          "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] px-4 text-[15px] font-semibold transition-colors",
          item.hot
            ? "bg-brand-600 text-white hover:bg-brand-700"
            : "border border-line bg-white text-ink hover:border-ink/40 hover:bg-canvas",
        )}
      >
        {item.cta}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </li>
  )
}

export const TodoList = ({
  items,
  loading = false,
  emptyText = "Новых дел нет.",
  title = "Требует вашего действия",
}: TodoListProps) => (
  <section className="grid gap-3" aria-label={title}>
    <h2 className="text-[20px] font-extrabold tracking-[-0.02em] text-ink">{title}</h2>
    {loading ? (
      <div className="h-20 animate-pulse rounded-2xl bg-canvas" />
    ) : items.length === 0 ? (
      <div className="flex items-center gap-4 rounded-2xl border border-dashed border-[#D5DAE1] bg-white p-4">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"
          aria-hidden="true"
        >
          <Check size={20} />
        </span>
        <div>
          <p className="font-bold text-ink">Всё сделано</p>
          <p className="text-[14px] text-mute">{emptyText}</p>
        </div>
      </div>
    ) : (
      <ul className="grid gap-3">
        {items.map((item) => (
          <TodoRow key={item.id} item={item} />
        ))}
      </ul>
    )}
  </section>
)
