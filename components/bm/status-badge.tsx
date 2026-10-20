import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-canvas text-mute border-line",
  quotes: "bg-brand-50 text-brand-700 border-brand-200",
  sent: "bg-brand-50 text-brand-700 border-brand-200",
  deal: "bg-verify-50 text-verify-600 border-transparent",
  won: "bg-safe-50 text-safe-700 border-safe-100",
  closed: "bg-canvas text-mute border-line",
  expired: "bg-amber-50 text-amber-800 border-amber-200",
  wait: "bg-amber-50 text-amber-800 border-amber-200",
  held: "bg-verify-50 text-verify-600 border-transparent",
  released: "bg-safe-50 text-safe-700 border-safe-100",
  paid: "bg-safe-50 text-safe-700 border-safe-100",
  approved: "bg-safe-50 text-safe-700 border-safe-100",
  auto: "bg-canvas text-mute border-line",
  open: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  active: "bg-safe-50 text-safe-700 border-safe-100",
  invited: "bg-verify-50 text-verify-600 border-transparent",
  signed: "bg-safe-50 text-safe-700 border-safe-100",
  hold: "bg-amber-50 text-amber-800 border-amber-200",
  withdrawn: "bg-canvas text-mute border-line",
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  quotes: "Сбор КП",
  sent: "Отправлено",
  deal: "Сделка",
  won: "Выиграно",
  closed: "Закрыта",
  expired: "Срок истёк",
  wait: "Ожидает",
  held: "На гарантии",
  released: "Выплачено",
  paid: "Оплачено",
  approved: "Согласовано",
  auto: "Авто",
  open: "Открыт",
  pending: "На проверке",
  active: "Активен",
  invited: "Приглашён",
  signed: "Подписан",
  hold: "Задержка",
  withdrawn: "Отозвано",
}

type StatusBadgeProps = {
  status: string
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const key = status.toLowerCase()
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[12px] font-semibold whitespace-nowrap",
        STATUS_STYLES[key] ?? "bg-canvas text-mute border-line",
        className,
      )}
    >
      {label ?? STATUS_LABELS[key] ?? status}
    </span>
  )
}
