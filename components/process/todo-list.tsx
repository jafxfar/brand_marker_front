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
        item.hot ? "border-brand-300 bg-brand-50/40" : "border-border bg-card",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          item.hot ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
        aria-hidden="true"
      >
        <Icon size={20} />
      </span>
      <div className="min-w-[200px] flex-1">
        <p className="text-[15.5px] font-bold text-foreground">{item.title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{item.text}</p>
      </div>
      <Link
        href={item.href}
        className={cn(
          "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          item.hot
            ? "bg-primary text-primary-foreground hover:bg-brand-600"
            : "border border-border bg-card text-foreground hover:border-primary hover:text-brand-700",
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
  title = "Что сделать сейчас",
}: TodoListProps) => (
  <section className="grid gap-3" aria-label={title}>
    <h2 className="text-lg font-bold">{title}</h2>
    {loading ? (
      <div className="h-20 animate-pulse rounded-2xl bg-muted" />
    ) : items.length === 0 ? (
      <div className="flex items-center gap-4 rounded-2xl border border-dashed border-border bg-card p-4">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"
          aria-hidden="true"
        >
          <Check size={20} />
        </span>
        <div>
          <p className="font-bold">Всё сделано</p>
          <p className="text-sm text-muted-foreground">{emptyText}</p>
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
