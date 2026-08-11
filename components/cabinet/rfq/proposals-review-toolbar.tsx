"use client"

import { cn } from "@/lib/utils"
import type { ProposalStatus } from "@/types"

export type ProposalSortMode = "priority" | "price_asc" | "price_desc" | "date_desc"

type ProposalsReviewToolbarProps = {
  total: number
  sortMode: ProposalSortMode
  statusFilter: ProposalStatus | "all"
  onSortChange: (mode: ProposalSortMode) => void
  onStatusFilterChange: (status: ProposalStatus | "all") => void
}

const sortOptions: { value: ProposalSortMode; label: string }[] = [
  { value: "priority", label: "Приоритет" },
  { value: "price_asc", label: "Цена ↑" },
  { value: "price_desc", label: "Цена ↓" },
  { value: "date_desc", label: "Новые" },
]

const statusFilters: { value: ProposalStatus | "all"; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "submitted", label: "Новые" },
  { value: "shortlisted", label: "Избранное" },
  { value: "accepted", label: "Принятые" },
  { value: "rejected", label: "Отклонённые" },
]

export const ProposalsReviewToolbar = ({
  total,
  sortMode,
  statusFilter,
  onSortChange,
  onStatusFilterChange,
}: ProposalsReviewToolbarProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <p className="text-sm text-muted-foreground">
      <span className="font-semibold text-foreground">{total}</span> предложений
    </p>
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1.5">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onStatusFilterChange(f.value)}
            className={cn(
              "h-8 px-3 rounded-lg text-xs font-semibold transition-colors",
              statusFilter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <select
        value={sortMode}
        onChange={(e) => onSortChange(e.target.value as ProposalSortMode)}
        className="h-8 px-3 rounded-lg border border-border bg-card text-xs font-semibold outline-none focus:border-primary"
        aria-label="Сортировка предложений"
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  </div>
)
