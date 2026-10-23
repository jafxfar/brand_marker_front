import Link from "next/link"
import {
  AlertTriangle,
  BadgeCheck,
  Briefcase,
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
  approval: BadgeCheck,
}

type TodoListProps = {
  items: TodoItem[]
  loading?: boolean
  emptyText?: string
  title?: string
  /** Template v5: single bordered list instead of separate cards. */
  compact?: boolean
}

const TodoRow = ({
  item,
  compact,
}: {
  item: TodoItem
  compact?: boolean
}) => {
  const Icon = ICONS[item.icon]
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 sm:flex-nowrap",
        compact
          ? cn(
              "border-b border-line px-4 py-3.5 last:border-0",
              item.hot && "bg-brand-50/50",
            )
          : cn(
              "rounded-2xl border p-4",
              item.hot
                ? "border-brand-200 bg-brand-50/50"
                : "border-line bg-white",
            ),
      )}
    >
      <span
        className={cn(
          "grid shrink-0 place-items-center",
          compact ? "size-9 rounded" : "size-11 rounded-xl",
          item.hot ? "bg-brand-500 text-white" : "bg-canvas text-brand-500",
        )}
        aria-hidden="true"
      >
        <Icon size={compact ? 18 : 20} />
      </span>
      <div className="min-w-[200px] flex-1">
        <b className={cn("block", compact ? "text-[14.5px]" : "text-[15.5px]")}>
          {item.title}
        </b>
        <span className={cn("text-mute", compact ? "text-[13px]" : "text-[14px]")}>
          {item.text}
        </span>
      </div>
      <Link
        href={item.href}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-[10px] px-3.5 text-[14px] font-semibold transition-colors",
          compact ? "h-9" : "h-11 px-4 text-[15px]",
          item.hot
            ? "bg-brand-600 text-white hover:bg-brand-700"
            : "border border-line bg-white text-ink hover:bg-canvas",
        )}
      >
        {item.cta}
      </Link>
    </div>
  )
}

export const TodoList = ({
  items,
  loading = false,
  emptyText = "Всё сделано.",
  title = "Требует вашего действия",
  compact = true,
}: TodoListProps) => (
  <section className="grid gap-2" aria-label={title}>
    <span className="text-[13px] font-semibold text-mute">{title}</span>
    {loading ? (
      <div className="mt-0 h-20 animate-pulse rounded-xl border border-line bg-white" />
    ) : items.length === 0 ? (
      <div className="rounded-xl border border-line bg-white p-6 text-mute">
        {emptyText}
      </div>
    ) : compact ? (
      <div className="overflow-hidden rounded-xl border border-line bg-white">
        {items.map((item) => (
          <TodoRow key={item.id} item={item} compact />
        ))}
      </div>
    ) : (
      <ul className="grid gap-3">
        {items.map((item) => (
          <li key={item.id}>
            <TodoRow item={item} />
          </li>
        ))}
      </ul>
    )}
  </section>
)
