import { cn } from "@/lib/utils"

const SHIELD_PATH =
  "M60 6 104 19v38c0 29-19 47-44 57C35 104 16 86 16 57V19z"

type HeroCardProps = React.ComponentProps<"section"> & {
  /** Hide decorative shield watermark */
  plain?: boolean
}

/** Bank-style dashboard hero from BrendMarket-v7.1 (`heroCard`). */
export function HeroCard({
  className,
  children,
  plain = false,
  ...props
}: HeroCardProps) {
  return (
    <section
      className={cn(
        "bank-hero relative overflow-hidden rounded-[20px] p-6 text-white md:p-7",
        className,
      )}
      {...props}
    >
      {!plain ? (
        <svg
          className="pointer-events-none absolute -right-10 -bottom-16 h-72 w-72 opacity-[.07]"
          viewBox="0 0 120 120"
          aria-hidden
        >
          <path d={SHIELD_PATH} fill="#fff" />
        </svg>
      ) : null}
      <div className="relative">{children}</div>
    </section>
  )
}
