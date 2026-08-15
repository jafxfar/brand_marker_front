import { cn } from "@/lib/utils"

type SegmentedOption<T extends string> = {
  value: T
  label: string
  count?: number
}

type SegmentedControlProps<T extends string> = {
  value: T
  options: SegmentedOption<T>[]
  onChange: (value: T) => void
  ariaLabel?: string
  className?: string
}

export const SegmentedControl = <T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) => {
  const handleSelect = (nextValue: T) => {
    onChange(nextValue)
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    nextValue: T,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onChange(nextValue)
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex w-fit max-w-full flex-wrap items-center gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-[color,background-color,transform] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
            onClick={() => handleSelect(option.value)}
            onKeyDown={(event) => handleKeyDown(event, option.value)}
          >
            {option.label}
            {option.count !== undefined ? (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                  isActive ? "bg-card/20" : "bg-muted",
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
