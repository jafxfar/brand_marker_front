import Link from "next/link"
import { BadgeCheck, Flag, ShieldCheck, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PublicSupplier } from "@/types"
import { createRfqHref } from "@/lib/create-rfq-href"
import { loginRedirect, performerUrl } from "@/lib/marketplace-routes"

type CatalogItemBuyCardProps = {
  itemId: number
  supplier: PublicSupplier
  isAuthenticated: boolean
  canReport: boolean
  onReport: () => void
}

export const CatalogItemBuyCard = ({
  itemId,
  supplier,
  isAuthenticated,
  canReport,
  onReport,
}: CatalogItemBuyCardProps) => {
  const verified = supplier.verification_status === "verified"
  const rfqHref = createRfqHref({
    service: itemId,
    supplierId: supplier.actor_id,
  })

  return (
    <aside className="rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)] lg:sticky lg:top-[88px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12.5px] text-mute">Поставщик</p>
          <Link
            href={performerUrl(supplier.actor_id)}
            className="mt-0.5 inline-flex max-w-full items-center gap-1 font-semibold text-ink underline decoration-line underline-offset-2 hover:decoration-ink"
          >
            <span className="truncate">{supplier.display_name}</span>
            {verified && (
              <BadgeCheck size={16} className="shrink-0 text-brand-600" aria-hidden="true" />
            )}
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-sm font-semibold">
          <Star size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
          {supplier.rating.toFixed(1)}
          <span className="font-normal text-mute">
            ({supplier.reviews_count})
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-brand-50/60 p-3 text-[13px] text-ink/80">
        <div className="flex items-center gap-2 font-semibold text-brand-700">
          <ShieldCheck size={16} aria-hidden="true" />
          Покупка под защитой
        </div>
        <p className="text-mute">
          Оплата удерживается банком‑партнёром до вашей приёмки.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <Button asChild className="w-full">
          <Link href={rfqHref}>Купить с гарантией</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href={rfqHref}>Запросить цену</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href={performerUrl(supplier.actor_id)}>Профиль поставщика</Link>
        </Button>
        {canReport &&
          (isAuthenticated ? (
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-full text-muted-foreground"
              onClick={onReport}
              aria-label="Пожаловаться на позицию"
            >
              <Flag aria-hidden="true" />
              Пожаловаться
            </Button>
          ) : (
            <Button asChild variant="ghost" className="h-10 w-full text-muted-foreground">
              <Link href={loginRedirect(`/services/${itemId}`)}>
                <Flag aria-hidden="true" />
                Пожаловаться
              </Link>
            </Button>
          ))}
      </div>
    </aside>
  )
}
