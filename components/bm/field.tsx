import { cn } from "@/lib/utils"

/** Class string matching HTML `inputCls()` from BrendMarket-v7.1. */
export function bmInputClassName(error?: boolean, className?: string) {
  return cn("bm-input", error && "bm-input-error", className)
}

type BmInputProps = React.ComponentProps<"input"> & {
  error?: boolean
}

export function BmInput({ error, className, ...props }: BmInputProps) {
  return (
    <input
      className={bmInputClassName(error, className)}
      aria-invalid={error || undefined}
      {...props}
    />
  )
}

type BmTextareaProps = React.ComponentProps<"textarea"> & {
  error?: boolean
}

export function BmTextarea({ error, className, ...props }: BmTextareaProps) {
  return (
    <textarea
      className={bmInputClassName(
        error,
        cn("h-auto min-h-[104px] py-3", className),
      )}
      aria-invalid={error || undefined}
      {...props}
    />
  )
}
